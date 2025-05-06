import { Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { FC, useContext, useEffect, useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../../components/CustomAutocomplete';
import CustomTextField from '../../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import request from '../../services/http';
import { CREATE_EVENT_TEMPLATE, EDIT_EVENT_TEMPLATE, GET_GENERAL_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS, GET_PREDEFINED_MEETS, GET_PREDEFINED_MEETS_LOCATIONS, PREVIEW_TEMPLATE } from '../../constants/Urls';
import { ToastActionTypes } from '../../utils/Enums';
import showToast from '../../utils/toast';
import Loader from '../../components/Loader';
import { queryClient } from '../../config/RQconfig';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomCheckBox from '../../components/CustomCheckbox';
import CloseIcon from "@mui/icons-material/Close";
import CustomRichTextEditor from '../../components/CustomRichTextEditor';
import CreateNewEvent from '../CreateNewEvent';
import dayjs, { Dayjs } from 'dayjs';
import CustomDatePicker from '../../components/CustomDatePicker';
import CustomTimePicker from '../../components/CustomTimePicker';
import { EventsContext } from '../../context/event/EventsContext';
import { AuthContext } from '../../context/auth/AuthContext';
import { useLocation, useNavigate } from "react-router-dom";
import VideoIcon from "../../styles/icons/VideoIcon";
import CallIcon from "../../styles/icons/CallIcon";
import LocationIcon from "../../styles/icons/LocationIcon";
import UpgradePopup from '../UpgradePopup';
import BackArrowIcon from '../../styles/icons/BackArrowIcon';
import DropdownIcon from '../../styles/icons/DropdownIcon';
import TempIcon from '../../styles/icons/TempIcon';
import Contacts from '../Contacts';
import PreviewTemplate from '../../components/PreviewTemplate';

interface FormInputProps {
    title: string;
    date: Dayjs | null;
    email: any;
    startTime: Dayjs | null;
    endTime: Dayjs;
    requiredGuests: any;
    optionalGuests: any;
    eventType: {id: number, value: string};
    eventTime: number;
    template: any;
    newTemplate: any;
    groups: any[]
  }

const AddEventTemplate: FC = () => {
    const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
    const { emailData } = useContext(EventsContext);
    const navigate = useNavigate();
    const location = useLocation()
    console.log(location)
    const formData = location.state?.data;
    const [titleCount, setTitleCount] = useState('')
    const [memberOptions, setMemberOptions] = useState([])
    const [openUpgradePopup, setOpenUpgradePopup] = useState(false)
    const { state } = useContext(AuthContext);
    const system_timeZone = dayjs.tz.guess()
    const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
    const { data: templatesData } = useQuery('general-templates', () => request(`${GET_GENERAL_TEMPLATES}?type=create`))
    const {data: GroupsData, isLoading: isGroupLoading} = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"))
    const {data: meetData} = useQuery('predefined-meet', () => request(GET_PREDEFINED_MEETS))
    const videoMeetData = meetData?.data?.filter((item: any) => item.type === 1)
    const audioMeetData = meetData?.data?.filter((item: any) => item.type === 2)
    const inPersonMeetData = meetData?.data?.filter((item: any) => item.type === 3)
    const [predefinedMeetConfig, setPredefinedMeetConfig] = useState<any>()
    const [view, setView] = useState('')
    const [meetType, setMeetType] = useState<number|null>();
    const {data: meetLocations} = useQuery('predefined-meet-locations', () => request(GET_PREDEFINED_MEETS_LOCATIONS))
    const [meetAttendees, setMeetAttendees] = useState<any[]>([])
    const [outsideMembers, setOutsideMembers] = useState<any>([])
    const [templateOptions, setTemplateOptions] = useState<any>();
    // const [replaceTemplate, setReplaceTemplate] = useState<any>()
    const [prevTemplate, setPrevTemplate] = useState< {predefinedMeetTypeId: number}|null>(null);
    const [removedItem, setRemovedItem] = useState<any>()
    const [previewTemplate, setPreviewTemplate] = useState('');

    const { mutate: mutate, isLoading } = useMutation((body: object) => request(formData ? EDIT_EVENT_TEMPLATE : CREATE_EVENT_TEMPLATE, "post", formData ? {...body, id: formData.id} : body), {
        onSuccess: (data) => {
          showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
            queryClient.invalidateQueries('predefined-event-templates')
            navigate('/event-templates', {state: {view: location.state?.view, from: location.state?.from}})
        },
        onError: (error: any) => {
            const errorObject = error?.response.data
            if(errorObject?.subscriptionError) {
                setOpenUpgradePopup(true)
            }
            showToast(ToastActionTypes.ERROR, errorObject.message)
          }
    })
    useEffect(() => {
        if (formData) {
            reset({
          ...formData,
          date: dayjs(formData.date).tz(default_timeZone),
          startTime: dayjs(formData.startTime).tz(default_timeZone),
          eventType: EVENT_TYPES.filter((item) => item.id === formData.eventTypeId)[0],
          optionalGuests: formData.optionalGuests.split(','),
          requiredGuests: formData?.eventTypeId === 1 ? formData.requiredGuests : formData.requiredGuests.split(','),
          email: formData.senderEmail,
          template: null,
          newTemplate: formData.template,
          groups: GroupsData?.data?.filter((item: any) => formData?.groupId?.split(',').some((gId: any) => +gId === item.id))
        })
        const required = formData?.requiredGuests && formData?.requiredGuests?.split(',')?.map((i:any) => ({email: i, isRequired: true}))
        const optional = formData?.optionalGuests && formData?.optionalGuests?.split(',')?.map((i:any) => ({email: i}))
        setMeetAttendees([...required, ...optional])
    }
    },[formData, GroupsData])

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
          eventType: {id: 1, value: "One to one"},
          eventTime: 30
        },
        mode: 'onChange'
      });

    const onSubmit = (formData: FormInputProps) => {
        if(meetAttendees.length < 1) {
            showToast(ToastActionTypes.ERROR, "Atleast one attendee is required")
            return;
        }
        mutate({
          ...formData, 
          eventTypeId: formData.eventType.id, 
          senderEmail: formData.email, 
          requiredGuests:  meetAttendees?.filter((item) => item.isRequired).map((i) => i.email) || [],
          optionalGuests: meetAttendees?.filter((item) => !item.isRequired).map((i) => i.email) || [],
          template: formData.newTemplate,
          groupId: formData.groups ? formData.groups.map((item)=> item.id ) : null,
          predefinedMeetId : predefinedMeetConfig?.id
        })
    }
    const { mutate: mutatePreviewTemplate, isLoading: isPreviewLoading, isSuccess: isPreviewSuccess } = useMutation((body: object) => request(PREVIEW_TEMPLATE, "post", body),{
        onSuccess: (data) => {
            setPreviewTemplate(data?.data)
        }
      })
    const handlePreviewTemplate = () => {
        const date = watch('date');
        const startTime = watch('startTime')
        mutatePreviewTemplate({
            template: watch('newTemplate'),
            // datetime: (date && startTime) ? dayjs(`${date?.format("YYYY-MM-DD")} ${startTime?.format("HH:mm")}`).utc() : null,
            time: startTime ? dayjs(startTime).tz(default_timeZone).format("h:mm A") : null,
            url: predefinedMeetConfig?.url,
            passcode: predefinedMeetConfig?.passcode,
            location: meetLocations?.data.filter((i: any) => i.id === predefinedMeetConfig?.location)[0]?.value,
            phone: predefinedMeetConfig?.phone,
            address: predefinedMeetConfig?.address,
            timezone: default_timeZone
        })
      }
  //   const requiredGuests = watch('requiredGuests');
  // const optionalGuests = watch('optionalGuests');

  // const validateRequiredGuests = (guests: any) => {
  //   if (optionalGuests?.some((guest: any) => guests.includes(guest))) {
  //     return 'Duplicate Guests found in optional and required Attendees';
  //   }
  //   // trigger('requiredGuests')
  //   else {
  //     clearErrors('requiredGuests')
  //     clearErrors('optionalGuests')
  //   }
  //   return true;
  // };

  // const validateOptionalGuests = (guests: any) => {
  //   if (requiredGuests?.some((guest: any) => guests.includes(guest))) {
  //     return 'Duplicate Guests found in optional and required Attendees';
  //   }
  //   else {
  //     clearErrors('requiredGuests')
  //     clearErrors('optionalGuests')
  //   }
  //   // trigger('requiredGuests')
  //   return true;
  // };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  const templateValue = watch('template')
  const selectedTemplate = watch("newTemplate");
  const eventType = watch('eventType')?.id
  const startTime = watch('startTime')

