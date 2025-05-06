import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/auth/AuthContext';
import dayjs from 'dayjs';

const Clock = () => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: default_timeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: default_timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  return (
    <div className='current-time'>
      <span className='mr-10'>{formatDate(currentDateTime)}</span>
      <span className='mr-10'>{formatTime(currentDateTime)}</span>
      <span className='mr-10'>{default_timeZone}</span>
    </div>
  )
}

export default Clock
