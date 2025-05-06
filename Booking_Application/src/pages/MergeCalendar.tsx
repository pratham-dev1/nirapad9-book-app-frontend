import { Calendar, NavigateAction, View, dayjsLocalizer, momentLocalizer } from 'react-big-calendar'
import dayjs, { Dayjs } from 'dayjs'
import { useQuery } from 'react-query';
import request from '../services/http';
import { FC, SyntheticEvent, useContext, useEffect, useState } from 'react';
import EventPopover from './EventPopover';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CustomButton from '../components/CustomButton';
import { AuthContext } from '../context/auth/AuthContext';
import { SERVER_URL } from '../services/axios';
import { EventsContext } from '../context/event/EventsContext';
import '../styles/BigCalendarStyle.css' // import css file
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Navigate, ToolbarProps } from 'react-big-calendar';
import moment from 'moment'
import 'moment-timezone'
import { Dialog, DialogContent, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import CreateNewEvent from './CreateNewEvent';
import { useNavigate } from 'react-router-dom';
import { Applications } from '../utils/Enums';
import MergeCalendarGuide from '../components/appGuide/MergeCalendarGuide';

const BigCalendar: FC<{tabIndex: number}> = ({tabIndex}) => {

  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  // dayjs.tz.setDefault(default_timeZone);
  moment.tz.setDefault(default_timeZone)

  // const localizer = dayjsLocalizer(dayjs);
  const localizer = momentLocalizer(moment);
  const { eventsData, emailData, selectedEmails, setSelectedEmails, selectedCalendars, setSelectedCalendars } = useContext(EventsContext);
  const [selectedEvent, setSelectedEvent] = useState({})
  const [targetElement, setTargetElement] = useState<HTMLButtonElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | any>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [calendarView, SetcalendarView] = useState<any>(null);
  const navigate = useNavigate();


  //   const { data: eventColorList }: any = useQuery(['event-colors'], () => request(GET_EVENT_COLOR_LIST))
  // console.log(eventColorList)

  useEffect(() => {
    if (emailData?.length > 0) {
      setSelectedEmails(emailData)
    }
  }, [emailData])

  const eventStyleGetter = (event: any) => {
    const textDecoration = (event.isCancelled || event.isDeleted) ? 'line-through' : 'none';
    const style = {
      backgroundColor: event.color,
      textDecoration: textDecoration,
    };
    return {
      style: style
    };
  };

  const handleCalendarChange = (event: React.MouseEvent<HTMLElement>, newCalendars: string[]) => {
    setSelectedCalendars(newCalendars);
  };
  
  const handleChange = (event: SyntheticEvent<Element, Event>, values: any[]) => {
    // If no values are selected, keep the last selected value
    if (values.length === 0 && selectedEmails?.length as number > 0) {
      setSelectedEmails(selectedEmails);
    } else {
      setSelectedEmails(values);
    }
  };

  const handleClickEvent = (value: any, e: React.MouseEvent<HTMLButtonElement>) => {
    setTargetElement(e.currentTarget);
    setSelectedEvent(value)
  }
  
  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    // setEventTime({ start, end });
    const startTimeDayjs = dayjs(start)
    const startTime = dayjs.tz(startTimeDayjs, default_timeZone);
    const endTimeDayjs = dayjs(start)
    const endTime = dayjs.tz(endTimeDayjs, default_timeZone);
    
    setSelectedSlot({start:startTime,end:endTime})
    setOpenDialog(true);
  };

  const handleNavigateButton = (datetime: Date, view: string, value: string) => {
    setSelectedDate(dayjs(datetime))
  }

  const CustomCalendarToolbar = (props: ToolbarProps) => {
    const [viewState, setViewState] = useState('');

    const goToView = (view: View) => {
      props.onView(view);
      SetcalendarView(view);
    };

    useEffect(() => {
      setViewState(props.view);
    }, [props.view]);

    const navigate = (direction: NavigateAction) => {
      props.onNavigate(direction);
    };

    const views = ['day', 'week', 'month', 'agenda'];


    return (
      <div className='rbc-toolbar d-flex justify-between items-center'>
        { state.appAccess.includes(Applications.EVENT_HUB) && <div className='new-event-item'>
          <span className='new-event'>
            <button id='event-btn' type="button" onClick={() =>{ setSelectedSlot(null);  setOpenDialog(true) }}>
              New Event
              <b>&#43;</b>
            </button>
          </span>
        </div>}

        <div className='view-toolbar-item'>
          <span id="view-change" className="rbc-btn-group">
            {views.map(view => (
              <button
                key={view}
                type="button"
                onClick={() => goToView(view as View)}
                className={viewState === view ? 'activeView' : ''}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </span>
        </div>

        <div className='calendar-toolbar-item'>
          <span className='personal-calendar'>
            Personal calendars:
              <ToggleButtonGroup
                value={selectedCalendars}
                onChange={handleCalendarChange}
                aria-label="personal calendars"
              >
              <ToggleButton value="google" aria-label="google">
                <img src="/google-trnas-icon.png" alt="Google" height="18" width="18" />
              </ToggleButton>
              <ToggleButton value="microsoft" aria-label="windows">
               <img src="/window-trans-icon.png" alt="" height="18px" width="18px" />
              </ToggleButton>
            </ToggleButtonGroup>
          </span>
        </div>

        <span id='current-state' className="rbc-btn-group">
          <button className='today-btn' type="button" onClick={() => navigate(Navigate.TODAY)}>Today</button>
          <button id="back-button" type="button" onClick={() => navigate(Navigate.PREVIOUS)}>&#8249;</button>
          <label className="rbc-toolbar-label">{props.label}</label>
          <button id="next-button" type="button" onClick={() => navigate(Navigate.NEXT)}>&#8250;</button>
          {calendarView === 'agenda' &&  
            <span className='dt_frmt'>(MM/DD/YYYY)</span>
          }
        </span>
      </div>
    );
  };

  return (
    //start of css by Harshit 16/04/2024
    <div id="big-calendar-dashboard">
      <div id="big-calendar-left">
        <CustomDatePicker
          label="Select date"
          size="small"
          className='cccc'
          value={selectedDate || dayjs()}
          onChange={(value: Dayjs) => setSelectedDate(value)}
        />
        <CustomAutocomplete
          label='Select Email'
          options={emailData || []}
          getOptionLabel={(option) => option.email}
          multiple
          onChange={handleChange}
          value={selectedEmails || []}
          disableClearable={true}
        />
        {/* <CustomButton sx={{height:50, marginTop:1}} label="Set event colors" onClick={() => setOpenDialog(true)} /> */}
        <CustomButton sx={{ height: 50, backgroundColor: "#729ae2" }} label="Sync google Calendar" onClick={() => window.location.href = `${SERVER_URL}/api/auth/google-login/${state.userId}`} />
        <CustomButton sx={{ height: 50, backgroundColor: "#729ae2" }} label="Sync microsoft Calendar" onClick={() => window.location.href = `${SERVER_URL}/api/auth/microsoft-login/${state.userId}`} />
      </div>
      <div id="big-calendar-right">
        {/* end of css  */}
        <Calendar
          localizer={localizer}
          events={eventsData || []}
          date={selectedDate ? dayjs(selectedDate).toDate() : dayjs().toDate()}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={handleClickEvent as any}
          // onSelectSlot={handleSelectSlot}
          defaultView='week'
          onNavigate={handleNavigateButton}
          eventPropGetter={eventStyleGetter}
          components={{ toolbar: CustomCalendarToolbar }}
        // style={{ height: 700 }}
        />
      </div>

      <EventPopover targetElement={targetElement} setTargetElement={setTargetElement} event={selectedEvent} />
      <Dialog
        open={openDialog}
        fullWidth
        maxWidth="lg"
      >
        <div className='popup-header'>
          <h2>Create New Event</h2>
          <CloseIcon  onClick={() => {setOpenDialog(false); setSelectedSlot(null);}} />
        </div>
        <DialogContent>
          <CreateNewEvent setOpenDialog={setOpenDialog} selectedSlot={selectedSlot}/>
        </DialogContent>
      </Dialog>
      {(tabIndex === 1 && !state.isMergeCalendarGuideChecked) && <MergeCalendarGuide /> }
    </div>
  )
}

export default BigCalendar