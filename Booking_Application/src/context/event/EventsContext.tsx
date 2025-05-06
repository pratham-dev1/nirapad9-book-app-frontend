import React, { createContext, ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import { useQuery } from 'react-query';
import request from '../../services/http';
import { GET_CALENDAR_EVENTS, GET_USER_EMAILS } from '../../constants/Urls';
import { AuthContext } from '../auth/AuthContext';
import dayjs from 'dayjs';
import showToast from '../../utils/toast';
import { ToastActionTypes } from '../../utils/Enums';

interface EventsContextProps {
  eventsData: any[];
  emailData: any[];
  selectedEmails: any[];
  setSelectedEmails: any;
  selectedCalendars: any;
  setSelectedCalendars: any;
}

export const EventsContext = createContext<EventsContextProps>({ eventsData: [], emailData: [], selectedEmails: [], setSelectedEmails: () => { }, selectedCalendars: [], setSelectedCalendars: () => { } });
const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state } = useContext(AuthContext);
  const [selectedEmails, setSelectedEmails] = useState<any[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['google','microsoft']);

  const { data: emailData }: any = useQuery(['user-emails'], () => request(GET_USER_EMAILS), {
    enabled: (Boolean(state.userId) && (state.userType != 3 && state.userType != 5) ),
    select: ({ data }) => {
      const emails = []
      if (data?.email) emails.push({ email: data.email, emailServiceProvider: data.emailServiceProvider })
      if (data?.email2) emails.push({ email: data.email2, emailServiceProvider: data.email2ServiceProvider })
      if (data?.email3) emails.push({ email: data.email3, emailServiceProvider: data.email3ServiceProvider })
      return emails
    } 
  })

  const { data: eventsData } = useQuery(['events', selectedEmails, selectedCalendars], () => request(GET_CALENDAR_EVENTS, 'get', { emails: selectedEmails?.map((item: any) => item?.email), calendars: selectedCalendars  }), {
    enabled: Boolean(state.userId) && state.userType != 3 && state.userType != 5 && selectedEmails?.length > 0,
    // refetchInterval: 180000, // 3 minutes
    keepPreviousData: true,
    select: (data) => {
      const DATA = data.data?.map((item: any) => {
        return {
          title: item.title,
          start: dayjs(item.startTime).toDate(),
          end: dayjs(item.endTime).toDate(),
          meetingLink: item.meetingLink,
          // color: item.emailAccount === item.user?.email ? item.user?.colorForEmail1?.color : item.emailAccount === item.user?.email2 ? item.user?.colorForEmail2?.color : item.emailAccount === item.user?.email3 ? item.user?.colorForEmail3?.color : 'yellow'
          // color: item.emailAccount === item.userEmail ? item.colorForEmail1 : item.emailAccount === item.userEmail2 ? item.colorForEmail2 : item.emailAccount === item.userEmail3 ? item.colorForEmail3 : 'yellow'
          color: item.eventColor,
          isDeleted: item.isDeleted,
          isCancelled: item.isCancelled
        }
      })
      return { data: DATA, failedEmails: data.failedEmails }
    },
    onSuccess: (data) => {
      console.log(data)
      if (data?.failedEmails.length > 0) {
        const message = `Event fetching fails for emails- \n ${data?.failedEmails.map((item: any) => `${item} \n`)}`
        showToast(ToastActionTypes.ERROR, message)
      }
    }
  });

  useEffect(() => {
    if (emailData?.length > 0) {
      setSelectedEmails(emailData)
    }
  }, [emailData])

  return (
    <EventsContext.Provider value={{ eventsData: eventsData?.data || [], emailData, selectedEmails, setSelectedEmails, selectedCalendars, setSelectedCalendars }}>
      {children}
    </EventsContext.Provider>
  );
};

export default EventsProvider;
