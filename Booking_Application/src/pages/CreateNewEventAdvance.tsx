import { Dialog, DialogActions, DialogContent, Drawer, Button, Checkbox } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { CREATE_NEW_EVENT, DELETE_EVENT_DRAFT, GET_CONTACTS, GET_EVENT_DRAFT, GET_EVENT_TYPES, GET_GENERAL_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS, GET_PREDEFINED_MEETS, GET_PREDEFINED_MEETS_LOCATIONS, GET_USER_EMAILS, PREVIEW_TEMPLATE, SAVE_EVENT_DRAFT, SEND_INVITE_ON_EMAIL } from "../constants/Urls";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomTimePicker from "../components/CustomTimePicker";
import Loader from "../components/Loader";
import dayjs, { Dayjs } from "dayjs";
import { AuthContext } from "../context/auth/AuthContext";
import { EventsContext } from "../context/event/EventsContext";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import ViewTemplate from "../components/ViewTemplate";
import CustomRichTextEditor from "../components/CustomRichTextEditor";
import VideoIcon from "../styles/icons/VideoIcon";
import CallIcon from "../styles/icons/CallIcon";
import LocationIcon from "../styles/icons/LocationIcon";
import CloseIcon from "../styles/icons/CloseIcon";
import Close from "@mui/icons-material/Close";
import { min } from "moment-timezone";
import { queryClient } from "../config/RQconfig";
import PreviewTemplate from "../components/PreviewTemplate";
import UpgradePopup from "./UpgradePopup";
import DropdownIcon from "../styles/icons/DropdownIcon";
import ContactBookIcon from "../styles/icons/ContactBookIcon";
import DropdownOutlinedIcon from "../styles/icons/DropdownOutlinedIcon";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import RepeatIcon from "../styles/icons/RepeatIcon";
import TempIcon from "../styles/icons/TempIcon";
import DocsIcon from "../styles/icons/DocsIcon";
import TextField from '@mui/material/TextField';
import AddContact from "./AddContact";
import AddIcon from "../styles/icons/AddIcon";
import Contacts from "./Contacts";
import CustomCheckBox from "../components/CustomCheckbox";
import moment from 'moment-timezone';
import { useEventTypes } from "../hooks/useEventTypes";


interface FormInputProps {
  title: string;
  date: Dayjs | null;
  email: any;
  startTime: Dayjs | null;
  endTime: Dayjs;
  guests: any;
  eventType: {id: number, value: string};
  eventTime: number;
  template: any;
  newTemplate: any;
  groups: any[];
  event_reoccurence: any;
  event_repeat: any;
  evnt_end_date: any;
  evnt_after_end: any;
  hideGuestList: boolean
  descriptionCheck: boolean;
  emailCheck: boolean;
  isEmailType: boolean
}

interface EventTypeProps {
    id: number;
    value: string;
}

type CompProps = {
  setOpenDialog?: (bool: boolean) => void;
  selectedSlot?: {start: Date, end: Date } | null;
  setUIMode: any;
  eventValue: any
}

const CreateNewEventAdvance: React.FC<CompProps> = ({setUIMode, eventValue}) => {
  const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
  const { state } = useContext(AuthContext);
  const {data: eventTypesData} = useEventTypes()
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone;
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const { emailData } = useContext(EventsContext);
  const [titleCount, setTitleCount] = useState('')
  const [meetAttendees, setMeetAttendees] = useState<any[]>([])
  const [memberOptions, setMemberOptions] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState('');
  const [predefinedMeetConfig, setPredefinedMeetConfig] = useState<any>()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dateFieldDisabled, setDateFieldDisabled] = useState(false)
  const [afterFieldDisabled, setAfterFieldDisabled] = useState(true)
  const [radioValue, setRadioValue] = useState('end_date')
  const [isRecurringEvent, setIsRecurringEvent] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [openContactPickDialog, setopenContactPickDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [contacts, setContacts] = useState<any[]>([])
  const navigate = useNavigate();
  const [meetType, setMeetType] = useState<number|null>();
  const [outsideMembers, setOutsideMembers] = useState<any>([])
  const [templateOptions, setTemplateOptions] = useState<any>();
  const {data: meetLocations} = useQuery('predefined-meet-locations', () => request(GET_PREDEFINED_MEETS_LOCATIONS))
//   const { data: eventTypesData } = useQuery('event-types', () => request(GET_EVENT_TYPES));
  const {data: meetData} = useQuery('predefined-meet', () => request(GET_PREDEFINED_MEETS))
  const videoMeetData = meetData?.data?.filter((item: any) => item.type === 1)
  const audioMeetData = meetData?.data?.filter((item: any) => item.type === 2)
  const inPersonMeetData = meetData?.data?.filter((item: any) => item.type === 3)
  const [view, setView] = useState('')
  const [replaceTemplate, setReplaceTemplate] = useState<any>()
  const [prevTemplate, setPrevTemplate] = useState< {predefinedMeetTypeId: number}|null>(null);
  const [removedItem, setRemovedItem] = useState<any>()

  const roundToNextFiveMinutes = (): Dayjs => {
    const now = dayjs().tz(default_timeZone);
    const minutes = now.minute();
    const roundedMinutes = Math.ceil(minutes / 5) * 5;
    return now.minute(roundedMinutes).second(0); // Reset seconds to 0
  };

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    reset,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<FormInputProps>({
    defaultValues: {
      date: dayjs().tz(default_timeZone),
      startTime: roundToNextFiveMinutes(),
      eventType: eventValue?.eventType || {id: 2, value: 'One to many'},
      eventTime: eventValue?.minutes || 30,
      event_reoccurence : {label:'Weekly',value:"WEEKLY"},
      event_repeat: "1",
      evnt_end_date: dayjs(),
      evnt_after_end: "5",
      descriptionCheck: true,
      emailCheck: true,
      isEmailType: eventValue?.type === 'email'
    },
    mode: 'onChange'
  });
  const templateValue = watch('template')
  const eventType = watch('eventType')?.id

  const watchAllFields = watch();

  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      Object.keys(parsedData).forEach((key: any) => {
        if(key === 'date' || key === 'startTime' || key === 'evnt_end_date') {
            setValue(key, dayjs(parsedData[key]).tz(default_timeZone))
        }
        else {
        setValue(key, parsedData[key]);
        }
      });
      setMeetAttendees(parsedData['meetAttendees'])
      setPredefinedMeetConfig(parsedData['predefinedMeetConfig'])
      setMeetType(parsedData['meetType'])
    }
  }, []);

    // Save form data to localStorage whenever the form changes
    useEffect(() => {
        localStorage.setItem("formData", JSON.stringify({...watchAllFields, meetAttendees, predefinedMeetConfig, meetType}));
      }, [watchAllFields, meetAttendees, predefinedMeetConfig, meetType]);

    // clear localstorage when component unmounts
    useEffect(() => {
      return () => {
          localStorage.removeItem('formData')
        };
    },[])

  useEffect(()=>{
    if((eventValue?.predefined_meet)){
        const meet = meetData?.data?.filter((item: any) => item?.id === eventValue?.predefined_meet?.id)
        if(meet){
            setPredefinedMeetConfig(meet[0])
        }
        setMeetType(eventValue?.predefined_meet?.type)
    }
    
    if(eventValue && (eventValue.type === "predefined_event" || eventValue.type === "frequently_used_events")) {
    const requiredAttendees = eventValue?.requiredGuests ? eventValue?.requiredGuests?.split(',').map((item:any) => ({email: item, isRequired: true})) : []
    const optionalAttendees = eventValue?.optionalGuests ? eventValue?.optionalGuests?.split(',').map((item:any) => ({email: item, isRequired: false})) : []
    setMeetAttendees([...requiredAttendees, ...optionalAttendees])
    setOutsideMembers([...requiredAttendees, ...optionalAttendees])
    const requiredGuests = eventValue.requiredGuests ? eventValue.requiredGuests.split(',') : []
    const optionalGuests = eventValue.optionalGuests ? eventValue.optionalGuests.split(',') : []
    setReplaceTemplate(eventValue?.template)
    reset({
        ...eventValue, 
        date: eventValue.date ? dayjs(eventValue.date).tz(default_timeZone) : null, 
        startTime: eventValue.startTime ? dayjs(eventValue.startTime).tz(default_timeZone) : null,
        guests : eventValue.eventTypeId === 1 ? eventValue?.requiredGuests : [...requiredGuests , ...optionalGuests],
        email: eventValue.senderEmail,
        template: null,
        newTemplate: eventValue.template,
    })
    setTitleCount(eventValue?.title || '')

}
  },[eventValue])

  const {data: GroupsData} = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"),{
    enabled: eventType === 4
  })
  const { data: templatesData } = useQuery('general-templates', () => request(`${GET_GENERAL_TEMPLATES}?type=create`))
