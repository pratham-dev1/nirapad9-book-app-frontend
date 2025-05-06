import dayjs from 'dayjs'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BackArrowIcon from '../styles/icons/BackArrowIcon'

const getCustomEventTitle = (type: string) => {
  switch (type) {
    case "create_event":
      return "New Event Added";
    case "cancel_event":
      return "Event Canceled";
    case "cancel_request_event":
      return "Event Cancellation Requested";
    case "reminder":
      return "Reminder";
    default:
      return "New Notification";
  }
};

const EventDetails = () => {
  const data = useLocation()
  const navigate = useNavigate();

  console.log(data)
  return (
    <div className='page-wrapper top_algn-clr-mode'>
      <h1>
        <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
        Notifications
      </h1>
      <div className='card-box'>
        <div className='d-flex justify-between'>
          <div className='w-80'>
            <h2 className='mt-0'>{getCustomEventTitle(data?.state?.type)}</h2>
            <h4>{data?.state?.description}</h4>
          </div>
          <h4 className='mt-0'>Datetime: {`${dayjs(data?.state?.datetime).format('DD-MM-YYYY')} ${dayjs(data?.state?.datetime).format('h:mm A')}`}</h4>
        </div>
        
        
        
      </div>
    </div>
    
  )
}

export default EventDetails