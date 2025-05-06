import React, { FC, useContext, useState } from 'react';
import CustomButton from '../components/CustomButton';
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CustomTextField from '../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
//import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import request from '../services/http';
import { CHECK_AVAILABILITY_FOR_ADVANCED_EVENT, CHECK_AVAILABILITY_FOR_ADVANCED_EVENT_ROUND_ROBIN, CREATE_ADVANCED_EVENT, CREATE_ADVANCED_EVENT_ROUND_ROBIN, CREATE_ADVANCED_EVENT_WITHOUT_CHECKING_AVAILABILITY, DELETE_EVENT_DRAFT, GET_ALL_USER_LIST, GET_EVENT_DRAFT, GET_GENERAL_TEMPLATES, GET_PREDEFINED_MEETS, GET_PREDEFINED_MEETS_LOCATIONS, PREVIEW_TEMPLATE } from '../constants/Urls';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomTimePicker from '../components/CustomTimePicker';
import CustomRichTextEditor from '../components/CustomRichTextEditor';
import BackArrowIcon from '../styles/icons/BackArrowIcon';
import VideoIcon from '../styles/icons/VideoIcon';
import DropdownIcon from '../styles/icons/DropdownIcon';
import CallIcon from '../styles/icons/CallIcon';
import LocationIcon from '../styles/icons/LocationIcon';
import { RadioGroup, Radio, Drawer, FormControlLabel, Checkbox, FormGroup, Dialog, DialogTitle, Divider, DialogContent, DialogActions  } from "@mui/material";
import ClockIcon from '../styles/icons/ClockIcon';
import RepeatIcon from '../styles/icons/RepeatIcon';
import DocsIcon from '../styles/icons/DocsIcon';
import Contacts from './Contacts';
import TempIcon from '../styles/icons/TempIcon';
import { EventsContext } from '../context/event/EventsContext';
import { queryClient } from '../config/RQconfig';
import showToast from '../utils/toast';
import { ToastActionTypes } from '../utils/Enums';
import dayjs, { Dayjs } from 'dayjs';
import { AuthContext } from '../context/auth/AuthContext';
import moment from 'moment-timezone';
import CloseIcon from '@mui/icons-material/Close';
import CustomCheckBox from '../components/CustomCheckbox';
import Loader from '../components/Loader';
import { EditOffOutlined } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import PreviewTemplate from '../components/PreviewTemplate';

type FormInputProps = {
  title: string;
  guests: any[];
  addMe: boolean;
  description: string;
  adminName: string;
  date: Dayjs | null;
  startTime: Dayjs | null;
  evntTimeIndv: any;
  bufferTime: any;
  event_reoccurence: any;
  event_repeat: any;
  evnt_end_date: any;
  evnt_after_end: any;
  eventDuration: any;
  email: any;
  eventType: {id: number, value: string};
  newTemplate: any;
  template: any;
  checkAvailability: boolean;
  endTime: Dayjs | null;
  excludeAvailabilityRange: boolean
};

