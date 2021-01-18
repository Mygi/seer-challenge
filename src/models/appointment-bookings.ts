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
    time: Date;
}

export class AppointmentBooking implements IAppointmentBookings {
    duration: number;
    userId: string;
    time: Date;

    constructor(mapped: AppointmentBookingsCsv) {
        this.duration = +mapped?.duration;
        this.time = new Date(Date.parse(mapped.time));
        this.userId = mapped.userId;
    }
    

}