const handleSelectPredefinedMeet = (item: any) =>{
    if(!view){
        setView('predefinedMeet')
    }

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
        newTemplate: itemContent, 
        // guests: '',
        // date: null,
        // startTime: null,
        // email: null,
        // newTemplate: null,
        // template: null
    })
    setPredefinedMeetConfig(item)
    // setMeetAttendees([])
  }
  const handleClick = (value: any) => {
    setMeetAttendees(prev => prev.map((item) => ( item.email === value.email ? {...item, isRequired: !item.isRequired} : item)))
  }
    
  const handleRemove = (value: any) => {
    const filteredValues = meetAttendees?.filter((item: any) => item.email !== value.email).map((i:any) => i.email)
    setOutsideMembers(filteredValues?.map((i => ({email:i}))))
    setValue('requiredGuests', (eventType === 1 ? '' : filteredValues))
    trigger('requiredGuests')
    setMeetAttendees(prev => prev.filter((item) => item.email !== value.email))
    setRemovedItem(value)
  }
    // Function to replace placeholders in the template
    // const replacePlaceholders = (template:any, replacements:any) => {
    //     return template.replace(/\${(.*?)}/g, (_:any, key:any) => replacements[key] || `\${${key}}`);
    //   };

    //update  template with the field updated values   
    // useEffect(() => {
    
    //     if (templateValue) {
    //       const replacedTemplate = replacePlaceholders(templateValue?.template, {
    //         // date: date && date.format("DD/MM/YYYY"),
    //         phone:  predefinedMeetConfig?.phone,
    //         // time: startTime && startTime.format("h:mm A"),
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
    //         templateValue, 
    //         // date,
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
                    setValue('requiredGuests', item?.email)
                    setMeetAttendees(() => [{email: item.email, isRequired: true}])
                } 
                else {
                  setValue('requiredGuests', [...meetAttendees.map(i => i.email), item.email])
                  setMeetAttendees((prev) => [...prev, {email: item.email, isRequired: true}])
                }
            }
            else {
                setValue('requiredGuests', meetAttendees.filter(i => i.email !== item.email).map(j => j.email))
                setMeetAttendees(prev => prev.filter((el) => el.email !== item.email))
            }
        
            setContacts(prev => prev?.map(el => el.id === item.id ? {...el, selected: !item.selected} : el))
          }

  return (
    
    <div className='page-wrapper mb-20 top_algn-clr-mode'>
        {(isGroupLoading || isLoading) && <Loader />}
        <div className="d-flex justify-between items-center mb-20">
            <h1>
                <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
                {formData ? 'Edit' : 'Create New' } Event Template
            </h1>
            
        </div>
        <div className='card-box'>
            <div className='d-flex justify-between align-start adv_crt_evnt_col'>
                <div className='form-elements w-70'>
                    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className='crt_evnt_tmplt_frm create-event-form'>
                        <div className='d-flex align-end mb-50'>    
                            <p className="font-bold m-zero mr-15">EVENT:</p>
                            <div className="evnt_typ mr-20">
                                <Controller
                                    name="eventType"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomAutocomplete
                                        label=""
                                        options={EVENT_TYPES}
                                        getOptionLabel={option => option.value}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(e,v) =>{
                                        onChange(v)
                                        setValue('requiredGuests', '')
                                        setValue('optionalGuests', '')
                                        setMeetAttendees([])
                                        }}
                                        value={value || null}
                                        disableClearable={true}
                                        error={!!errors?.eventType}
                                        helperText={errors?.eventType?.message}                
                                    />
                                    )}
                                />
                            </div>

                            { eventType !== 3 ? <div className="evnt_duratn mr-25">
                                <Controller
                                    name="eventTime"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange,value } }) => (
                                    <CustomAutocomplete
                                        label=""
                                        options={[15, 30, 45, 60]}
                                        getOptionLabel={option => option + ' min'}
                                        onChange={(e,v) => onChange(v)}
                                        value={value as any}
                                        error={!!errors?.eventTime}
                                        helperText={errors?.eventTime?.message}              
                                    />
                                    )}
                                />
                            </div>
                            :
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
                            <div className="evnt_cl_typ d-flex mr-10">
                                <div className={`evnt_cl_typ_item ${meetType === 1 ? 'active_item' : ''} ${(!(templateValue?.predefinedMeetTypeId === 2 || templateValue?.predefinedMeetTypeId === 3)|| (view == 'predefinedMeet') ) ? '' : 'opacity-5 pointer-none'}`}>
                                    <p>Video Call</p>
                                    <VideoIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                     {(!(templateValue?.predefinedMeetTypeId === 2 || templateValue?.predefinedMeetTypeId === 3)|| (view == 'predefinedMeet') ) && (
                                    <ul className="mt_opt_itms">
                                        {videoMeetData?.map((item: any) =>{
                                             return <li className={`mt_opt_itm ${predefinedMeetConfig === item ? 'active_item' : ''}`} onClick={() => {handleSelectPredefinedMeet(item); setMeetType(1)}}>
                                                {item.title}
                                                <span className="mt_dtls">{item.url}</span>
                                            </li>
                                        })}
                                    </ul>
                                    )}
                                </div>

                                <div className={`evnt_cl_typ_item ${meetType === 2 ? 'active_item' : ''} ${(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 3)||(view == 'predefinedMeet')) ? '' : 'opacity-5 pointer-none'}`} >
                                    <p>Phone Call</p>
                                    <CallIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                     {(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 3)||(view == 'predefinedMeet'))  && (
                                    <ul className="mt_opt_itms">
                                        {audioMeetData?.map((item: any) =>{
                                             return <li className={`mt_opt_itm ${predefinedMeetConfig === item ? 'active_item' : ''}`} onClick={() => {handleSelectPredefinedMeet(item); setMeetType(2)}}>
                                                {item.title}
                                                <span className="mt_dtls">{item.phone}</span>
                                            </li>
                                        })}
                                    </ul>
                                    )}
                                </div>

                                <div className={`evnt_cl_typ_item ${meetType === 3 ? 'active_item' : ''} ${(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 2) || (view == 'predefinedMeet')) ? '' : 'opacity-5 pointer-none'}`} >
                                    <p>In Person</p>
                                    <LocationIcon />
                                    <span className="drp_icn">
                                        <DropdownIcon />
                                    </span>
                                    {(!(templateValue?.predefinedMeetTypeId === 1 || templateValue?.predefinedMeetTypeId === 2) || (view == 'predefinedMeet'))  && (
                                    <ul className="mt_opt_itms">
                                    {inPersonMeetData?.map((item: any) =>{
                                             return <li className={`mt_opt_itm ${predefinedMeetConfig === item ? 'active_item' : ''}`} onClick={() => {handleSelectPredefinedMeet(item); setMeetType(3)}}>
                                                {item.title}
                                                <span className="mt_dtls">{item.address}</span>
                                            </li>
                                        })}
                                    </ul>
                                    )}
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
                                        options={templateOptions || []}
                                        groupBy={option => option.group}
                                        getOptionLabel={option => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, selectedValue) => {
                                        onChange(selectedValue);
                                        setValue('newTemplate', selectedValue.template)
                                        // setReplaceTemplate(selectedValue.template)
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
                                        error={!!errors.template}
                                        helperText={errors?.template?.message as string}
                                        disableClearable
                                    />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="d-flex justify-between mb-30">
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

                            {watch('eventType')?.id === 4 &&
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
                                                setMemberOptions(removedDuplicates)
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
                                                setValue('requiredGuests', removedDuplicates.map((i:any) => i.email))
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
                                        name="requiredGuests"
                                        control={control}
                                        // rules={{ required: "This field is required" }}
                                        render={({ field: { onChange, value } }) => (
                                            <CustomAutocomplete
                                            label="Members"
                                            options={memberOptions.map((item: any) => item.email) || []}
                                            onChange={(e,v) => {
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
                                            // error={!!errors?.requiredGuests}
                                            // helperText={errors?.requiredGuests?.message as string}
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
                                
                                {watch('eventType')?.id === 1 ?
                                <div className="w-49">
                                    <Controller
                                        name="requiredGuests"
                                        control={control}
                                        // rules={{ 
                                        //     required: "This field is required",
                                        //     pattern: {
                                        //     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                        //     message: "Invalid email address",
                                        //     }, 
                                        // }}
                                        render={({ field: { onChange, value } }) => (
                                            <CustomTextField
                                            label="Add one Guest"
                                            size="small"
                                            fullWidth
                                            onChange={(e) => {
                                                const value = e?.target?.value.trim()
                                                onChange(value)
                                                setMeetAttendees(value.length > 0 ? [{email: value, isRequired: true}] : [])
                                                setOutsideMembers(value.length > 0 ? [{email: value}] : [])
                                            }}
                                            // error={!!errors?.requiredGuests}
                                            // helperText={errors?.requiredGuests?.message as string}
                                            value={value || ''}
                                            />
                                        )}
                                    /> 
                                </div>
                                : (watch('eventType')?.id === 2 || watch('eventType')?.id === 3) ?
                                <>
                                <div className="w-49">
                                    <Controller
                                        name="requiredGuests"
                                        control={control}
                                        // rules={{ 
                                        //     required: "This field is required",
                                        //     // validate: validateRequiredGuests
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
                                            // error={!!errors?.requiredGuests}
                                            // helperText={errors?.requiredGuests?.message as string}
                                            value={value || []}
                                            multiple
                                            freeSolo
                                            renderTags={() => null}
                                            disableClearable
                                            />
                                        )}
                                    />
                                    
                                </div>
                                </>
                                    
                                : null
                            }

                        </div> 
                        <div className="d-flex flex-row justify-between mb-50">
                            <div className="w-100 d-flex justify-between">
                                <div className="w-49">
                                    <Controller
                                        name="startTime"
                                        control={control}
                                        rules={{ required: "This field is required" }}
                                        render={({ field: { onChange, value } }) => (
                                        <CustomTimePicker
                                            label="Time"
                                            value={value || null}
                                            size="small"
                                            className="avail-date-filter w-100"
                                            onChange={onChange}
                                            error={!!errors?.startTime}
                                            helperText={errors?.startTime?.message}
                                        />
                                        )}
                                    />
                                </div>
                                <div className="w-49">
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
                                            value={value || ''}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* <div className='w-100 d-flex flex-row'>
                                <div className='w-32 d-flex flex-column mr-25'>
                                    <span className='form-label'>Meeting Type</span>
                                    <div className='metng_opts_items d-flex'>
                                        <span className='actv_opt mr-20'><VideoIcon /> Video</span>
                                        <span className='mr-20'><CallIcon /> Audio</span>
                                        <span><LocationIcon /> In person</span>

                                    </div>
                                </div>

                                <div className='w-32 mr-25'>
                                    <Controller
                                        name="eventType"
                                        control={control}
                                        rules={{ required: "This field is required" }}
                                        render={({ field: { onChange, value } }) => (
                                        <CustomAutocomplete
                                            label="Predefined Meet Info list"
                                            options={['call temp 1', 'call temp 2']}
                                            getOptionLabel={option => option.value}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            onChange={(e,v) =>{
                                            onChange(v)
                                            setValue('requiredGuests', '')
                                            setValue('optionalGuests', '')
                                            }}
                                            value={['call temp 1']}
                                            disableClearable={true}
                                            error={!!errors?.eventType}
                                            helperText={errors?.eventType?.message}                
                                        />
                                        )}
                                    />
                                </div>
                            </div> */}

                        </div>
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
                        <small style={{color:'red'}}>{errors.newTemplate?.message as string}</small>
                        <div className="form-act mt-30">
                        <CustomButton className="primary_btns mr-25" label="Preview" disabled={!watch('newTemplate')} onClick={handlePreviewTemplate} />
                            <CustomButton className="primary_btns" label="Save" type="submit" disabled={isLoading} />
                        </div>
                        </form>
                </div>
                {isPreviewSuccess && <PreviewTemplate value={previewTemplate} />}
                <div className='contact-user-list w-24'>
                <Contacts eventType={eventType} outsideMembers={outsideMembers} handleSelectOrRemoveContact={handleSelectOrRemoveContact} removedItem={removedItem} meetAttendees={meetAttendees || []} />   
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
            
        </div>
        {openUpgradePopup && <UpgradePopup setOpenUpgradePopup={setOpenUpgradePopup} />}
    </div>
  )
}

export default AddEventTemplate;
