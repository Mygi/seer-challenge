export interface AppointmentBookings {
    // minutes
    duration: number;
    // looks like a number but the pre-ceding zeroes mauy matter
    user_id: string;
    // Date with timezone expected
    time: Date;
}