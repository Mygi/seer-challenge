# Booking Uploader

A web app for uploading bookings from `.csv` files.

## Existing code

### Overview

Existing functionality:

- ExpressJS server with `GET` endpoint `/bookings` which responds with existing bookings (from a hard-coded json file that is read in). Bookings have a time, duration, and user ID.
- ReactJS app which fetches and shows existing bookings in a list and has a file input for bookings files (`.csv` only).
- A `.csv` file with entries corresponding to bookings that is to be uploaded but which contains bookings that overlap with some of the existing bookings.

Vintage React?

We have a branch called `hooks` with a more modern version of the main App component. Feel free to use whichever version you find more comfortable.

### Instructions for use

- To install dependencies: `yarn install`
- To run ExpressJS server: `yarn run server`
- To run ReactJS app: `yarn start`

Note: This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Additional required features

What needs to be added / changed:

- The app needs to read and parse the provided `.csv` file when submitted via the file input (dropzone).
- The app needs to identify new bookings parsed from this file that overlap with existing bookings.
- The app needs to visualise the existing bookings in a timeline instead of a list (i.e. as segments that are positioned based on their start time and have a width based on their duration).
- The app needs to show a similar timeline for the new bookings parsed from the file that shows which new bookings overlap with existing bookings (perhaps colour these bookings differently).
- The app needs to make a `POST` request (`/bookings`) to the server to add the new bookings that don't overlap with existing bookings and refetch the list of bookings from the server.
- The server needs to allow this `POST` request (`/bookings`) from app and update the booking list it has in memory (and therefore the list it returns for the existing `GET` request). There is no need to modify the server to use an actual database instead of storing the data in memory.

Feel free to change any of the existing code (and add any dependencies) to achieve the required specifications / functionality. There is no need to support old browsers, assume a recent version of Firefox/Chrome. If you're having trouble starting or need help with any part, please send us an email and we'll give you a pointer.

## Added Dependencies

Migrated the client and server to typescript and set up jest testing for both systems. I have also added a number of common extensions, this is the updated list:
*Typescript*
* typescript and @types/node (version 4.1.3)
* eslint with prettier (v7.18 and v2.2.1)
* ts-node (v9.1.1)

*API*
* overnightjs abd @types/overnightjs for the API
* @types/cors and @types/express
* nodemon for watch tasks (v2.0.7)
* http-status-codes (v2.1.4)

*Testing*
* @types/jest (v26.0.20)
* ts-jest (v26.4.4)
* supertest (v6.1.1)

*Client*
* @types/react (v17.0.0)
* papaparse (v5.3.0) and @types/papaparse (for CSV parsing)
* moment (v2.29.1) for date functions
* lodash (v4.17.20) for uniqueId and intersections
* @progress/kendo-react-scheduler (v4.3.0) and required dependenices for the timeline function

