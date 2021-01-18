import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'
import { AppointmentBooking } from './models/appointment-bookings';
import { GetFirstBooking, ReadBookingsFromCsvFiles } from './services/bookings-functions';
import { Scheduler, SchedulerDataChangeEvent, TimelineView } from '@progress/kendo-react-scheduler';


export const App = () => {
  const [bookings, setBookings] = useState<AppointmentBooking[]>([])
  // throw exception if undefined
  const url =  process.env.REACT_APP_BOOKINGS_URL === undefined ? '' : process.env.REACT_APP_BOOKINGS_URL;
  let defaultDate = new Date(Date.now());
  // need an error dialog
  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then(setBookings, (reason: unknown) => console.error('Network Error'))
      .then(() => defaultDate = GetFirstBooking(bookings))
  }, [])

  const onDrop = (files: File[]) => {
    // to move and test
    ReadBookingsFromCsvFiles(files).then( results => {
      setBookings( bookings.concat(results));
      defaultDate = GetFirstBooking(bookings);
    });    
  }
  
  const handleDataChange = (event: SchedulerDataChangeEvent) => {
    console.log( event );
  }
  return (
    <div className='App'>
      <div className='App-header'>
        <Dropzone accept='.csv' onDrop={onDrop}>
          Drag files here
        </Dropzone>
      </div>
      <div className='App-main'>
        <p>Existing bookings:</p>
        <Scheduler
                data={bookings}
                defaultDate={new Date()}
                onDataChange={handleDataChange}     
                editable={{
                  add: false,
                  remove: false,
                  drag: true,
                  resize: true,
                  edit: true,
                  select: true
              }}           
            >
                <TimelineView showWorkHours={false} title="Default" />
                {/* Disable current time */}
                <TimelineView showWorkHours={false} title="Disabled" name="disabled" currentTimeMarker={false} />
            </Scheduler>
        {bookings.map((booking, i) => {
          const date = new Date(booking.time)
          const duration = booking.duration 
          return (
            <p key={i} className='App-booking'>
              <span className='App-booking-time'>{date.toString()}</span>
              <span className='App-booking-duration'>
                {duration.toFixed(1)}
              </span>
              <span className='App-booking-user'>{booking.userId}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}
