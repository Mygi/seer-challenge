import { ParseResult } from 'papaparse';
import { AppointmentBookingsCsv } from '../models/appointment-bookings';
import { bookingsToHistogram, createRange, fetchBookings, findNearestBin, histogramMerge, MapCsvData, ReadBookingFromSingleCsvFile, ReadBookingsFromCsvFiles } from './bookings-functions';
import fs from 'fs';

export const mockParseData: ParseResult<AppointmentBookingsCsv>  = {
    data: [
        {
            duration: '180',
            time: '01 Mar 2020 11:00:00 GMT+1000',
            userId: '001',
        },
        {
            duration: '240',
            time: '02 Mar 2020 11:00:00 GMT+1000',
            userId: '001'
        },
        {
            duration: '300',
            time: '03 Mar 2020 11:00:00 GMT+1000',
            userId: '001'
        },
        {
            duration: '360',
            time: '04 Mar 2020 11:00:00 GMT+1000',
            userId: '002'
        }
    ],
    errors: [],
    meta: {
        delimiter: ', ',
        linebreak: '\n',
        aborted: false,
        truncated: false,
        cursor: 1
    }
};


describe('bookings-functions', () => { 
    it('should map a list of bookings', () => {
        const output = MapCsvData(mockParseData);
        expect(output.length).toEqual(4);
    });
    it('should filter out an invalid list of bookings', () => {        
        mockParseData.data.push( {
            duration: 120,
            time: 'help',
            userId: '001'
        })
        const output = MapCsvData(mockParseData);
        expect(output.length).toEqual(4);

        mockParseData.data.push( {
            duration: 'testStr',
            time: '03 Mar 2020 11:00:00 GMT+1000',
            userId: '001'
        })
        const output2 = MapCsvData(mockParseData);
        expect(output2.length).toEqual(4);
    });
    it('should convert a valid csv file to bookings', (done) => {        
        expect.assertions(8);
        const file = new File( [fs.readFileSync('./bookings.csv', 'utf-8')], 'bookings.csv') ;
        ReadBookingFromSingleCsvFile(file).then( result => {
            expect(result.length).toEqual(8);
            expect(result[0].duration).toEqual(300);
            // NB 0 offset on Months
            expect(result[0].time.getMonth()).toEqual(2);
            expect(result[0].userId).toEqual('0001');
            expect(result[0].duration).toEqual(300);
            // NB 0 offset on Months
            expect(result[7].time.getFullYear()).toEqual(2020);
            expect(result[7].duration).toEqual(180);
            expect(result[7].userId).toEqual('0003');
            done();
        });
    });
    it('should convert a valid set of csv files to bookings', (done) => {        
        expect.assertions(11);
        // just a doubled file - whcih will ned to be sync
        const file1 = new File( [fs.readFileSync('./bookings.csv', 'utf-8')], 'bookings.csv') ;
        const file2 = new File( [fs.readFileSync('./bookings.csv', 'utf-8')], 'bookings.csv') ;
        const files = [file1, file2];
        ReadBookingsFromCsvFiles(files).then( result => {
            expect(result.length).toEqual(16);
            expect(result[0].duration).toEqual(300);
            // NB 0 offset on Months
            expect(result[0].time.getMonth()).toEqual(2);
            expect(result[0].userId).toEqual('0001');
            expect(result[0].duration).toEqual(300);
            // NB 0 offset on Months
            expect(result[7].time.getFullYear()).toEqual(2020);
            expect(result[7].duration).toEqual(180);
            expect(result[7].userId).toEqual('0003');

            expect(result[15].time.getFullYear()).toEqual(2020);
            expect(result[15].duration).toEqual(180);
            expect(result[15].userId).toEqual('0003');
            done();
        });
    });
    it.each([
        [4, 20, 30, true, 4, 0],
        [4, 20, 30, false, 4, 30],
        [4, 50, 30, false, 5, 0],
        [4, 50, 5, true, 4, 50],
        [4, 53, 5, false, 4, 55],
        [4, 53, 5, true, 4, 50]
        ])('should find the nearest booking interval', (hour: number, minute: number, interval: number, isStart: boolean, resultHours: number, resultMinutes: number) => {
        const date = new Date(2020, 3, 1, hour, minute);
        const bin = findNearestBin(date, interval, isStart);
        const binDate = new Date(bin);
        expect(binDate.getMinutes()).toEqual(resultMinutes);
        expect(binDate.getHours()).toEqual(resultHours);
    });
    it.each([
        [100, 500, 20, 21],
        [100, 500, 50, 9]
        ]
    )('should create a range of intervals from start to end inclusive', (start: number, end: number, interval, result) => {
        const range = createRange(start, end, interval);
        expect(range.length).toEqual(result);
        expect(range[0]).toEqual(start);
        expect(range[range.length -1]).toEqual(end);
    });
    it.each([
        [30, 40],
        [20, 58],
        [10, 112]
        ]
    )('should convert a array to histogram', (interval: number, bins: number) => {   
        const output = MapCsvData(mockParseData);
        const hist = bookingsToHistogram(output, interval);
        expect(hist.size).toEqual(bins);
    });
    it('should detect non-conflicting items on merge', (done) => {
        const output = MapCsvData(mockParseData);
        expect.assertions(2);
        // just a doubled file - whcih will ned to be sync
        const file1 = new File( [fs.readFileSync('./bookings.csv', 'utf-8')], 'bookings.csv') ;
        ReadBookingFromSingleCsvFile(file1).then( result => {
            const merged = histogramMerge(output, result, 30);            
            expect(merged.validBookings.length).toEqual(3);            
            expect(merged.conflictBookings.length).toEqual(5);
            done();
        });
    });
    
})
