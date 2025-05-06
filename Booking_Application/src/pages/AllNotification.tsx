import React from 'react';
import { useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from 'react-query';
import request from "../services/http";
import { DELETE_BOOKED_OPEN_AVAILABILITY, GET_EVENT_DETAILS, GET_NOTIFICATIONS, READ_NOTIFICATION, UPDATE_BOOKED_OPEN_SLOT } from "../constants/Urls";
import { Link, NavLink, useNavigate } from "react-router-dom";
import EvntCrtIcon from '../styles/icons/EvntCrtIcon';
import CancelEvntIcon from '../styles/icons/CancelEvntIcon';
import CancelRequestIcon from '../styles/icons/CancelRequestIcon';
import { Alarm } from '@mui/icons-material';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { queryClient } from "../config/RQconfig";
import BackArrowIcon from '../styles/icons/BackArrowIcon';
import { AuthContext } from '../context/auth/AuthContext';
import moment from 'moment-timezone';
import { socket } from '../utils/Socket';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import EditEvent from './EditEvent';
import RespondInvite from './RespondInvite';
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from '../components/CustomButton';
import WarningIcon from '../styles/icons/WarningIcon';
import showToast from '../utils/toast';
import { ToastActionTypes } from '../utils/Enums';
import EditAvailabilityRespondInvite from './talentpartner/EditAvailabilityRespondInvite';
import NotificationsIcon from "@mui/icons-material/Notifications";
import { ThemeContext } from '../context/theme/ThemeContext';


const getNotificationIcon = (type: string) => {
  switch (type) {
    case "create_event":
      return <EvntCrtIcon />;
    case "cancel_event":
      return <CancelEvntIcon />;
    case "cancel_request_event":
      return <CancelRequestIcon />;
    case "reminder":
      return <Alarm />;
    case "propose_new_time":
      return <NotificationsIcon />;
    default:
      return <Alarm />;
  }
};

dayjs.extend(relativeTime);

const formatNotificationTime = (datetime: string) => {
  return dayjs(datetime).fromNow();
};

const removeDuplicatesObject = (data: any[]) => {
  return Array.from(
    new Map(                                                      
      data?.map((obj: any) => {
        // Create a key ignoring `id` and `createdAt`
        const { id, createdAt, ...rest } = obj;
        return [JSON.stringify(rest), obj];
      })
    ).values()
  )
}


const AllNotifications = () => {
  const navigate = useNavigate()
  const { state } = useContext(AuthContext);
  const { state: stateTheme } = useContext(ThemeContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, SetNotifications] = useState<any[]>([])
  const [formData, setFormData] = useState<any>()
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteDialogState, setDeleteDialogState] = useState<boolean>(false);
  const [singleDeleteState, setSingleDeleteState] = useState<{ id: number; booked: boolean }>()

  useEffect(() => {
    socket.on('SLOT_BOOKED_BY_RECRUITER', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('EVENT_CANCELLED_BY_RECRUITER', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('EVENT_CANCEL_REQUEST_OR_WITHDRAWN_REQUEST_BY_TP', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('OPEN_SLOT_EVENT_BOOKED', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('EVENT_NOTIFICATION', (data): void => {
      !data?.isNotificationDisabled && SetNotifications(notifications => removeDuplicatesObject([data, ...notifications]))
      queryClient.invalidateQueries('events')
      queryClient.invalidateQueries('upcomingEvents')
      queryClient.invalidateQueries('event-hub-history')
    });
    socket.on('PROPOSE_NEW_TIME', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    // Cleanup function to remove event listener when component unmounts
    return () => {
      socket.off('SLOT_BOOKED_BY_RECRUITER');
      socket.off('EVENT_CANCELLED_BY_RECRUITER')
      socket.off('EVENT_CANCEL_REQUEST_OR_WITHDRAWN_REQUEST_BY_TP')
      socket.off('OPEN_SLOT_EVENT_BOOKED')
      socket.off('EVENT_NOTIFICATION')
      socket.off('PROPOSE_NEW_TIME')
    };
  }, []);

  const formattedDatetime = (datetime: string) => {
    const newDatetime = dayjs(datetime).tz(default_timeZone);
    return `${dayjs(newDatetime).format('MMMM Do, YYYY')} at ${dayjs(newDatetime).format('h:mm A')} ${default_timeZone_abbr}`
  }

  const { data: notificationsData } = useQuery('notifications', () => request(GET_NOTIFICATIONS));

  useEffect(() => {
    if (notificationsData?.data) {
      SetNotifications(removeDuplicatesObject(notificationsData?.data))
    }
  }, [notificationsData])
  
  const { data: eventDetails } = useQuery(['event-details', formData?.eventId], () => request(`${GET_EVENT_DETAILS}/${formData?.eventId}`), {enabled: !!formData?.eventId})
  const event_details = eventDetails?.data || {}

  const { mutate: mutateReadNotification } = useMutation((body: object) => request(READ_NOTIFICATION, "put", body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('notifications');
      },
    })

  const handleReadNotification = (ids: number[], isRead: boolean, type: string, data: any) => {
    !isRead && mutateReadNotification({ids})
    if(type === "create_event" || type === "cancel_event" || type === "update_event") {
      setFormData({
        ...data,
        date: dayjs(data.datetime).tz(default_timeZone).format("DD-MM-YYYY"),
        time: dayjs(data.datetime).tz(default_timeZone).format("h:mm A"),
        booked: true,
        statusId: data?.openAvailabilityData?.statusId,
        receiverName: data?.openAvailabilityData?.receiverName,
        receiverEmail: data?.openAvailabilityData?.receiverEmail,
        id: data?.openAvailabilityId,
        comments: data?.openAvailabilityData?.comments
       })

       const isPastEvent = dayjs().tz(default_timeZone) > dayjs(data.datetime).tz(default_timeZone)
       if (isPastEvent) {
         return showToast(ToastActionTypes.ERROR, "You Can't Perform Actions on Past Events")
       }
       else {
         setAnchorEl(null)
         setOpenDialog(true)
       }
    }
  }

  const { mutate:deleteBookedOpenAvailability} = useMutation((body: object) => request(DELETE_BOOKED_OPEN_AVAILABILITY, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('open-availability-history');
      queryClient.invalidateQueries('notifications');
      showToast(ToastActionTypes.SUCCESS, data.message)
      setOpenDialog(false)
    },
  })

  const handleConfirmDelete = () => {
    deleteBookedOpenAvailability({ id: singleDeleteState?.id });
    setDeleteDialogState(false)
  }

  const getStyles = () => {
    if (stateTheme.theme === "thm-blue") {
      return {backgroundColor: '#e6f3ff'}
    }
    else if (stateTheme.theme === 'thm-orange') {
      return {backgroundColor: '#F9943B'}
    }
    else if (stateTheme.theme === "thm-green") {
      return {backgroundColor: '#45A3AB'}
    }
    else if (stateTheme.theme == "thm-light") {
      return {backgroundColor: 'orange'}
    }
  }

  return (
    <div className='page-wrapper top_algn-clr-mode'>
      <h1>
        <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
        All Notifications
      </h1>
      <div className='all-notification-list'>
        <ul>
          {notifications.map((item: any, index: number) => {
            if (item.type === "create_event" || item.type === "cancel_event" || item.type === "update_event") {
            return (
            <li 
              key={index} 
              className="notification-item pointer" 
              style={item.type === "cancel_event" ? {cursor: 'not-allowed', textDecoration: 'line-through', ...(item.isRead ? {} : getStyles())} : {...(item.isRead ? {} : getStyles())}}
              onClick={() => item.type === "cancel_event" ? () => '' : handleReadNotification([item.id], item.isRead, item.type, item)}
            >
              <span className="notification-icon">
                {getNotificationIcon(item.type)}
              </span>
              <div className="notification-details d-flex justify-between">
                <div className='w-85'>
                  <h4 className='evnt_tit'>{item.title} {item.source === 'open_availabilities' ? '(Open Availability)' : item.source === 'event_hub_events' ? '(Event Hub)' : '(Outside)'}</h4>
                  <p className="notification-dscrptn">{item.description} {formattedDatetime(item.datetime)}.</p>
                </div>
                <div className='ntfc_tme'>
                  <span>{formatNotificationTime(item.datetime)}</span>
                </div>
              </div>
              <div style={{float: 'right'}}>- {item.emailAccount}</div>
            </li>
          )}
          else if (item.type === 'propose_new_time') {
            return (
              <li 
                key={index} 
                className="notification-item pointer" 
                onClick={() => handleReadNotification([item.id], item.isRead, item.type, item)}
                style={item.isRead ? {} : getStyles()}
              >
                <span className="notification-icon">
                  {getNotificationIcon(item.type)}
                </span>
                <div className="notification-details d-flex justify-between">
                  <div className='w-85'>
                    <h4 className='evnt_tit'>{item.title} (Proposed New Time)</h4>
                    <p className="notification-dscrptn">{item.description} {formattedDatetime(item.datetime)}.</p>
                  </div>
                </div>
              </li>
            )
          }
          else if (item.type === 'reminder') {
            return <li 
                key={index} 
                className="notification-item pointer" 
                onClick={() => handleReadNotification([item.id], item.isRead, item.type, item)}
                style={item.isRead ? {} : getStyles()}
              >
                <span className="notification-icon">
                  {getNotificationIcon(item.type)}
                </span>
                <div className="notification-details d-flex justify-between">
                  <div className='w-85'>
                    <h4 className='evnt_tit'>{item.title}</h4>
                    <p className="notification-dscrptn">{item.description} {formattedDatetime(item.datetime)}.</p>
                  </div>
                </div>
              </li>
          }
        }
        )}
        </ul>

      </div>
      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="edit-event-popup"
      >
        <div className="popup-header">
          <h2>Edit Event</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
          {formData?.source === 'open_availabilities' ? <EditAvailabilityRespondInvite formData={{...formData, eventDurationInMinutes: event_details?.eventDurationInMinutes}} URL={UPDATE_BOOKED_OPEN_SLOT} setOpenDialog={setOpenDialog} setDeleteDialogState={setDeleteDialogState} setSingleDeleteState={setSingleDeleteState} notification={true} /> 
          : 
          <>
          {formData?.creator ? <EditEvent formData={{...formData, ...event_details}} setOpenDialog={setOpenDialog} /> 
          : <RespondInvite formData={{...formData, ...event_details, startTime: dayjs(event_details?.startTime).tz(default_timeZone).format("D MMMM YYYY, h:mm A")}} setOpenDialog={setOpenDialog} />
          }
          </>
}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogState}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="confirm-popup"
      >
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Delete Record?</span></h2>
          <CloseIcon onClick={() => setDeleteDialogState(false)} />
        </div>
        <DialogContent>
          <h3 className="text-center">Are you sure you want to delete the selected slot(s)?</h3> 
        </DialogContent>
        <DialogActions>
        <CustomButton
            onClick={handleConfirmDelete}
            color="primary"
            className="primary_btns"
            label="Delete"
        />
          {/* <CustomButton onClick={() => handleConfirmDelete()} color="primary" label="Confirm" /> */}
          <CustomButton
              onClick={() => {
                setDeleteDialogState(false)
              }}
              color="secondary"
              className="secondary_btns"
              label="Cancel"
          />  
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllNotifications;
