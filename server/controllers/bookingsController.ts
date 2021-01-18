import { Controller, Get } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
// Syntax requires esModuleInterop set to true in tslint
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppointmentBooking } from '../../src/models/appointment-bookings';
import * as fs from 'fs';
import { ServerBookings } from 'models/sever-bookings';

/**
 * Controlelr for handling postMany and GetAll requests for Appoointments
 * Retrieves initial data from a json file
 */
@Controller('bookings')
export class BookingsController {

    public static readonly SUCCESS_MSG = 'SUCCESS';
    private bookings: AppointmentBooking[] = [];
    constructor() {
        this.bookings = JSON.parse(fs.readFileSync('./server/bookings.json').toString()).map(
            (bookingRecord: ServerBookings) => new AppointmentBooking(
              {
                  time:  bookingRecord.time,
                  duration: bookingRecord.duration,
                  userId: bookingRecord.user_id,
            }),
          )
    }
    @Get()
    public getBookings(req: express.Request, res: express.Response) {
        try {            
            return res.status(StatusCodes.OK).json(  this.bookings );
        } catch (err) {
            Logger.Err(err, true);
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: err.message,
            });
        }
    }
}

export default BookingsController;