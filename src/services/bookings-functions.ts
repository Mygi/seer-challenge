import { AppointmentBooking, AppointmentBookingsCsv, IAppointmentBookings } from '../models/appointment-bookings';
import { parse, ParseResult } from 'papaparse';
import _uniqueId from 'lodash/uniqueId';
/**
 * Filter out invalid bookings and then map the model to our View Model
 * @param result 
 */
export function MapCsvData(result: ParseResult<AppointmentBookingsCsv>): AppointmentBooking[] {
    return result.data
                 .filter( x => x.duration !== undefined && !isNaN(+x.duration) && x.time !== undefined && !isNaN(Date.parse(x.time)) )
                 .map( (row) => new AppointmentBooking(row) );        
}

/**
 * 
 * @param data 
 */
export function MapJsonData(data: IAppointmentBookings[]): AppointmentBooking[] {
    const output = data.filter( x => x.duration !== undefined && !isNaN(+x.duration) && x.time !== undefined )
                .map( (row) => {
                    const booking = new AppointmentBooking({
                    duration: row.duration,
                    time: row.time.toString(),
                    userId: row.userId
                    });
                    booking.id = row.id;
                    return booking;
                 } );         
    return output;
}

/**
 * Process a single csv file and return the list of Bookings.
 * @param file 
 */
export function ReadBookingFromSingleCsvFile(file: File): Promise<AppointmentBooking[]> {
    return new Promise( (resolve, reject) => parse(file, {
            header: true,
            delimiter: ", ", // maybe quotes are better
            // dynamicTyping: true, this works but the user loses its preceeding 0s which may be required.
            complete: (result: ParseResult<AppointmentBookingsCsv>) => resolve(MapCsvData(result)),
            error (err, file) { reject(err) }
       }));
}

/**
 * Process a list of files and return a promise to an array of AppointmentBookings
 * @param files 
 */
export function ReadBookingsFromCsvFiles(files: File[]): Promise<AppointmentBooking[]> {
    // to move and test
    const promises: Promise<AppointmentBooking[]>[] = []
    files.forEach( file => promises.push( ReadBookingFromSingleCsvFile(file) ));
    return Promise.all(promises).then( bookings => bookings.reduce( (arr, row) => arr.concat(row),[] ));
    // how should we handle error?  Don't catch and pass it forwards?
}
    
/**
 * Get the earliest date from a list
 * @param bookings 
 */
export function GetFirstBooking(bookings: AppointmentBooking[]): Date {
    if(bookings.length === 0) {        
        return new Date(Date.now());
    }
    const start = Math.min.apply(null, bookings.map( x => Date.parse(x.time.toString())));
    return new Date(start);
}

/**
 * Dind nearest interval slot
 * @param date 
 * @param minDurationMinutes 
 * @param isStart 
 */
export function findNearestBin(date: Date, minDurationMinutes: number, isStart: boolean): number {
    
    const binnedMinutes = isStart ? Math.floor(date.getMinutes() / minDurationMinutes) 
                                  : Math.ceil(date.getMinutes() / minDurationMinutes) ;
    return new Date(date).setMinutes(binnedMinutes * minDurationMinutes);
}

/**
 * Create a range of slot intervals in a scheudle
 * @param start 
 * @param end 
 * @param interval 
 */
export function createRange(start: number, end: number, interval: number): number[] {
    const bins: number[] = []; 
    for( let i = start; i <= end; i= i + interval ) {
        bins.push(i);
    }
    return bins;
     
}

/**
 * Creare a set of valid slots for scheduling and assign values
 * @param bookings 
 * @param minDurationMinutes 
 */
export function bookingsToHistogram(bookings: AppointmentBooking[], minDurationMinutes: number): Map<number, string[]> {
    const histogram = new Map<number, string[]>();
    // ideally push
    bookings.forEach( booking => {
        const startBin = findNearestBin(booking.start, minDurationMinutes, true );
        const endBin = findNearestBin(booking.end, minDurationMinutes, false );
        const bins = createRange(startBin, endBin, minDurationMinutes * 60 * 1000);     
        bins.forEach( bin => {
            if(histogram.has(bin)) {
                histogram.get(bin)?.push( booking.uniqueId )
            } else {                
                histogram.set(bin, [booking.uniqueId]);
            }
        });
    });
    return histogram;
} 
/**
 * The root solution for single track branch and bound
 * Will return a list of new bookings that can and cannot be saved
 * @param validbookings 
 * @param newBookings 
 * @param minDurationMinutes 
 */
export function histogramMerge(existingBookings: AppointmentBooking[], newBookings: AppointmentBooking[], minDurationMinutes: number): { validBookings: AppointmentBooking[], conflictBookings: AppointmentBooking[] } {
    
    // ideally keep this in state
    const leftHistogram: Map<number, string[]> = bookingsToHistogram(existingBookings, minDurationMinutes);        
    let conflictBookings: AppointmentBooking[] = [];
    let validBookings: AppointmentBooking[] = [];
    
    // sort by duration, than attempt to fit each item into the running histogram
    newBookings.sort( (x, y) => y.duration - x.duration)
               .forEach( booking => {
                const bins = createRange(findNearestBin(booking.start, minDurationMinutes, true ),
                                        findNearestBin(booking.end, minDurationMinutes, false ),
                                        minDurationMinutes * 60 * 1000);
                if(!bins.find( x => leftHistogram.has(x))) {
                    // Add Valid
                    validBookings.push(booking);
                    // Extend histogram by prority
                    bins.forEach( bin => leftHistogram.set(bin, [booking.uniqueId]))
                } else {
                    conflictBookings.push(booking);
                    // The potential optimisation is a block shift to closest free space in the histogram
                    // repeat until all optimised
                    // branch on various priorities and reduce
                }
    });
    return {
        validBookings,
        conflictBookings
    };
}

/**
 * POST a list of bookings to the API
 * @param bookings 
 */
export function saveBookings(bookings: AppointmentBooking[]): Promise<AppointmentBooking[]> {
    const url =  process.env.REACT_APP_BOOKINGS_URL === undefined ? '' : process.env.REACT_APP_BOOKINGS_URL;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookings)
    };
    return fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => MapJsonData(data));
}

/**
 * retrieve and map server results
 */
export function fetchBookings(): Promise<AppointmentBooking[]> {
    const url =  process.env.REACT_APP_BOOKINGS_URL === undefined ? '' : process.env.REACT_APP_BOOKINGS_URL;
    return fetch(url)
      .then((response) => response.json())
      .then((data) => MapJsonData(data));
}