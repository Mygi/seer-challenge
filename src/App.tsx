import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'
import { AppointmentBookings } from './models/appointment-bookings';


export const App = () => {
  const [bookings, setBookings] = useState<AppointmentBookings[]>([])
  // throw exception if undefined
  const url =  process.env.REACT_APP_BOOKINGS_URL === undefined ? '' : process.env.REACT_APP_BOOKINGS_URL;
  
  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then(setBookings, (reason: unknown) => console.error('Network Error'))
  }, [])

  const onDrop = (files: unknown) => {
    console.log(files)
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
        {bookings.map((booking, i) => {
          const date = new Date(booking.time)
          const duration = booking.duration / (60 * 1000)
          return (
            <p key={i} className='App-booking'>
              <span className='App-booking-time'>{date.toString()}</span>
              <span className='App-booking-duration'>
                {duration.toFixed(1)}
              </span>
              <span className='App-booking-user'>{booking.user_id}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}
