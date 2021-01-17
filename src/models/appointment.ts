export interface Appointment {
    // minutes
    duration: number;
    // looks like a number but the pre-ceding zeroes mauy matter
    userId: string;
    // Date with timezone expected
    time: Date;
}