//   const { data: contactsData } = useQuery('contacts', () => request(GET_CONTACTS))

  const { mutate: mutateCreateEvent, isLoading } = useMutation((body: object) => request(CREATE_NEW_EVENT, "post", body), {
    onSuccess: (data) => {
      setTitleCount('')
      showToast(ToastActionTypes.SUCCESS, data?.message)
    },
    onError: (error: any) => {
      let message = '';
      if (error.response.data?.failedEmails?.length > 0) {
        message = (
          `${error.response.data.message} \n ${error.response.data?.failedEmails.map((item: any) => `${item} \n`)}`
        )
      }
      else {
        message = error.response.data.message;
      }
      showToast(ToastActionTypes.ERROR, message)
    }
  });

  const { mutate: mutateSendInviteOnEmail, isLoading: isSendInviteLoading} = useMutation((body: object) => request(SEND_INVITE_ON_EMAIL, "post", body))

  const { data: eventDrafts } = useQuery('event-draft', () => request(GET_EVENT_DRAFT))
  const { mutate: mutateSaveDraft, isLoading: isDraftLoading } = useMutation((body: object) => request(SAVE_EVENT_DRAFT, "post", body),{
    onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, data?.message)
        if(data?.newEntry){
            setSelectedDraft(data?.newEntry)
        }
        if(data?.titleExists){
            setOpenMessageDialog(true)
        }
        queryClient.invalidateQueries('event-draft')
    }
  })
  const { mutate: mutatePreviewTemplate, isLoading: isPreviewLoading, isSuccess: isPreviewSuccess } = useMutation((body: object) => request(PREVIEW_TEMPLATE, "post", body),{
    onSuccess: (data) => {
        setPreviewTemplate(data?.data)
    }
  })
    const { mutate: deleteEventDraft, isLoading: isDeleteEventDraftLoading } = useMutation(
    (body: object) => request(DELETE_EVENT_DRAFT, "delete", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('event-draft');
      }
    }
  );
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleCreateEvent = async (formdata: FormInputProps, event:any) => {
    const eventTime = watch('eventTime')
    const  name  = event?.nativeEvent?.submitter?.name ;
    if(name === 'book') {
        if(meetAttendees.length === 0) {
            showToast(ToastActionTypes.ERROR, 'Please Add Some Attendees')
            return;
    }
    const currentDateTime = dayjs().tz(default_timeZone);
    const startDateTime = dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`,default_timeZone);
    if (currentDateTime > startDateTime) {
      showToast(ToastActionTypes.ERROR, 'Please choose a time that is not in the past');
      return;
    }

    const eventEndDate = dayjs(formdata.evnt_end_date).tz(default_timeZone).add(1, 'day');
    if((afterFieldDisabled && !dateFieldDisabled) && (isRecurringEvent) && eventEndDate.isBefore(startDateTime)){
        showToast(ToastActionTypes.ERROR, 'Please choose end date that is after start date for the recurring event');
        return;
    }
    
    
    let params: any = {
        title: formdata.title, 
        requiredGuests: meetAttendees?.filter((item) => item.isRequired).map((i) => i.email) || [],
        optionalGuests: meetAttendees?.filter((item) => !item.isRequired).map((i) => i.email) || [], 
        email: formdata.email, 
        startDateTime: dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`, default_timeZone).toISOString(),
        endDateTime: dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`, default_timeZone).add(+eventTime, 'minutes').toISOString(),
        template: formdata.newTemplate,
        predefinedEventId: eventValue?.predefinedEventId,
        eventTime: formdata.eventTime,
        eventTypeId: formdata.eventType.id,
        url: predefinedMeetConfig?.url,
        passcode: predefinedMeetConfig?.passcode,
        location: meetLocations?.data.filter((i: any) => i.id === predefinedMeetConfig?.location)[0]?.value,
        phone: predefinedMeetConfig?.phone,
        address: predefinedMeetConfig?.address,
        timezone: default_timeZone,
        hideGuestList: formdata?.hideGuestList,
        descriptionCheck: formdata.descriptionCheck,
        emailCheck: formdata.emailCheck,
        meetType: meetType
    }
    if (isRecurringEvent) {
        params.recurrence = formdata.event_reoccurence.value
        params.recurrenceRepeat = formdata.event_repeat
        params.recurrenceEndDate = (afterFieldDisabled && !dateFieldDisabled) 
        ? dayjs(formdata.evnt_end_date).tz(default_timeZone).set('hour', 23).set('minute', 59).set('second', 0)
        : undefined;
        params.recurrenceDays = formdata.event_reoccurence.label !== "Monthly" ? selectedDays.sort((a, b) => a.id - b.id) : undefined
        params.recurrenceCount= (dateFieldDisabled && !afterFieldDisabled) ? formdata.evnt_after_end : undefined
        params.recurrenceNeverEnds = (afterFieldDisabled && dateFieldDisabled) ? true : undefined
    }
    mutateCreateEvent(params);
}
else if (name === 'invite_via_email') {
    if(meetAttendees.length === 0) {
        showToast(ToastActionTypes.ERROR, 'Please Add Some Attendees')
        return;
    }
    const currentDateTime = dayjs().tz(default_timeZone);
    const startDateTime = dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`,default_timeZone);
    if (currentDateTime > startDateTime) {
      showToast(ToastActionTypes.ERROR, 'Please choose a time that is not in the past');
      return;
    }
    mutateSendInviteOnEmail({
        title: formdata.title,
        guests: meetAttendees?.map((i) => i.email) || [],
        email: formdata.email,
        date: dayjs(formdata?.date).tz(default_timeZone).format("DD/MM/YYYY"),
        startTime: dayjs(formdata?.startTime).tz(default_timeZone).format("h:mm A"),
        endTime: dayjs(formdata?.startTime).tz(default_timeZone).add(+eventTime, 'minutes').format("h:mm A"),
        template: formdata.newTemplate,
        eventTime: formdata.eventTime,
        timezone: default_timeZone,
        timezone_abbr: default_timeZone_abbr,
        hideGuestList: formdata?.hideGuestList
    })
}
else {
    let values: any = {
        id: event === 'saveAs' ? null : selectedDraft?.id,
        draftName: 'Draft-'+ Math.random(),
        title: watch('title'),
        requiredGuests: meetAttendees?.filter((item) => item.isRequired).map((i) => i.email) || [],
        optionalGuests: meetAttendees?.filter((item) => !item.isRequired).map((i) => i.email) || [],
        senderEmail: watch('email'),
        date: watch('date'),
        startTime: watch('startTime'),
        eventTime: watch('eventTime'),
        template: watch('newTemplate'),
        eventTypeId: watch('eventType').id,
        predefinedMeetId: predefinedMeetConfig ? predefinedMeetConfig.id : null,
        descriptionCheck: formdata.descriptionCheck,
        emailCheck: formdata.emailCheck,
        hideGuestList: formdata.hideGuestList
    }
    if (isRecurringEvent) {
        values.recurrence = JSON.stringify(formdata.event_reoccurence)
        values.recurrenceRepeat = formdata.event_repeat
        values.recurrenceEndDate = radioValue === 'end_date' && (afterFieldDisabled && !dateFieldDisabled) ? dayjs(formdata.evnt_end_date).tz(default_timeZone) : null
        values.recurrenceDays = formdata.event_reoccurence.label !== "Monthly" 
        ? JSON.stringify(selectedDays.sort((a, b) => a.id - b.id)) 
        : null;
        values.recurrenceCount= radioValue === 'evnt_after_end_date' &&  (dateFieldDisabled && !afterFieldDisabled) ? formdata.evnt_after_end : null
        values.recurrenceNeverEnds = radioValue === 'never' && (afterFieldDisabled && dateFieldDisabled) ? true : null
    }
    mutateSaveDraft(values)

}
  };
  
  const handleRemove = (value: any) => {
    const filteredValues = meetAttendees?.filter((item: any) => item.email !== value.email).map((i:any) => i.email)
    setOutsideMembers(filteredValues?.map((i => ({email:i}))))
    setValue('guests', (eventType === 1 ? '' : filteredValues))
    trigger('guests')
    setMeetAttendees(prev => prev.filter((item) => item.email !== value.email))
    setRemovedItem(value)
  }

  const handleClick = (value: any) => {
    setMeetAttendees(prev => prev.map((item) => ( item.email === value.email ? {...item, isRequired: !item.isRequired} : item)))
  }
