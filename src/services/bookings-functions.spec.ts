import { ParseResult } from 'papaparse';
import { AppointmentBookingsCsv } from '../models/appointment-bookings';
import { MapCsvData, ReadBookingFromSingleCsvFile, ReadBookingsFromCsvFiles } from './bookings-functions';
import fs from 'fs';
export const mockParseData: ParseResult<AppointmentBookingsCsv>  = {
    data: [
        {
            duration: '180',
            time: '01 Mar 2020 11:00:00 GMT+1000',
            userId: '001'
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
            time: '01 Mar 2020 11:00:00 GMT+1000',
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
})
