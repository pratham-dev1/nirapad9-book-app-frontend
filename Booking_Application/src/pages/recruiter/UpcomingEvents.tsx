import React, { useContext, useEffect, useState } from "react";
import ClockIcon from "../../styles/icons/ClockIcon";
import Button from '@mui/material/Button';
import { useMutation, useQuery } from "react-query";
import { DELETE_EVENT_HUB_EVENT, GET_UPCOMING_EVENTS } from "../../constants/Urls";
import request from "../../services/http";
import dayjs from 'dayjs';
import { AuthContext } from "../../context/auth/AuthContext";
import { Link } from "react-router-dom";
import Carousel from "../../components/Carousel";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import CheckOutlinedIcon from "../../styles/icons/CheckOutlinedIcon";
import EditEvent from "../EditEvent";
import RespondInvite from "../RespondInvite";
import Loader from "../../components/Loader";
import CustomButton from "../../components/CustomButton";
import { queryClient } from "../../config/RQconfig";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import WarningIcon from "../../styles/icons/WarningIcon";


const UpcomingEvents: React.FC = () => {
    const { state } = useContext(AuthContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const system_timeZone = dayjs.tz.guess()
    const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
    const [date, setDate] = useState<any>();
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [deleteDialogState, setDeleteDialogState] = useState<boolean>(false);
    const { data: upcomingEventsData, isLoading: isUpcomingEventsLoading, isError: upcomingEventsError, refetch } = useQuery(['upcomingEvents',default_timeZone], () => request(GET_UPCOMING_EVENTS, 'get', {default_timeZone}),{
        // refetchInterval: 180000, // 3 minutes,
        onSuccess(data) {
            data.data = data.data.map((event:any) => ({
                ...event,
                // startTime: dayjs.tz(dayjs(event.startTime), default_timeZone ).format('h:mm a'),
                // endTime: dayjs(event.endTime).format('h:mm a'),
                // duration: dayjs(event.endTime).diff(dayjs(event.startTime), 'minutes') // Calculate duration if needed
            }));
        },
    });

    const { mutate:deleteEventHubEvent, isLoading: isDeleteLoading} = useMutation((body: object) => request(DELETE_EVENT_HUB_EVENT, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('upcomingEvents');
      showToast(ToastActionTypes.SUCCESS, data.message)
    },
  })
    
    const determineEventType = (attendees: string) => {
      if (!attendees) return "No Attendees";
      const attendeesArray = attendees.split(',');
      return attendeesArray.length <= 2 ? "One-One" : "One-Many";
    };

    const handleOpenDialog = (event: any) => {
      const isPastEvent = dayjs().tz(default_timeZone) > dayjs(event.startTime).tz(default_timeZone)
      if(isPastEvent) {
        showToast(ToastActionTypes.ERROR, "You Can't Perform Actions on Past Events")
      }
      else {
        setSelectedEvent({...event, startTimeValue: event.startTime, endTimeValue: event.endTime});
        setIsDialogOpen(true);
      }
    };
  
    const handleCloseDialog = () => {
      setIsDialogOpen(false);
    };

    const handleCancelEvent = () => {
      const isPastEvent = dayjs().tz(default_timeZone) > dayjs(selectedEvent.startTime).tz(default_timeZone)
      if(isPastEvent) {
        showToast(ToastActionTypes.ERROR, "You Can't Perform Actions on Past Events")
      }
      else {
        deleteEventHubEvent({eventId: selectedEvent.eventId, booked: true, senderEmail: selectedEvent.senderEmail, senderEmailServiceProvider: selectedEvent.senderEmailServiceProvider })
        setDeleteDialogState(false)
        setIsDialogOpen(false)
      }
    };

    const eventItems = upcomingEventsData?.data.map((upcomingEvent: any) => (
        <div key={upcomingEvent.id} className="upcoming-event d-flex flex-column pointer" onClick={() => handleOpenDialog(upcomingEvent)}>
          <div className="event-time mb-15 text-center">
            <span><ClockIcon /> {dayjs(upcomingEvent.startTime).tz(default_timeZone).format("h:mm A")}</span>
          </div>
          <div>{dayjs(upcomingEvent.startTime).tz(default_timeZone).format("DD-MM-YYYY")}</div>
          <div>{upcomingEvent.eventDurationInMinutes + " Min"}</div>
          <div>{determineEventType(upcomingEvent.attendees) || ""}</div>
          <div className="mb-30">{upcomingEvent.title}</div>
          <div className="d-flex justify-end">
            {upcomingEvent.meetingLink ? (
              <Link to={upcomingEvent.meetingLink} target='_blank'>
                <Button className="small-btn event-join-btn">
                  Join
                </Button>
              </Link>
            ) : (
              <Button className="small-btn event-join-btn" disabled>
                Join
              </Button>
            )}
          </div>
        </div>
      )) || [];

    return (
        <>
        {(isDeleteLoading) && <Loader />}
       <div className="upcoming-events-list d-flex flex-row justify-between">
        {eventItems.length > 0 ? (
          <Carousel items={eventItems} />
        ) : (
          <p className="w-100 text-center">No upcoming events available.</p>
        )}
       </div>
       
       <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <div className="popup-header">
          <h2>Event Details</h2>
          <CloseIcon onClick={handleCloseDialog} />
        </div>
        <DialogContent>
          <DialogContentText>
            <div className="d-flex flex-row justify-center w-100 mb-50">
              {selectedEvent?.meetingLink && (
                <Button
                  href={selectedEvent.meetingLink}
                  target="_blank"
                  className="primary_btns mr-20 svg-linr-icns d-flex items-center"
                >
                  <span className="mr-10"><CheckOutlinedIcon /></span> Join
                </Button>
              )}

         {selectedEvent?.creatorFlag ? <EditEvent formData={{...selectedEvent, startTime: dayjs(selectedEvent?.startTime).tz(default_timeZone).format("D MMMM YYYY, h:mm A")}} refetch={refetch} setOpenDialog={setIsDialogOpen} /> 
          : <RespondInvite formData={{...selectedEvent, startTime: dayjs(selectedEvent?.startTime).tz(default_timeZone).format("D MMMM YYYY, h:mm A")}} setOpenDialog={setIsDialogOpen} />
          }
            </div>
           {selectedEvent?.creatorFlag && <CustomButton label="Cancel Event"  className="primary_btns" onClick={() => setDeleteDialogState(true)} /> }
          </DialogContentText>
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
          <CloseIcon onClick={() => {setDeleteDialogState(false)}} />
        </div>
        <DialogContent>
          <h3 className="text-center">Are you sure you want to delete?</h3> 
        </DialogContent>
        <DialogActions>
        <CustomButton
            onClick={handleCancelEvent}
            color="primary"
            className="primary_btns"
            label="Delete"
        />
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
      </>
       
    )
}

export default UpcomingEvents;