const CreateEventsBuffer: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone;
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const { emailData } = useContext(EventsContext)
  const [outsideMembers, setOutsideMembers] = useState<any>([])
  const [selectedRadio, setSelectedRadio] = useState<string>('round_robin'); // Track selected radio
  const [eventType, setEventType] = useState<{type: string}>({type: 'intra_day'})
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRecurringEvent, setIsRecurringEvent] = useState(false)
  const [predefinedMeetConfig, setPredefinedMeetConfig] = useState<any>()
  const [meetType, setMeetType] = useState<number|null>();
  const [meetAttendees, setMeetAttendees] = useState<any[]>([])
  const [removedItem, setRemovedItem] = useState<any>()
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false)
  const [spreadEventType, setSpreadEventType] = useState('week')
  const [isBufferEvent, setIsBufferEvent] = useState(false);
  const [eventInfo, setEventInfo] = useState<any>({})
  const [finalSlotsBookingForRoundRobin, setFinalSlotsBoookingForRoundRobin] = useState([])
  const [previewTemplate, setPreviewTemplate] = useState('');


  const { data, isLoading: isUserLoading } = useQuery(['all-user-list'], () => request(GET_ALL_USER_LIST, "get"));
  const { data: templatesData } = useQuery('general-templates', () => request(`${GET_GENERAL_TEMPLATES}?type=create`))
  const {data: meetLocations} = useQuery('predefined-meet-locations', () => request(GET_PREDEFINED_MEETS_LOCATIONS))
  const { data: eventDrafts } = useQuery('event-draft', () => request(GET_EVENT_DRAFT))

  const {data: meetData} = useQuery('predefined-meet', () => request(GET_PREDEFINED_MEETS))
  const videoMeetData = meetData?.data?.filter((item: any) => item.type === 1)
  const audioMeetData = meetData?.data?.filter((item: any) => item.type === 2)
  const inPersonMeetData = meetData?.data?.filter((item: any) => item.type === 3)

  const { handleSubmit, control, formState: { errors }, reset, setValue, watch, getValues } = useForm<FormInputProps>();

  const { mutate: deleteEventDraft, isLoading: isDeleteEventDraftLoading } = useMutation((body: object) => request(DELETE_EVENT_DRAFT, "delete", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('event-draft');
      }
    }
  );
  const { mutate: createAdvancedEvent, isLoading: isCreateEventLoading } = useMutation((body: object) => request(CREATE_ADVANCED_EVENT, "post", body), {
    onSuccess: (data: any) => {
        showToast((data?.warning ? ToastActionTypes.WARNING : ToastActionTypes.SUCCESS), data?.message)
    }
  });

  const { mutate: checkAvailabilityForAdvancedEvent, data: createEventResponse, isLoading: isCheckAvailabilityLoading } = useMutation((body: object) => request(CHECK_AVAILABILITY_FOR_ADVANCED_EVENT, "post", body), {
    onSuccess: (data: any) => {
        if(data?.warning) {
            setOpenDialog(true)
        }
        else {
            showToast(ToastActionTypes.SUCCESS, data?.message)
        }
    }
  });

  const { mutate: createAdvancedEventWithoutCheckingAvailability, isLoading: isCreateEventLoading2 } = useMutation((body: object) => request(CREATE_ADVANCED_EVENT_WITHOUT_CHECKING_AVAILABILITY, "post", body));

  const { mutate: checkAvailabilityForAdvancedEventRoundRobin, data: createEventRoundRobinResponse, isLoading: isCheckAvailabilityRoundRobinLoading } = useMutation((body: object) => request(CHECK_AVAILABILITY_FOR_ADVANCED_EVENT_ROUND_ROBIN, "post", body), {
    onSuccess: (data: any) => {
        if(data?.warning) {
            setOpenDialog(true)
            setFinalSlotsBoookingForRoundRobin(data?.finalSlotsToBeBooked || [])
        }
        else {
            showToast(ToastActionTypes.SUCCESS, data?.message)
        }
    }
  });


  const { mutate: createAdvancedEventRoundRobin, isLoading: isCreateEventRoundRobinLoading2 } = useMutation((body: object) => request(CREATE_ADVANCED_EVENT_ROUND_ROBIN, "post", body), {
    onSuccess: (data: any) => {
        showToast((data?.warning ? ToastActionTypes.WARNING : ToastActionTypes.SUCCESS), data?.message)
    }
  });
  
  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedUsers = Array.from(meetAttendees);
    const [movedUser] = reorderedUsers.splice(result.source.index, 1);
    reorderedUsers.splice(result.destination.index, 0, movedUser);

    setMeetAttendees(reorderedUsers);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadio(event.target.value);
  };

  // Reoccurring Events
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleDay = (day: string) => {
    setSelectedDays((prevSelected) =>
      prevSelected.includes(day)
        ? prevSelected.filter((d) => d !== day)
        : [...prevSelected, day]
    );
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen(true);
  };
  const onSubmit = (formdata: FormInputProps) => {
    const currentDateTime = dayjs().tz(default_timeZone);
    const startDateTime = dayjs.tz(`${formdata?.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`,default_timeZone);
    if (currentDateTime > startDateTime) {
      showToast(ToastActionTypes.ERROR, 'Please choose a time that is not in the past');
      return;
    }
    let endDateTimeRange;

    if(eventType.type === 'intra_day') {
        if(dayjs.tz(`${formdata?.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`,default_timeZone) >= dayjs.tz(`${formdata?.date?.format("YYYY-MM-DD")} ${formdata?.endTime?.subtract(1, 'minute')?.format("HH:mm")}`,default_timeZone)) {
            showToast(ToastActionTypes.ERROR, 'For intraday event - Endtime should be less than 12 AM')
            return;
        }
        // if endtime is not there we will set to 12 am for the same day
        endDateTimeRange = formdata.endTime ? dayjs.tz(`${formdata?.date?.format("YYYY-MM-DD")} ${formdata.endTime?.subtract(1, 'minute').format("HH:mm")}`,default_timeZone) : dayjs(formdata?.date).tz(default_timeZone).endOf('day')
    }
    else if (eventType.type === 'spread') {
        if(spreadEventType === 'week') {
            // if endtime is not there we will set to 12am for the same week 
            endDateTimeRange = formdata.endTime ? dayjs.tz(`${formdata?.date?.endOf('week').format("YYYY-MM-DD")} ${formdata.endTime?.format("HH:mm")}`,default_timeZone) : dayjs(formdata?.date).tz(default_timeZone).endOf('week')
        }
        else if(spreadEventType === 'month') {
            // if endtime is not there we will set to 12am for the same month 
            endDateTimeRange = formdata.endTime ? dayjs.tz(`${formdata?.date?.endOf('month').format("YYYY-MM-DD")} ${formdata.endTime?.format("HH:mm")}`,default_timeZone) : dayjs(formdata?.date).tz(default_timeZone).endOf('month')
        }
    }
    const totalMinutesOfGivenDatetimeRange = endDateTimeRange?.diff(startDateTime, 'minute') as any
    const totalTimeForSingleBooking = +formdata.eventDuration + +formdata.bufferTime
    const totalTimeRangeForAllBooking = totalTimeForSingleBooking * formdata.guests.length 
    console.log(totalMinutesOfGivenDatetimeRange, totalTimeRangeForAllBooking)
    if(totalMinutesOfGivenDatetimeRange < totalTimeRangeForAllBooking) {
        showToast(ToastActionTypes.ERROR, 'Given time range is not sufficient for all the users');
        return;
    }
    let eventData = {...formdata, type: eventType.type, startDateTimeRange: startDateTime.toISOString(), endDateTimeRange: endDateTimeRange?.toISOString(), timezone: default_timeZone, bufferTime: +formdata?.bufferTime, eventDuration: +formdata.eventDuration, isRecurringEvent, guests: meetAttendees.map(i => i.email)}
    setEventInfo(eventData)
    if (selectedRadio === 'custom_pick') {
        formdata.checkAvailability ? checkAvailabilityForAdvancedEvent(eventData) : createAdvancedEventWithoutCheckingAvailability(eventData)
    }
    else if (selectedRadio === 'round_robin') {
        formdata.checkAvailability ? checkAvailabilityForAdvancedEventRoundRobin(eventData) : createAdvancedEventWithoutCheckingAvailability(eventData)
    }
  }

  const { mutate: mutatePreviewTemplate, isLoading: isPreviewLoading, isSuccess: isPreviewSuccess } = useMutation((body: object) => request(PREVIEW_TEMPLATE, "post", body),{
    onSuccess: (data) => {
        setPreviewTemplate(data?.data)
    }
})

  const handleSelectPredefinedMeet = (item: any) =>{
    // console.log(item)
    setPredefinedMeetConfig(item)
    let itemContent = watch('newTemplate')
    setValue("template", null);
    itemContent = `
    ${item.title ? `<p>title: ${item.title}</p>` : ''}
    ${item.location ? `<p>location: ${(meetLocations?.data.filter((i: any) => i.id === item.location))[0]?.value}</p>` : ''}
    ${item.url ? `<p>url: ${item.url}</p>` : ''}
    ${item.address ? `<p>address: ${item.address}</p>` : ''}
    ${item.phone ? `<p>phone: ${item.phone}</p>` : ''}
    ${item.passcode ? `<p>passcode: ${item.passcode}</p>` : ''}
  `;
  
    reset({
        ...getValues(),
        newTemplate: itemContent,
    })
  }

  const handleRemove = (value: any) => {
    const filteredValues = meetAttendees?.filter((item: any) => item.email !== value.email).map((i:any) => i.email)
    setOutsideMembers(filteredValues?.map((i => ({email:i}))))
    setValue('guests', filteredValues)
    // trigger('guests')
    setMeetAttendees(prev => prev.filter((item) => item.email !== value.email))
    setRemovedItem(value)
  }

  const handleChangeDrafts = (e: any, values: any) => {
    setSelectedDraft(values)
  }

  const handleSelectOrRemoveContact = (item: any, setContacts: React.Dispatch<React.SetStateAction<any[]>>) => {
    if(!item.selected) {
        const isExist = meetAttendees.map(i => i.email).includes(item.email) 
        if(isExist) {
            showToast(ToastActionTypes.ERROR, 'Already added in the list')
            return;
        }
          setValue('guests', [...meetAttendees.map(i => i.email), item.email])
        //   trigger('guests')
          setMeetAttendees((prev) => [...prev, {email: item.email}])
    }
    else {
        setValue('guests', meetAttendees.filter(i => i.email !== item.email).map(j => j.email))
        setMeetAttendees(prev => prev.filter((el) => el.email !== item.email))
    }

    setContacts(prev => prev?.map(el => el.id === item.id ? {...el, selected: !item.selected} : el))
  }

  const handleContinueCreatingEvent = () => {
    createEventResponse ? createAdvancedEvent({...eventInfo, AvailableEmails: createEventResponse?.AvailableEmails}) : createEventRoundRobinResponse ? createAdvancedEventRoundRobin({...eventInfo, finalSlotsBookingForRoundRobin}) : null
    setOpenDialog(false)
  }

  const onReset = () => {
    setValue('date', null)
    setValue('startTime', null)
    setValue('endTime', null)
    setValue('bufferTime', '')
    setIsBufferEvent(false)
  }

  const handlePreviewTemplate = () => {
    const date = watch('date');
    const startTime = watch('startTime')
    mutatePreviewTemplate({
        template: watch('newTemplate'),
        date: date ? dayjs(date).tz(default_timeZone).format("DD-MM-YYYY") : null,
        time: startTime ? dayjs(startTime).tz(default_timeZone).format("h:mm A") : null,
        url: predefinedMeetConfig?.url,
        passcode: predefinedMeetConfig?.passcode,
        location: meetLocations?.data.filter((i: any) => i.id === predefinedMeetConfig?.location)[0]?.value,
        phone: predefinedMeetConfig?.phone,
        address: predefinedMeetConfig?.address,
        timezone: default_timeZone
    })
  }
  return (
    <>
    {(isCreateEventLoading || isCheckAvailabilityLoading || isCreateEventLoading2 || isCheckAvailabilityRoundRobinLoading || isCreateEventRoundRobinLoading2) && <Loader />}
      <div className='page-wrapper'>
        <h2>
            <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/dashboard')} ><BackArrowIcon /></span>
            Create Buffer Events meet
        </h2>
        <div className='card-box adv_evnt_frm_crd_box position-relative adv_crt_evnt_col pl-20'>
            <form className='group_crtn_frm evnt_buffr_form' onSubmit={handleSubmit(onSubmit)}>
                <div className='d-flex flex-row justify-between mb-30 group_crtn_frm_wrpr'>
                    <div className='w-100 mb-50 d-flex flex-row justify-between align-end'>
                        <div className='d-flex align-end w-85'>
                            <RadioGroup className="d-flex justify-between flex-row mr-20" defaultValue="intra_day" value={eventType.type}>
                                <div className='event_types_opt mr-15'>
                                    <FormControlLabel 
                                        className="" 
                                        value="intra_day" 
                                        control={<Radio onChange={()=> {setEventType({type: 'intra_day'}); setIsDrawerOpen(true)}} />} 
                                        label="Intra-day Events" 
                                    />
                                    <div className='evnt_opts'>
                                        <span className='evnt_opt mr-10' onClick={() => {setIsDrawerOpen(true); setEventType({type: 'intra_day'}); setValue('eventDuration', 15)}}>
                                            <ClockIcon /> 15
                                        </span>
                                        <span className='evnt_opt mr-10' onClick={() => {setIsDrawerOpen(true); setEventType({type: 'intra_day'}); setValue('eventDuration', 30)}}>
                                            <ClockIcon /> 30
                                        </span>
                                        <span className='evnt_opt' onClick={() => {setIsDrawerOpen(true); setEventType({type: 'intra_day'}); setValue('eventDuration', 45)}}>
                                            <ClockIcon /> 45
                                        </span>
                                    </div>
                                </div>
                                <div className='event_types_opt'>
                                    <FormControlLabel 
                                        className="" 
                                        value="spread" 
                                        control={<Radio onChange={()=> {setEventType({type: 'spread'}); setIsDrawerOpen(true)}} />} 
                                        label="Spread Events" 
                                    />
                                    <div className='evnt_opts'>
                                        <span className='evnt_opt mr-10' onClick={() => {setIsDrawerOpen(true); setEventType({type: 'spread'}); setValue('eventDuration', 15)}}>
                                            <ClockIcon /> 15
                                        </span>
                                        <span className='evnt_opt mr-10' onClick={() => {setIsDrawerOpen(true); setEventType({type: 'spread'}); setValue('eventDuration', 30)}}>
                                            <ClockIcon /> 30
                                        </span>
                                        <span className='evnt_opt' onClick={() => {setIsDrawerOpen(true); setEventType({type: 'spread'}); setValue('eventDuration', 45)}}>
                                            <ClockIcon /> 45
                                        </span>
                                    </div>
                                </div>
                            </RadioGroup>
                            <div className="evnt_cl_typ d-flex">
                                <div className={`evnt_cl_typ_item ${meetType === 1 ? 'active_item' : ''}`}>
                                    <p>Video Call</p>
                                    <VideoIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    <ul className="mt_opt_itms">
                                    {videoMeetData?.map((item: any) =>{
                                             return (
                                             <li className={`mt_opt_itm ${predefinedMeetConfig?.id === item?.id ? 'active_item' : ''}`} 
                                             onClick={() => {
                                                    handleSelectPredefinedMeet(item); 
                                                    setMeetType(1)
                                               }}>
                                                {item.title}
                                                <span className="mt_dtls">{item.url}</span>
                                            </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                                <div className={`evnt_cl_typ_item ${meetType === 2 ? 'active_item' : ''}`}>
                                    <p>Phone Call</p>
                                    <CallIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    <ul className="mt_opt_itms">
                                    {audioMeetData?.map((item: any) =>{
                                             return <li className={`mt_opt_itm ${predefinedMeetConfig?.id === item?.id ? 'active_item' : ''}`} 
                                             onClick={() => {
                                                handleSelectPredefinedMeet(item); 
                                                setMeetType(2)
                                                }}>
                                                {item.title}
                                                <span className="mt_dtls">{item.phone}</span>
                                            </li>
                                        })}
                                    </ul>
                                </div>
                                <div className={`evnt_cl_typ_item ${meetType === 3 ? 'active_item' : ''}`}>
                                    <p>In Person</p>
                                    <LocationIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    <ul className="mt_opt_itms">
                                    {inPersonMeetData?.map((item: any) =>{
                                             return <li className={`mt_opt_itm ${predefinedMeetConfig?.id === item?.id ? 'active_item' : ''}`} 
                                             onClick={() => {
                                                handleSelectPredefinedMeet(item); 
                                                setMeetType(3)
                                            }}>
                                                {item.title}
                                                <span className="mt_dtls">{item.address}</span>
                                            </li>
                                        })}
                                    </ul>
                                </div>
                            </div>
                            <div className="slct_evnt_tmp">
                                <div className="input-label">
                                    <TempIcon />
                                    <span className="ml-10">Select Template</span>
                                    <span className="arw_icn">
                                        <DropdownIcon />
                                    </span>
                                </div>
                                <Controller
                                    name="template"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label=''
                                        options={templatesData?.data || []}
                                        groupBy={option => option.group}
                                        getOptionLabel={option => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, selectedValue) => {
                                        onChange(selectedValue);
                                        setValue('newTemplate', selectedValue.template)
                                        setMeetType(null)
                                        }}
                                        value={value || null}
                                        disableClearable
                                    />
                                    )}
                                />
                            </div>

                        </div>

                        <div className='w-12 draft-opt drft_tmp_opt'>
                            <span className='draft-icon drft_txt d-flex items-center'>
                                <DocsIcon />
                                <span className="ml-5 mr-15">Drafts</span>
                                <span className="drp_icn">
                                    <DropdownIcon />
                                </span>
                                
                            </span>
                            <CustomAutocomplete 
                                label='' 
                                // options={eventDrafts?.data || []} 
                                options={eventDrafts?.data || []} 
                                getOptionLabel={option => option.title}
                                onChange={handleChangeDrafts}
                                value={selectedDraft}
                                sx={{width: 130}} 
                                showDeleteIcon={true} 
                                onDelete={(option) => {
                                //   console.log("Deleting draft:", option);
                                    deleteEventDraft({id: option.id})
                                    if (selectedDraft?.id === option.id) {
                                    setSelectedDraft(null);
                                    reset({
                                        ...getValues(),
                                        title: '',
                                        date: null,
                                        startTime: null,
                                        email: null,
                                        newTemplate: null,
                                        template: null,
                                    })
                                    }
                                }}
                                disableClearable
                            />
                        </div>
                    </div>
                
                    <div className='w-100 d-flex flex-row justify-between'>
                        <div className='w-48 mb-30'>    
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                    label="Event Title"
                                    className='w-100'
                                    onChange={onChange}
                                    value={value || ""}
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Event Select Email */}
                        <div className="w-48">
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomAutocomplete
                                    label="Pick Email Sender"
                                    options={emailData?.map((item)=> item.email) || []}
                                    onChange={(e,v) => onChange(v)}
                                    value={value || null}
                                    error={!!errors.email}
                                    helperText={errors.email?.message as string}
                                />
                                )}
                            />
                        </div>
                    </div>
                    <div className='w-100 d-flex flex-row justify-between mb-30'>
                        {/* Members */}
                        <div className='w-48 mb-30'>
                            <Controller
                                name="guests"
                                control={control}
                                render={({ field: { onChange, value = [] } }) => (
                                    <CustomAutocomplete
                                    options={[]}
                                    multiple
                                    onChange={(e, val, reason) => {     
                                        if(reason === 'removeOption') return    //disable backspace chip delete
                                        const filteredValue = val.filter((v:any) => v.trim() !== '');
                                        onChange(filteredValue)
                                        setOutsideMembers(filteredValue.map(((i:any) => ({email: i}))))
                                        setMeetAttendees((prev) => {
                                        return filteredValue.map((item: any, index: number) => {
                                                if(item === prev[index]?.email) {
                                                    return prev[index]
                                                }
                                                else {
                                                    return {email: item}
                                                }
                                        })
                                        })
                                        }}
                                    value={value || []}
                                    label="Add members"
                                    renderTags={() => null}
                                    freeSolo
                                    disableClearable
                                    />
                                )}
                            />
                        </div>

                        <RadioGroup className="w-48 d-flex flex-row" defaultValue="round_robin" onChange={handleRadioChange}>
                            <FormControlLabel 
                                className="" 
                                value="round_robin" 
                                control={<Radio />} 
                                label="Round Robin" 
                            />
                            <FormControlLabel 
                                className="" 
                                value="fcfs" 
                                control={<Radio />} 
                                label="FCFS" 
                            />
                            <FormControlLabel 
                                className="" 
                                value="custom_pick" 
                                control={<Radio />} 
                                label="Custom Pick" 
                            />
                        </RadioGroup>
                    </div>

                    <div className='w-100 mb-0'>
                        {isBufferEvent && 
                            <div className="mb-30 font-medium"> 
                                <span>Event Duration: </span>
                                <span className='font-bold'>{watch('eventDuration')} Minutes, &nbsp;</span>
                                <span>Date: </span>
                                <span className='font-bold'>{dayjs(watch('date')).format("DD-MM-YYYY")}, &nbsp;</span>
                                <span>Start Time: </span>
                                <span className='font-bold'>{dayjs(watch('startTime')).format("hh:mm a")}, &nbsp;</span>
                                <span>Buffer Time: </span>
                                <span className='font-bold'>{watch('bufferTime')} Minutes, &nbsp;</span>
                                <span>Event Type: </span>
                                <span className='font-bold'>{eventType.type === 'intra_day' ? 'Intra-day' : 'Spread'} &nbsp;</span>
                                {isRecurringEvent && (
                                    <>
                                        <span>Recurring Type: </span>
                                        <span className='font-bold'>{watch('event_reoccurence')}, &nbsp;</span>
                                    </>
                                )}
                                <EditIcon onClick={() => setIsDrawerOpen(!isDrawerOpen)} sx={{cursor: 'pointer'}} />

                            </div> 
                        }
                    </div>
                    <div className="mr-20 mb-30">
                                <Controller
                                    name="checkAvailability"
                                    control={control}
                                    render={({ field: { onChange,value} }) => (
                                    <CustomCheckBox
                                        label="Check Availability"
                                        onChange={onChange}
                                        labelPlacement='end'
                                        checked={value || false}
                                    />
                                    )}
                                /> 
                                <Controller
                                    name="excludeAvailabilityRange"
                                    control={control}
                                    render={({ field: { onChange,value} }) => (
                                    <CustomCheckBox
                                        label="Exclude Availability Range"
                                        onChange={onChange}
                                        labelPlacement='end'
                                        checked={value || false}
                                    />
                                    )}
                                />
                    </div>

                    <div className='w-100 mb-50'>
                        <Controller
                            name="newTemplate"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field: { onChange, value } }) => (
                            <CustomRichTextEditor 
                                onChange={onChange}
                                value={value}
                            />
                            )}
                        />
                    </div>

                </div>

                {/* Member List with Drag and Drop */}
                <div className='contact-user-list member_list'>
                    <div className="d-flex justify-end pl-20 pr-20">
                    <Contacts outsideMembers={outsideMembers} handleSelectOrRemoveContact={handleSelectOrRemoveContact} removedItem={removedItem} meetAttendees={meetAttendees} selectedDraft={selectedDraft} /> 
                    </div>
                    {/* <div className="user-avlty pl-20 pr-20">
                        <span className="Mndty_usr">Mandatory Attendee</span>
                        <span className="opt_usr">Optional Attendee</span>
                    </div> */}
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="users" isDropDisabled={selectedRadio !== 'custom_pick'}>
                            {(provided) => (
                            <ul className='member_items' {...provided.droppableProps} ref={provided.innerRef}>
                                {meetAttendees.map((item: any, index) => (
                                <Draggable 
                                    key={item?.email} 
                                    draggableId={item?.email?.toString()} 
                                    index={index} 
                                    isDragDisabled={selectedRadio !== 'custom_pick'}
                                >
                                    {(provided) => (
                                    <li
                                        className='membar_item'
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >   
                                        <span className='indx_nmb'>{index + 1}</span>
                                        <div className='d-flex items-center mb-5'>
                                            <div className='usr_img '>
                                                <img src="/contact-user.png" alt="User" />
                                            </div>
                                            <div className='usr_dtl d-flex flex-column'>
                                                <span className='usr_nme'>{item.fullname}</span>
                                                <span className='usr_eml'>{item.email}</span>
                                            </div>
                                            <div className='membr_remove'onClick={() => handleRemove(item)} >
                                                <CloseIcon />
                                            </div>
                                        </div>
                                    </li>
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Save Button */}
                <div className='w-70 d-flex mb-30'>
                    <div className="btn_wth_opts mr-25">
                        <span className="MuiButton-root secondary_btns"><span className="mr-20">Save Draft</span><DropdownIcon /></span>
                        <ul className="opnts">
                            <li>Save</li>
                            <li>Save As</li>
                        </ul>
                    </div>
                    <CustomButton className='primary_btns' label="Preview" disabled={!watch('newTemplate')} onClick={handlePreviewTemplate} />
                    <CustomButton type='submit' className='primary_btns' label="Confirm" />
                </div>
            </form>
        </div>
      </div>
      {isPreviewSuccess && <PreviewTemplate value={previewTemplate} />}
        <Drawer
            anchor={"right"}
            title="Reoccurring Event"
            onClose={() => setIsDrawerOpen(false)}
            open={isDrawerOpen}
            className="reoccur_evnt_pup"
            variant='persistent'
        >
            <div className="popup-inner">
                <div className="d-flex justify-end">
                    <span className="pointer" onClick={() => setIsDrawerOpen(false)}><CloseIcon /></span>
                </div>
                <div className="form-wrapper mt-20">
                    <div className='d-flex items-center mb-20'>
                        <p className='form-label font-bold mb-zero mt-0 mr-10'>{`${eventType.type === 'intra_day' ? 'Intra-day' : 'Spread'}`} Event:</p>
                        <Controller
                            name="eventDuration"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                                label=""
                                options={[15, 30, 45, 60]}
                                getOptionLabel={option => option + ' Minutes'}
                                onChange={(e,v) => onChange(v)}
                                disableClearable={true}
                                value={value || 15}
                                className='dropdown-with-bg'
                                sx={{ 
                                    width: 130,
                                }}
                            />
                            )}
                        />
                    </div>
                    <div className='w-100 d-flex flex-row'>
                        <div className='w-100 mb-10'>
                            <Controller
                                name="date"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomDatePicker
                                    label="Date"
                                    value={value || null}
                                    size="small"
                                    className="avail-date-filter"
                                    onChange={onChange}
                                    disablePast={true}
                                    sx={{ 
                                        width: 220,
                                    }}
                                    error={!!errors.date}
                                    helperText={errors.date?.message as string}
                                />
                                )}
                            />
                        </div>
                        <div className='w-100 mb-15'>
                            <Controller
                                name="startTime"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomTimePicker
                                    label="Start Time"
                                    value={value || null}
                                    size="small"
                                    className="avail-date-filter"
                                    onChange={onChange}
                                    sx={{ 
                                        width: 220,
                                    }}
                                    error={!!errors.startTime}
                                    helperText={errors.startTime?.message as string}
                                />
                                )}
                            />
                        </div>
                        <div className='w-100 mb-15'>
                            <Controller
                                name="endTime"
                                control={control}
                                // rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomTimePicker
                                    label="End Time"
                                    value={value || null}
                                    size="small"
                                    className="avail-date-filter"
                                    onChange={onChange}
                                    sx={{ 
                                        width: 220,
                                    }}
                                />
                                )}
                            />
                        </div>
                        
                        <div className='w-100 mb-20'>
                            <Controller
                                name="bufferTime"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                    label="Buffer Time (In minutes)"
                                    onChange={onChange}
                                    value={value || ""}
                                    error={!!errors.bufferTime}
                                    helperText={errors.bufferTime?.message as string}
                                    sx={{ 
                                        width: 220,
                                    }}
                                    />
                                )}
                            />
                        </div>
                        {/* Spread Across */}
                        {eventType.type === "spread" && 
                        <div className='w-100 mb-20'>
                            <p className='form-label mb-zero'>Spread Across</p>
                            <RadioGroup className="d-flex flex-row" defaultValue={spreadEventType} onChange={(e,v) => setSpreadEventType(v)}>
                                <FormControlLabel 
                                    className="mr-40" 
                                    value="week" 
                                    control={<Radio />} 
                                    label="Week" 
                                />
                                <FormControlLabel 
                                    className="" 
                                    value="month" 
                                    control={<Radio />} 
                                    label="Month" 
                                />
                            </RadioGroup>
                        </div>
                        }
                        <div className='w-100 mb-20'>
                            <div className='d-flex items-center'>
                                <Checkbox onChange={(e,v) => setIsRecurringEvent(v)} value={isRecurringEvent} />
                                <p className='form-label linear-icon d-flex items-center'>
                                    <RepeatIcon />
                                    <span className='ml-5'>Reoccurring Event</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    {isRecurringEvent && 
                    <>
                    <div className="form-col mb-10">
                        <Controller
                            name="event_reoccurence"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field: { onChange, value="Weekly" } }) => (
                            <CustomAutocomplete
                                label="Reoccurence"
                                options={['Daily', 'Weekly', 'Monthly']}
                                onChange={(e,v) => onChange(v)}
                                disableClearable={true}
                                value={value}
                                sx={{ 
                                    width: 220, 
                                    '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                    }
                                }}
                            />
                            )}
                        />
                    </div>
                    <div className="form-col">
                        <Controller
                            name="event_repeat"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                                label="Repeat Every"
                                options={['1', '2', '3', '4', '5']}
                                onChange={(e,v) => onChange(v)}
                                disableClearable={true}
                                value={value || '2'}
                                sx={{ 
                                    width: 220, 
                                    '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                    }
                                }}
                            />
                            )}
                        />
                    </div>
                    <div className="w-100 day-selector d-flex items-center flex-row mb-20">
                        <p className="form-label w-100">Occurs on</p>
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`day-circle mr-10 pointer ${selectedDays.includes(day) ? 'selected' : ''}`}
                                onClick={() => toggleDay(day)}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="w-100 mb-30">
                        <p className="form-label mb-zero">End By</p>
                        <RadioGroup className="d-flex flex-row evnt_end_opt" defaultValue="end_date">
                            <div className="w-100 d-flex align-start mb-10">
                                <FormControlLabel 
                                    className="" 
                                    value="end_date" 
                                    control={<Radio />} 
                                    label="" 
                                />
                                
                                <Controller
                                    name="evnt_end_date"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange } }) => (
                                        <CustomDatePicker
                                            label="Date"
                                            value={null}
                                            size="small"
                                            className="avail-date-filter"
                                            onChange={onChange}
                                        />
                                    )}
                                />
                            </div>

                            <div className="w-100 d-flex align-start mb-10">
                                <FormControlLabel 
                                    className="" 
                                    value="evnt_after_end_date" 
                                    control={<Radio />} 
                                    label="" 
                                />
                                <Controller
                                    name="evnt_after_end"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label="After"
                                        options={['1', '2', '3', '4','5','6']}
                                        onChange={(e,v) => onChange(v)}
                                        disableClearable={true}
                                        value={value || '2'}
                                    />
                                    )}
                                />

                                
                            </div>
                            
                            <FormControlLabel 
                                className="" 
                                value="never" 
                                control={<Radio />} 
                                label="Never" 
                            />
                        
                        </RadioGroup>
                    </div>
                    </>
                    }
                    <div className="w-100 d-flex flex-row mb-30">
                        <CustomButton className="secondary_btns mr-10" label="Reset" onClick={onReset} />
                        <CustomButton className="primary_btns mr-0" label="Save" onClick={() => setIsBufferEvent(true)} disabled={Boolean(!watch('date') || !watch('startTime') || !watch('endTime') || !watch('bufferTime'))} />
                    </div>
                </div>
            </div>
        </Drawer>
        <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Warning
        </DialogTitle>
        <CloseIcon onClick={() => setOpenDialog(false)} />
        <Divider />
        <DialogContent>
            { createEventResponse ? 
            <>
               <h2>{createEventResponse?.message}</h2> <br />
               <ul>
                 {createEventResponse?.NotAvailableEmails?.map((item: any) => {
                     return <li>{item}</li>
                 })}
               </ul>
            </> 
            : 
            createEventRoundRobinResponse ? 
            <>
               <h2>{createEventRoundRobinResponse?.message}</h2> <br />
               <ul>
                 {createEventRoundRobinResponse?.NotAvailableEmails?.map((item: any) => {
                     return <li>{item}</li>
                 })}
               </ul>
            </> 
            : null
}
        </DialogContent>
        <DialogActions>
          <CustomButton label="Cancel" onClick={() => setOpenDialog(false)} />
          {createEventResponse?.AvailableEmails?.length > 0 && <CustomButton label="Continue" onClick={handleContinueCreatingEvent} /> }
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateEventsBuffer;
