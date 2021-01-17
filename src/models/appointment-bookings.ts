export interface AppointmentBookingsCsv {
    // minutes
    duration: string;
    // looks like a number but the pre-ceding zeroes mauy matter
    userId: string;
    // Date with timezone expected
    time: string;
}

export interface AppointmentBookings {
    // minutes
    duration: number;
    // looks like a number but the pre-ceding zeroes mauy matter
    userId: string;
    // Date with timezone expected
    time: Date;
}