import { BookingsServer } from '../bookings-server';
const request = require('supertest');


describe('GET /bookings', function() {
    it('responds with json', function(done) {
      request((new BookingsServer()).app)
        .get('/bookings')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)   
        .expect(200, done);
    });   
  });
