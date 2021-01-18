import { AppointmentBooking, AppointmentBookingsCsv, IAppointmentBookings } from '../models/appointment-bookings';
import { parse, ParseResult } from 'papaparse';

/**
 * Filter out invalid bookings and then map the model to our View Model
 * @param result 
 */
export function MapCsvData(result: ParseResult<AppointmentBookingsCsv>): AppointmentBooking[] {
    return result.data
                 .filter( x => x.duration !== undefined && !isNaN(+x.duration) && x.time !== undefined && !isNaN(Date.parse(x.time)) )
                 .map( (row) => new AppointmentBooking(row) );        
}

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
    console.log(output);
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
    
    const dates = bookings.map( x => Date.parse(x.time.toString()));    
    const start = Math.min.apply(null, dates);
    console.log(new Date(start));
    return new Date(start);
}