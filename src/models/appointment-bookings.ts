import moment from 'moment';
import _uniqueId from 'lodash/uniqueId';

export interface AppointmentBookingsCsv {
    // minutes
    duration: string | number;
    // looks like a number but the pre-ceding zeroes mauy matter
    userId: string;
    // Date with timezone expected
    time: string;
}

export interface IAppointmentBookings {
    // minutes
    duration: number;
    // looks like a number but the pre-ceding zeroes mauy matter
    userId: string;
    // Date with timezone expected
    time: Date | string;
    id: number;
}

export class AppointmentBooking implements IAppointmentBookings {
    duration: number;
    userId: string;
    time: Date;
    start: Date;
    end: Date;
    // id = 0 means unsaved in API
    id = 0;
    conflicts = false;
    title = '';
    uniqueId = _uniqueId();

    constructor(mapped: AppointmentBookingsCsv) {
        this.duration = +mapped?.duration;
        this.time = new Date(Date.parse(mapped.time));
        this.userId = mapped.userId;
        this.start = this.time;
        this.title = `Event Id: ${this.uniqueId} (User: ${this.userId})`;
        this.end = moment(this.time).add(this.duration, "m").toDate();
    }
    

}