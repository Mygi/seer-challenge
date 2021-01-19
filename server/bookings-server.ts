import { Server } from '@overnightjs/core';
//import * as cors from 'cors';
// requires will work with CORS in spi
var cors = require('cors')
import BookingsController from './controllers/bookingsController';
import express from 'express';

export class BookingsServer extends Server {

    constructor() {
        super(true);
        this.app.use(cors());
        this.app.use(express.json());
        super.addControllers(new BookingsController());
    }

    start(port: number): void {
        this.app.listen(port, () => {            
        });
    }
}