import { BookingsServer } from "./bookings-server";

let server = new BookingsServer();
if(!!process.env.API_PORT && !isNaN(+process.env.API_PORT) ) {
    server.start(+process.env.API_PORT);
} else {
    // default
    server.start(3001);
}
