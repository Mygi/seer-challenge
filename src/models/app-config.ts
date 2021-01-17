export interface AppplicationConfiguration {
    apiBaseUrl: string;
    bookingsUrl: string;
}
export class AppConfig implements AppplicationConfiguration {
    public readonly apiBaseUrl = 'http://localhost:3001';
    public readonly bookingsUrl = `${this.apiBaseUrl}/bookings`;
}