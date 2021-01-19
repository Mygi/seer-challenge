import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'
import { AppointmentBooking } from './models/appointment-bookings';
import { fetchBookings, GetFirstBooking, histogramMerge, MapJsonData, ReadBookingsFromCsvFiles, saveBookings } from './services/bookings-functions';
import { Scheduler, SchedulerDataChangeEvent, SchedulerItem, SchedulerItemProps, TimelineView, WeekView } from '@progress/kendo-react-scheduler';


export const App = () => {
  const [bookings, setBookings] = useState<AppointmentBooking[]>([]);
  const [defaultDate, setDefaultDate] = useState<Date>(new Date(2020, 2, 1));
  // throw exception if undefined
  const url =  process.env.REACT_APP_BOOKINGS_URL === undefined ? '' : process.env.REACT_APP_BOOKINGS_URL;
  
  // need an error dialog
  useEffect(() => {
    fetchBookings().then((results) => {
      setBookings(results);
      setDefaultDate( GetFirstBooking(results))
      }, (reason: unknown) => console.error('Network Error'))
  }, [])

  const onDrop = (files: File[]) => {
    // to move and test
    ReadBookingsFromCsvFiles(files).then( results => {
      const checkResults = histogramMerge(bookings, results, 30);
      saveBookings(checkResults.validBookings).then( (updated) => {
        setBookings( updated.concat( checkResults.conflictBookings.map( invalid => {
                                                                                    invalid.color = 'Red';
                                                                                    return invalid;
                                                                      })) );
        setDefaultDate(GetFirstBooking(updated) );
      })
    });    
  }
  
  const handleDataChange = (event: SchedulerDataChangeEvent) => {
    console.log( event );
  }
  const CustomItem = (props: SchedulerItemProps) => (
    <SchedulerItem
        {...props}
        style={{
            ...props.style,
            background: `${props.dataItem.color})`
        }}
      className={'confirmed'}
    />)
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
              item={CustomItem}           
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
