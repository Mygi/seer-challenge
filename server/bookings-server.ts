import { Server } from '@overnightjs/core';
//import * as cors from 'cors';
// requires will work with CORS in spi
var cors = require('cors')
import BookingsController from './controllers/bookingsController';

export class BookingsServer extends Server {

    constructor() {
        super(true);
        this.app.use(cors());
        super.addControllers(new BookingsController());
    }

    public start(port: number): void {
        this.app.listen(port, () => {            
        });
    }
}