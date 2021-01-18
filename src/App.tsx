import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'
import { AppointmentBooking } from './models/appointment-bookings';
import { GetFirstBooking, MapJsonData, ReadBookingsFromCsvFiles } from './services/bookings-functions';
import { Scheduler, SchedulerDataChangeEvent, TimelineView, WeekView } from '@progress/kendo-react-scheduler';


export const App = () => {
  const [bookings, setBookings] = useState<AppointmentBooking[]>([])
  // throw exception if undefined
  const url =  process.env.REACT_APP_BOOKINGS_URL === undefined ? '' : process.env.REACT_APP_BOOKINGS_URL;
  let defaultDate = new Date(2020, 2, 1);
  // need an error dialog
  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => setBookings(MapJsonData(data)), (reason: unknown) => console.error('Network Error'))      
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
                defaultDate={defaultDate}
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
                <TimelineView showWorkHours={true} title="Timeline" />
                {/* Disable current time */}
                <WeekView title="Week"
            />
            </Scheduler>       
      </div>
    </div>
  )
}