//   console.log(selectedDraft)
  const handleChangeDrafts = (e:any,values:any) => {
    setTitleCount(values?.title || '')
    setSelectedDraft(values);
    if(values){
    const requiredAttendees = values.requiredGuests ? values.requiredGuests.split(',').map((item:any) => ({email: item, isRequired: true})) : [];
    const optionalAttendees = values.optionalGuests ? values.optionalGuests.split(',').map((item:any) => ({email: item, isRequired: false})) : [];
    setMeetAttendees([...requiredAttendees, ...optionalAttendees])
    setOutsideMembers([...requiredAttendees, ...optionalAttendees])

    reset({
        ...values,
        date: dayjs(values.date).tz(default_timeZone),
        guests: [...values.requiredGuests.split(',').filter((guest:string) => guest.trim() !== '') , ...values.optionalGuests.split(',').filter((guest: string)  => guest.trim() !== '')],
        email: values.senderEmail,
        startTime: dayjs(values.startTime).tz(default_timeZone),
        newTemplate: values.template,
        template: null,
        eventType: eventTypesData?.data?.filter((item: EventTypeProps) => item.id === values.eventTypeId)[0],
        event_reoccurence: JSON.parse(values?.recurrence) || {label:'Weekly',value:"WEEKLY"},
        event_repeat: values?.recurrenceRepeat || '1',
        evnt_end_date: values?.recurrenceEndDate ? dayjs(values.recurrenceEndDate) : dayjs(),
        evnt_after_end: values?.recurrenceCount || '5',
        descriptionCheck: values?.descriptionCheck,
        emailCheck: values?.emailCheck,
        hideGuestList: values?.hideGuestList,
        isEmailType: watch('isEmailType')
    })
    //Handle Predefined Meet
    if((values?.predefined_meet)){
        const meet = meetData?.data?.filter((item: any) => item?.id === values?.predefined_meet?.id)
        if(meet){
            setPredefinedMeetConfig(meet[0])
            setMeetType(values?.predefined_meet?.type)
        }
   
    }else{
        setMeetType(null)
    }

    //Handle Recurrence
    if(values?.recurrence){
        setIsRecurringEvent(true)
    }else{
        setIsRecurringEvent(false)
    }
    
    if(values?.recurrenceDays){
        setSelectedDays(JSON.parse(values?.recurrenceDays))
    }else{
        setSelectedDays(days.slice(0,5))
    }
  

    if(values?.recurrenceNeverEnds){
        setDateFieldDisabled(true);
        setAfterFieldDisabled(true);
        setRadioValue('never');
    }else if(values?.recurrenceEndDate){
        setAfterFieldDisabled(true); setDateFieldDisabled(false); setRadioValue('end_date')
    }else if(values?.recurrenceCount){
        setDateFieldDisabled(true); setAfterFieldDisabled(false); setRadioValue('evnt_after_end_date');
    }

    }else{
        reset({
            ...getValues(),
            title: '',
            guests: '',
            date: null,
            startTime: null,
            email: null,
            newTemplate: null,
            template: null,
            descriptionCheck: true,
            emailCheck: true
        })
    }
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

  const handleSelectPredefinedMeet = (item: any) =>{
    if(!view){
        setView('predefinedMeet')
    }
    // console.log(item)
    setPredefinedMeetConfig(item)
    let itemContent = watch('newTemplate')
  if(!(item?.type == predefinedMeetConfig?.type) && !(view==('template'))){
    setValue("template", null);
    itemContent = `
    ${item.title ? `<p>title: ${item.title}</p>` : ''}
    ${item.location ? `<p>location: ${(meetLocations?.data.filter((i: any) => i.id === item.location))[0]?.value}</p>` : ''}
    ${item.url ? `<p>url: ${item.url}</p>` : ''}
    ${item.address ? `<p>address: ${item.address}</p>` : ''}
    ${item.phone ? `<p>phone: ${item.phone}</p>` : ''}
    ${item.passcode ? `<p>passcode: ${item.passcode}</p>` : ''}
  `;
  }else if (!templateValue && !(view==('template'))){
    itemContent = `
    ${item.title ? `<p>title: ${item.title}</p>` : ''}
    ${item.location ? `<p>location: ${(meetLocations?.data.filter((i: any) => i.id === item.location))[0]?.value}</p>` : ''}
    ${item.url ? `<p>url: ${item.url}</p>` : ''}
    ${item.address ? `<p>address: ${item.address}</p>` : ''}
    ${item.phone ? `<p>phone: ${item.phone}</p>` : ''}
    ${item.passcode ? `<p>passcode: ${item.passcode}</p>` : ''}
  `;
  }
  
    reset({
        ...getValues(),
        // title: item.title,
        // newTemplate:  templateValue?.predefinedMeetTypeId === item.type ? selectedTemplate: itemContent, 
        newTemplate: itemContent,
        // guests: '',
        // date: null,
        // startTime: null,
        // email: null,
        // newTemplate: null,
        // template: null
    })

    // setMeetAttendees([])
  }

  // Reoccurring Events
  const days = [ 
    {id:1,label:'M',googleValue: "MO", microsoftValue: "Monday", name: 'monday'}, 
    {id:2,label:'T',googleValue: "TU", microsoftValue: "Tuesday", name: 'tuesday'}, 
    {id:3,label:'W',googleValue: "WE", microsoftValue: "Wednesday", name: 'wednesday'}, 
    {id:4,label:'Th',googleValue: "TH", microsoftValue: "Thursday", name: 'thursday'}, 
    {id:5,label:'F',googleValue: "FR", microsoftValue: "Friday", name: 'friday'}, 
    {id:6,label:'St',googleValue: "SA", microsoftValue: "Saturday", name: 'saturday'},
    {id:7,label:'S',googleValue: "SU", microsoftValue: "Sunday", name: 'sunday'}
];
  const [selectedDays, setSelectedDays] = useState<any[]>(days.slice(0,5));
  
  const toggleDay = (day: any) => {
    setSelectedDays((prevSelected) =>
      prevSelected.map(item => item.label).includes(day.label)
        ? prevSelected.filter((d) => d.label !== day.label)
        : [...prevSelected, day]
    );
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleResetRecurring = () => {
    reset({
        ...getValues(),
        event_reoccurence: {label:'Weekly',value:"WEEKLY"},
        event_repeat: '1',
        evnt_end_date: dayjs(),
        evnt_after_end: '5',
    })
    setDateFieldDisabled(false)
    setAfterFieldDisabled(true)
    setRadioValue('end_date')
    setIsRecurringEvent(false)
    setSelectedDays([])
  }
  const handleSaveClick = (event: any) => {
    handleSubmit((data) => handleCreateEvent(data, event))(); // Pass action as an argument
  };

  const handleSelectOrRemoveContact = (item: any, setContacts: React.Dispatch<React.SetStateAction<any[]>>) => {
    if(!item.selected) {
        const isExist = meetAttendees.map(i => i.email).includes(item.email) 
        if(isExist) {
            showToast(ToastActionTypes.ERROR, 'Already added in the list')
            return;
        }
        if(eventType === 1) {
            if(meetAttendees.length === 1) {
                showToast(ToastActionTypes.ERROR, 'You can only add 1 Attendee')
                return;
            }
            setValue('guests', item?.email)
            // trigger('guests')
            setMeetAttendees(() => [{email: item.email, isRequired: true}])
        } 
        else {
          setValue('guests', [...meetAttendees.map(i => i.email), item.email])
        //   trigger('guests')
          setMeetAttendees((prev) => [...prev, {email: item.email, isRequired: true}])
        }
    }
    else {
        setValue('guests', meetAttendees.filter(i => i.email !== item.email).map(j => j.email))
        setMeetAttendees(prev => prev.filter((el) => el.email !== item.email))
    }

    setContacts(prev => prev?.map(el => el.id === item.id ? {...el, selected: !item.selected} : el))
  }

  //Watch for field value changes
  const date = watch("date");
  const startTime = watch("startTime");

  // Watch for template changes
  const selectedTemplate = watch("newTemplate");

  // Function to replace placeholders in the template
//   const replacePlaceholders = (template:any, replacements:any) => {
//     return template.replace(/\${(.*?)}/g, (_:any, key:any) => replacements[key] || `\${${key}}`);
//   };


  //update  template with the field updated values   
//   useEffect(() => {
//     if (replaceTemplate && (view !== 'predefinedMeet' || templateValue)) {
//       const replacedTemplate = replacePlaceholders(replaceTemplate, {
//         date: date && date.format("DD/MM/YYYY"),
//         phone:  predefinedMeetConfig?.phone,
//         time: startTime && startTime.format("h:mm A"),
//         passcode: predefinedMeetConfig?.passcode,
//         url: predefinedMeetConfig?.url,
//         address: predefinedMeetConfig?.address,
//         location: meetLocations?.data.filter((i: any) => i.id === predefinedMeetConfig?.location)[0]?.value,
//         // website,
//       });

//       // Update newTemplate field with the replaced template content
//       setValue("newTemplate", replacedTemplate);
//     }
//   }, [
//         // selectedTemplate,
//         // templateValue, 
//         replaceTemplate,
//         date,
//         startTime,
//         predefinedMeetConfig,
//     ]);
    useEffect(() => {
        if (view == 'predefinedMeet') {
          // Filter templates where meetType matches options.id
          const filteredOptions = templatesData.data.filter((option: any) => option.predefinedMeetTypeId === meetType);
          setTemplateOptions(filteredOptions);
        }else if(templatesData?.data){
            setTemplateOptions(templatesData?.data);
        }
      }, [templatesData, meetType]); 
  return (
    <>
    {(isLoading || isDraftLoading || isPreviewLoading) && <Loader />}
        <div className="w-100">
            <h3 className="d-flex items-center">
                <span className='back-to mr-10 d-flex items-center cursur-pointer' onClick={() => setUIMode(0)}><BackArrowIcon /></span>
                <span className="cursur-pointer" onClick={() => setUIMode(0)}>Back</span>
            </h3>
        </div>
            <div className="d-flex justify-between align-start">
                <div className="form-elements w-73">
        <form onSubmit={handleSubmit(handleCreateEvent)} onKeyDown={handleKeyDown} className="create-event-form">
                    <div className="d-flex align-end justify-between mb-50">
                        <div className="d-flex align-end w-80">
                            <p className="font-bold m-zero mr-10">EVENT:</p>
                            <div className="evnt_typ mr-10">
                                <Controller
                                    name="eventType"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label=""
                                        options={eventTypesData?.data}
                                        getOptionLabel={option => option.value}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(e,v) =>{
                                        onChange(v)
                                        setValue('guests', (eventType === 1 ? '' : []))
                                        setValue('groups', [])
                                        setMeetAttendees([])
                                        setValue('eventTime', 30)
                                        clearErrors()
                                        }}
                                        value={value || null}
                                        disableClearable={true}
                                        error={!!errors?.eventType}
                                        helperText={errors?.eventType?.message}                
                                    />
                                    )}
                                />
                            </div>
                            {eventType !== 3 && <div className="evnt_duratn mr-20">
                                <Controller
                                    name="eventTime"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                    label=""
                                    options={[15, 30, 45, 60]}
                                    value={value as any}
                                    getOptionLabel={option => option + ' min'}
                                    onChange={(e,v) => onChange(v)}
                                    error={!!errors?.eventTime}
                                    helperText={errors?.eventTime?.message}              
                                    />
                                )}
                                />
                            </div>}
                            { eventType === 3 && 
                                <div className="evnt_duratn mr-20">
                                    <Controller
                                    name="eventTime"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="Durations (Mins)"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            sx={{ marginBottom: 2, width: 300 }}
                                            onChange={onChange}
                                            error={!!errors?.eventTime}
                                            helperText={errors?.eventTime?.message}
                                            inputProps={{min: 1}}
                                            value={value}
                                        />
                                    )}
                                    />
                                </div>
                            }

                            
                            {(eventValue?.type !== 'email' && !watch('isEmailType')) && <div className="evnt_cl_typ d-flex mr-10">
                                <div className={`evnt_cl_typ_item ${meetType === 1 ? 'active_item' : ''} ${(!(templateValue?.predefinedMeetTypeId === 2 || templateValue?.predefinedMeetTypeId === 3)|| (view == 'predefinedMeet')) ? '' : 'opacity-5 pointer-none'}`}>
                                    <p>Video Call</p>
                                    <VideoIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    {(!(templateValue?.predefinedMeetTypeId === 2 || templateValue?.predefinedMeetTypeId === 3)|| (view == 'predefinedMeet') ) && (
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
                                    )}
                                </div>
                                <div className={`evnt_cl_typ_item ${meetType === 2 ? 'active_item' : ''} ${(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 3)||(view == 'predefinedMeet'))? '' : 'opacity-5 pointer-none'}`} >
                                    <p>Phone Call</p>
                                    <CallIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    {(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 3)||(view == 'predefinedMeet'))  && (
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
                                    )}
                                </div>
                                <div className={`evnt_cl_typ_item ${meetType === 3 ? 'active_item' : ''} ${(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 2) || (view == 'predefinedMeet')) ? '': 'opacity-5 pointer-none'}`} >
                                    <p>In Person</p>
                                    <LocationIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    {(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 2) || (view == 'predefinedMeet'))  && (
                                    <ul className="mt_opt_itms">
                                    {inPersonMeetData?.map((item: any) =>{
                                             return <li className={`mt_opt_itm ${predefinedMeetConfig?.id === item?.id ? 'active_item' : ''}`} onClick={() => {handleSelectPredefinedMeet(item); setMeetType(3)}}>
                                                {item.title}
                                                <span className="mt_dtls">{item.address}</span>
                                            </li>
                                        })}
                                    </ul>
                                    )}
                                </div>
                            </div> 
                            }
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
                                    // rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label=''
                                        options={templateOptions || []}
                                        groupBy={option => option.group}
                                        getOptionLabel={option => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, selectedValue) => {
                                        onChange(selectedValue);
                                        setValue('newTemplate', selectedValue.template)
                                        setReplaceTemplate(selectedValue.template)
                                        if(!view){
                                            setView('template')
                                        }
                                        
                                        if(view === 'template'){
                                            if (prevTemplate?.predefinedMeetTypeId !== selectedValue.predefinedMeetTypeId) {
                                                setPredefinedMeetConfig(null)
                                                setMeetType(null)
                                              }
                                           
                                        }
                                        setPrevTemplate(selectedValue);
                                        }}
                                        value={value || null}
                                        // error={!!errors.template}
                                        // helperText={errors?.template?.message as string}
                                        disableClearable
                                    />
                                    )}
                                />
                            </div>
                        </div>

                        <div className='w-15 draft-opt drft_tmp_opt'>
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
                                options={(eventValue?.type === 'email' && watch('isEmailType'))
                                    ? eventDrafts?.data?.filter((draft: any) => draft.recurrence === null) 
                                    : eventDrafts?.data || []
                                  } 
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
                                        guests: '',
                                        date: null,
                                        startTime: null,
                                        email: null,
                                        newTemplate: null,
                                        template: null,
                                        descriptionCheck: true,
                                        emailCheck: true
                                    })
                                    setTitleCount('')
                                    }
                                }}
                                disableClearable
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-between mb-30">

                        {/* Add Event Title */}
                        <div className="w-49">
                            <label className="input-label">Title (Text {`${titleCount?.length || 0}/30`} Characters)</label> 
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                    label=""
                                    size="small"
                                    fullWidth
                                    sx={{ marginBottom: 2, width: 300 }}
                                    onChange={onChange}
                                    value={value || ''}
                                    error={!!errors?.title}
                                    helperText={errors?.title?.message}
                                    inputProps={{ maxLength: 30 }}
                                    onInput={(e: any) => setTitleCount(e.target.value)}
                                />
                                )}
                            />
                        </div>
 
                        { eventType === 4 && 
                            <>
                            <div className="w-24">
                                <Controller
                                    name="groups"
                                    control={control}
                                    // rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label="Select group"
                                        options={ GroupsData?.data || []}
                                        getOptionLabel={option => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(e,v) =>{ 
                                            onChange(v)
                                            let members = v?.flatMap((item: any) => item.groupMembers) || []
                                            const removedDuplicates = members.reduce((accumulator: any, current: any) => {
                                                if (!accumulator.some((item: any) => item.id === current.id)) {
                                                accumulator.push(current);
                                                }
                                                return accumulator;
                                            }, []);
                                            setMemberOptions(removedDuplicates.map((item: any) => item.email))
                                            setValue('guests', removedDuplicates.map((item: any) => item.email))
                                            setMeetAttendees((prev) => {
                                                return removedDuplicates.map((item: any, index: number) => {
                                                    if(item.email === prev[index]?.email) {
                                                        return prev[index]
                                                    }
                                                    else {
                                                        return {email: item.email, isRequired: true}
                                                    }
                                                })
                                            })
                                        }}
                                        // error={!!errors?.groups}
                                        // helperText={errors?.groups?.message as string}
                                        value={value || []}
                                        multiple
                                    />
                                    )}
                                />
                            </div>
                            <div className="w-24">
                                <Controller
                                    name="guests"
                                    control={control}
                                    // rules={{ 
                                    //     required: "This field is required",
                                    //     validate: (value) => {
                                    //         if(Array.isArray(value)){
                                    //         const invalidEmails = value?.filter((email: string) => 
                                    //             !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)
                                    //         );
                                    //         if (invalidEmails.length) {
                                    //             return "One or more email addresses are invalid !!";
                                    //         }
                                    //         return true;
                                    //     }
                                    //     }
                                    // }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label="Members"
                                        options={memberOptions}
                                        onChange={(e,v) =>{
                                            onChange(v)
                                            setMeetAttendees((prev) => {
                                                return v.map((item: any, index: number) => {
                                                    if(item === prev[index]?.email) {
                                                        return prev[index]
                                                    }
                                                    else {
                                                        return {email: item, isRequired: true}
                                                    }
                                                })
                                            })
                                        }}
                                        // error={!!errors?.guests}
                                        // helperText={errors?.guests?.message as string}
                                        value={value || []}
                                        multiple
                                        limitTags={2}
                                        disableClearable
                                        renderTags={() => null}
                                    />
                                    )}
                                />
                            </div>
                        </>
                        }

                        {eventType === 1 ? (
                            <div className="w-49">
                                <Controller
                                    name="guests"
                                    control={control}
                                    // rules={{ 
                                    //     required: "This field is required",
                                    //     pattern: {
                                    //         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                    //         message: "Invalid email address",
                                    //     },
                                    // }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomTextField
                                        label="Add one Guest"
                                        size="small"
                                        fullWidth
                                        sx={{ marginBottom: 2, width: 300 }}
                                        onChange={(e) => {
                                            let value = e?.target?.value.trim()
                                            setOutsideMembers(value.length > 0 ? [{email: value}] : [])
                                            onChange(value)
                                            setMeetAttendees(value.length > 0 ? [{email: value, isRequired: true}] : [])
                                        }}
                                        // error={!!errors?.guests}
                                        // helperText={errors?.guests?.message as string}
                                        value={value}
                                    />
                                    )}
                                />
                            </div>
                        ) : (eventType === 2 || eventType === 3) ?
                            <div className="w-49">
                                <Controller
                                    name="guests"
                                    control={control}
                                    // rules={{ 
                                    // required: "This field is required",
                                    // validate: (value) => {
                                    //     if(Array.isArray(value)){
                                    //     const invalidEmails = value?.filter((email: string) => 
                                    //         !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)
                                    //     );
                                    //     if (invalidEmails.length) {
                                    //         return "One or more email addresses are invalid";
                                    //     }
                                    //     return true;
                                    // }
                                    // },
                                    // }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label="Add Multiple Guests"
                                        options={[]}
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
                                                    return {email: item, isRequired: true}
                                                }
                                        })
                                        })
                                        }}
                                        // error={!!errors?.guests}
                                        // helperText={errors?.guests?.message as string}
                                        value={value || []}
                                        multiple
                                        freeSolo
                                        limitTags={2}
                                        renderTags={() => null}
                                        disableClearable={true}
                                    />
                                    )}
                                />
                            </div>
                        : null
                        }
                    </div>

                    <div className="d-flex justify-between mb-30">
                       
                        
                        <div className="w-30">
                            <Controller
                                name="date"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange } }) => (
                                    <CustomDatePicker
                                    label="Date"
                                    value={watch("date") || null}
                                    size="small"
                                    className="avail-date-filter"
                                    onChange={onChange}
                                    disablePast={true}
                                    error={!!errors?.date}
                                    helperText={errors?.date?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Event Time Col */}
                        <div className="w-25">
                            <Controller
                                name="startTime"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange } }) => (
                                    <CustomTimePicker
                                    label="Time"
                                    value={watch("startTime") || null}
                                    size="small"
                                    className="avail-date-filter"
                                    onChange={onChange}
                                    error={!!errors?.startTime}
                                    helperText={errors?.startTime?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Event Select Email */}
                        <div className="w-42">
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field: { onChange, value } }) => (
                                <CustomAutocomplete
                                    label="Pick Email Sender"
                                    options={emailData?.map((item)=> item.email) || []}
                                    onChange={(e,v) => onChange(v)}
                                    error={!!errors?.email}
                                    helperText={errors?.email?.message as string}
                                    disableClearable={true}
                                    value={value || null}
                                />
                                )}
                            />
                        </div>
                       
                    </div>
                    <div className='d-flex justify-between w-100'>
                        <div className="w-70 d-flex items-center">
                            <div className="mr-20">
                                <Controller
                                    name="hideGuestList"
                                    control={control}
                                    render={({ field: { onChange,value} }) => (
                                    <CustomCheckBox
                                        label="Hide Guest List"
                                        onChange={onChange}
                                        labelPlacement='end'
                                        checked={value || false}
                                    />
                                    )}
                                /> 
                            </div>
                            {(eventValue?.type !== 'email' && !watch('isEmailType')) &&
                                <>
                                    <div className="mr-20">
                                        <Controller
                                            name="descriptionCheck"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                            <CustomCheckBox
                                                label="Use template in description"
                                                onChange={onChange}
                                                labelPlacement='end'
                                                checked={value}
                                            />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Controller
                                            name="emailCheck"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                            <CustomCheckBox
                                                label="Send template as email"
                                                onChange={onChange}
                                                labelPlacement='end'
                                                checked={value}
                                            />
                                            )}
                                        />
                                    </div>
                                </>
                            }
                        </div>
                        <div>
                            {(eventValue?.type !== 'email' && !watch('isEmailType')) && <div className="w-100 mt-10 mb-30">
                                <button type="button" className="MuiButton-root  secondary_btns" onClick={handleToggleDrawer} >
                                    <span className="linear-icon mr-10"><RepeatIcon /></span>
                                    <span>Reoccurring Event</span>
                                </button>  
                            </div>}
                        </div>
                        
                    </div>
                    
                    {isRecurringEvent && <div className="mb-30" style={{fontWeight: 'bold'}}> 
                        Recurring Type: {watch('event_reoccurence')?.label}, &nbsp;
                        Repeat Every: {watch('event_repeat')}, &nbsp;
                        End After: {radioValue === "end_date" ? dayjs(watch('evnt_end_date')).format("DD-MM-YYYY") : radioValue === "evnt_after_end_date" ? `${watch("evnt_after_end")} Occurences` : radioValue === "never" ? "Never" : null }, &nbsp;
                        </div> }
                    <div className="d-flex flex-row mb-50">
                        <div className="w-100 mb-70">
                            <Controller
                                name="newTemplate"
                                control={control}
                                rules={{ 
                                    required: "This field is required",
                                    validate: (value) => {
                                        if(value === "<p><br></p>") {
                                          return "This field is required"
                                        }
                                        return true
                                    } 
                                }}
                                render={({ field: { onChange, value } }) => (
                                <CustomRichTextEditor 
                                    onChange={onChange}
                                    value={value}
                                />
                                )}
                            />
                        </div>
                        <small style={{color: 'red'}}>{errors?.newTemplate?.message as string}</small>
                    </div>

                    <div className="d-flex justify-between">
                        <div className="d-flex items-center">
                            {/* <CustomButton className="secondary_btns mr-25" label="Save as Draft" name="save" type="submit" /> */}
                            <div className="btn_wth_opts mr-25">
                                <span className="MuiButton-root secondary_btns"><span className="mr-20">Save Draft</span><DropdownIcon /></span>
                                <ul className="opnts">
                                <li onClick={() => handleSaveClick('save')}>Save</li>
                                <li onClick={() => handleSaveClick('saveAs')}>Save As</li>
                                 </ul>
                            </div>
                            <CustomButton className="primary_btns mr-25" label="Preview" disabled={!watch('newTemplate')} onClick={handlePreviewTemplate} />
                            {(eventValue?.type !== 'email' && !watch('isEmailType')) ? <CustomButton className="primary_btns" label="Create Event" name="book" type="submit" />
                            : <CustomButton className="primary_btns" label="Create Event" name="invite_via_email" type="submit" /> }

                        </div>
                    </div>
                    </form>
                </div>
                {isPreviewSuccess && <PreviewTemplate value={previewTemplate} />}
                {/* Contact List Column */}
                <div className="contact-user-list w-24">
                    <div className="d-flex justify-end pl-20 pr-20">
                    <Contacts eventType={eventType} outsideMembers={outsideMembers} handleSelectOrRemoveContact={handleSelectOrRemoveContact} removedItem={removedItem} meetAttendees={meetAttendees} selectedDraft={selectedDraft} />
                    </div>
                    <div className="user-avlty pl-20 pr-20">
                        <span className="Mndty_usr">Mandatory Attendee</span>
                        <span className="opt_usr">Optional Attendee</span>
                    </div>
                    <div className="contact-list-col">

                        <div className="contact-item-list pl-20 pr-20">
                            {/* Contact Item */}
                            { meetAttendees?.map((item: any) => {
                                return (
                                    <div 
                                        className={`contact-item ${item.isRequired ? '' : 'optnl_usr'}`}
                                        key={item.email} 
                                        onClick={()=> handleClick(item)}
                                    >
                                        <div className="d-flex items-center mb-5">
                                            <div className="usr_img">
                                                <img src="/contact-user.png" alt="" />
                                            </div>
                                            <div className="usr_dtl d-flex flex-column">
                                                <span className="usr_nme">Test name</span>
                                                <span className="usr_eml">{item.email}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <span className="usr_tg">Title</span>
                                            <span className="usr_tg">Group</span>
                                            <span className="usr_tg">Company</span>
                                        </div>
                                        <span className="contact-remove" onClick={() => handleRemove(item)}><CloseIcon /></span>
                                    </div>
                                )
                            })}
                            </div>
                    </div>
                </div>
            </div>

        <Drawer
            anchor={"right"}
            title="Reoccurring Event"
            onClose={() => setIsDrawerOpen(false)}
            open={isDrawerOpen}
            className="reoccur_evnt_pup"
            variant="persistent"
        >
            <div className="popup-inner">
                <div className="d-flex justify-end">
                    <span className="pointer cls_icn" onClick={() => setIsDrawerOpen(false)}><CloseIcon /></span>
                </div>
                <div className="form-wrapper">
                    <div className="form-col mb-10">
                        <Controller
                            name="event_reoccurence"
                            control={control}
                            rules={{ required: "This field is required" }}
                            // defaultValue={}
                            render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                                label="Reoccurence"
                                options={[{label:'Daily', value:'DAILY'}, {label:'Weekly',value:"WEEKLY"}, {label:'Monthly',value:"MONTHLY"}]}
                                onChange={(e,v) => {
                                    onChange(v)
                                    setSelectedDays([])
                                }}
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
                    {/* {watch('event_reoccurence')?.label !== "Daily" &&  */}
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
                    {/* } */}
                    {watch('event_reoccurence')?.label === "Weekly" && 
                    <div className="w-100 day-selector d-flex items-center flex-row mb-20">
                        <p className="form-label w-100">Occurs on</p>
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`day-circle mr-10 pointer ${selectedDays.map(item => item.label).includes(day.label) ? 'selected' : ''}`}
                                onClick={() => toggleDay(day)}
                            >
                                {day.label}
                            </div>
                        ))}
                    </div>
                    }
                    <div className="w-100 mb-30">
                        <p className="form-label mb-zero">End By</p>
                        <RadioGroup className="d-flex flex-row evnt_end_opt" defaultValue={radioValue}>
                            <div className="w-100 d-flex align-start mb-10">
                                <FormControlLabel 
                                    className="" 
                                    value="end_date" 
                                    control={<Radio onChange={() => {setAfterFieldDisabled(true); setDateFieldDisabled(false); setRadioValue('end_date');}} />} 
                                    label="" 
                                /> 
                                <Controller
                                    name="evnt_end_date"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomDatePicker
                                            label="Date"
                                            value={value}
                                            size="small"
                                            className="avail-date-filter"
                                            onChange={onChange}
                                            disabled={dateFieldDisabled}
                                        />
                                    )}
                                />
                            </div>

                            <div className="w-100 d-flex align-start mb-10">
                                <FormControlLabel 
                                    className="" 
                                    value="evnt_after_end_date" 
                                    control={<Radio onChange={() => {setDateFieldDisabled(true); setAfterFieldDisabled(false); setRadioValue('evnt_after_end_date');}} />} 
                                    label="" 
                                />
                                <Controller
                                    name="evnt_after_end"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label="After (Occurence)"
                                        options={['1', '2', '3', '4','5','6']}
                                        onChange={(e,v) => onChange(v)}
                                        disableClearable={true}
                                        value={value}
                                        disabled={afterFieldDisabled}
                                    />
                                    )}
                                />

                                
                            </div>
                            
                            <FormControlLabel 
                                className="" 
                                value="never" 
                                control={<Radio onChange={() => {setDateFieldDisabled(true); setAfterFieldDisabled(true); setRadioValue('never');}} />} 
                                label="Never" 
                            />
                        
                        </RadioGroup>
                    </div>
                    <div className="w-100 d-flex flex-row">
                        <CustomButton className="secondary_btns mr-10" label="Reset" onClick={handleResetRecurring} />
                        <CustomButton className="primary_btns mr-0" label="Save" onClick={() => setIsRecurringEvent(true)} />
                    </div>
                </div>
            </div>
        </Drawer>
        <Dialog
            open={openMessageDialog}
            PaperProps={{
                sx: {
                padding: "16px", 
                textAlign: "center", 
                },
            }}
            >
            <DialogContent>
                <p style={{ fontSize: "18px", margin: 0 }}>
                    Draft title already exists - Choose another title
                </p>
                <CustomButton
                label="Close"
                className="secondary_btns"
                onClick={() => setOpenMessageDialog(false)}
                sx={{ marginTop: "12px" }}
                />
            </DialogContent>
            </Dialog>

    </>
  );
};

export default CreateNewEventAdvance;
