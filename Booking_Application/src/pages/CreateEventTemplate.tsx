import { Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { FC, useContext, useEffect, useState } from 'react'
import CustomButton from '../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CustomTextField from '../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import request from '../services/http';
import { CREATE_EVENT_TEMPLATE, EDIT_EVENT_TEMPLATE, GET_GENERAL_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS } from '../constants/Urls';
import { ToastActionTypes } from '../utils/Enums';
import showToast from '../utils/toast';
import Loader from '../components/Loader';
import { queryClient } from '../config/RQconfig';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomCheckBox from '../components/CustomCheckbox';
import CloseIcon from "@mui/icons-material/Close";
import CustomRichTextEditor from '../components/CustomRichTextEditor';
import CreateNewEvent from './CreateNewEvent';
import dayjs, { Dayjs } from 'dayjs';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomTimePicker from '../components/CustomTimePicker';
import { EventsContext } from '../context/event/EventsContext';
import { AuthContext } from '../context/auth/AuthContext';

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

const CreateEventTemplate: FC<{formData?: any}> = ({formData}) => {
    const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
    const { emailData } = useContext(EventsContext);
    const [openDialog, setOpenDialog] = useState(false)
    const [titleCount, setTitleCount] = useState('')
    const [memberOptions, setMemberOptions] = useState([])
    const { state } = useContext(AuthContext);
    const system_timeZone = dayjs.tz.guess()
    const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
    const { data: templatesData } = useQuery('general-templates', () => request(GET_GENERAL_TEMPLATES))
    const {data: GroupsData} = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"))
    const { mutate: mutate, isLoading } = useMutation((body: object) => request(formData ? EDIT_EVENT_TEMPLATE : CREATE_EVENT_TEMPLATE, "post", formData ? {...body, id: formData.id} : body), {
        onSuccess: (data) => {
         setOpenDialog(false)
          showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
            queryClient.invalidateQueries('predefined-event-templates')
        },
    })
    useEffect(() => {
        formData && reset({
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
    },[formData])

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        trigger,
        reset,
        clearErrors,
        formState: { errors },
      } = useForm<FormInputProps>({
        defaultValues: {
          eventType: {id: 1, value: "One to one"},
          eventTime: 30
        },
        mode: 'onChange'
      });

    const onSubmit = (formData: FormInputProps) => {
        mutate({
          ...formData, 
          eventTypeId: formData.eventType.id, 
          senderEmail: formData.email, 
          requiredGuests: formData.eventType.id === 1 ? [formData.requiredGuests] : formData.requiredGuests,
          optionalGuests: formData.optionalGuests || [],
          template: formData.newTemplate,
          groupId: formData.groups ? formData.groups.map((item)=> item.id ) : null
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

  return (
    <div className='mb-20'>
        { formData ? 
          <EditOutlinedIcon onClick={() => {setOpenDialog(true); reset();}} /> 
          : <CustomButton label="Create Event Template" onClick={() => setOpenDialog(true)} />
        }
    <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className='full-screen-modal'
      >
        <div className="popup-header">
          <h2>Create Event Template</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
            {isLoading && <Loader />}
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className='crt_evnt_tmplt_frm'>
          <div className="d-flex justify-between mb-30">
                <div className="w-32">
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

                <div className="w-32">
                  <Controller
                    name="eventType"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        label="Event Type"
                        options={EVENT_TYPES}
                        getOptionLabel={option => option.value}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(e,v) =>{
                           onChange(v)
                           setValue('requiredGuests', '')
                           setValue('optionalGuests', '')
                        }}
                        value={value || null}
                        disableClearable={true}
                        error={!!errors?.eventType}
                        helperText={errors?.eventType?.message}                
                      />
                    )}
                  />
                </div>
                <div className="w-32">
                  <Controller
                    name="eventTime"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange,value } }) => (
                      <CustomAutocomplete
                        label="Event Time"
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
                
              </div> 
              <div className="d-flex justify-between mb-30">
                <div className="w-100 d-flex justify-between">

                  <div className="w-32 mr-25">
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
                  
                <div className="w-32 mr-25">
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange, value } }) => (
                      <CustomDatePicker
                        label="Date"
                        value={value || null}
                        size="small"
                        className="avail-date-filter w-100"
                        onChange={onChange}
                        disablePast={true}
                        error={!!errors?.date}
                        helperText={errors?.date?.message}
                      />
                    )}
                  />
                </div>
                <div className="w-32">
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
                </div>
              </div>
              <div className="d-flex mb-50">
              {watch('eventType')?.id === 4 &&
                  <div className="w-32 mr-25">
                    <Controller
                      name="groups"
                      control={control}
                      rules={{ required: "This field is required" }}
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
                              setValue('requiredGuests', removedDuplicates.map((i:any) => i.email))
                          }}
                          error={!!errors?.groups}
                          helperText={errors?.groups?.message as string}
                          value={value || []}
                          multiple
                        />
                      )}
                    />
                  
                    <Controller
                      name="requiredGuests"
                      control={control}
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <CustomAutocomplete
                          label="Members"
                          options={memberOptions.map((item: any) => item.email) || []}
                          onChange={(e,v) => onChange(v)}
                          error={!!errors?.requiredGuests}
                          helperText={errors?.requiredGuests?.message as string}
                          value={value || []}
                          multiple
                          limitTags={2}
                          disableClearable
                        />
                      )}
                    />
                  </div>
                  }
                  
                    {watch('eventType')?.id === 1 ?
                    <div className="w-32 mr-25 mb-20">
                    <Controller
                      name="requiredGuests"
                      control={control}
                      rules={{ 
                        required: "This field is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: "Invalid email address",
                        }, 
                      }}
                      render={({ field: { onChange, value } }) => (
                        <CustomTextField
                          label="Add one Guest"
                          size="small"
                          fullWidth
                          onChange={(e) => onChange(e.target.value)}
                          error={!!errors?.requiredGuests}
                          helperText={errors?.requiredGuests?.message as string}
                          value={value || ''}
                        />
                      )}
                    /> 
                    </div>
                    : (watch('eventType')?.id === 2 || watch('eventType')?.id === 3) ?
                    <>
                    <div className="w-32 mr-25">
                    <Controller
                      name="requiredGuests"
                      control={control}
                      rules={{ 
                        required: "This field is required",
                        // validate: validateRequiredGuests
                      }}
                      render={({ field: { onChange, value } }) => (
                        <CustomAutocomplete
                          label="Add Multiple Guests"
                          options={[]}
                          onChange={(e, val) => {
                            const filteredValue = val.filter((v:any) => v.trim() !== '');
                            onChange(filteredValue)
                          }}
                          error={!!errors?.requiredGuests}
                          helperText={errors?.requiredGuests?.message as string}
                          value={value || []}
                          multiple
                          freeSolo
                        />
                      )}
                    />
                    <Controller
                      name="optionalGuests"
                      control={control}
                      // rules={{ validate: validateOptionalGuests }}
                      render={({ field: { onChange, value } }) => (
                        <CustomAutocomplete
                          label="Add Optional Guests"
                          options={[]}
                          onChange={(e, val) => {
                            const filteredValue = val.filter((v:any) => v.trim() !== '');
                            onChange(filteredValue)
                          }}
                          error={!!errors?.optionalGuests}
                          helperText={errors?.optionalGuests?.message as string}
                          value={value || []}
                          multiple
                          freeSolo
                        />
                      )}
                    />
                    </div>
                    </>
                    
                    : null
                    }
                  
                <div className="w-32">
                  <Controller
                    name="template"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        label='Select Template'
                        options={templatesData?.data || []}
                        groupBy={option => option.group}
                        getOptionLabel={option => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                          setValue('newTemplate', selectedValue.template)
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
            <div className="w-100 mb-70">
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
            <small style={{color:'red'}}>{errors.newTemplate?.message as string}</small>
            <div className="form-act mt-30">
              <CustomButton className="primary_btns" label="Save" type="submit" />
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
  )
}

export default CreateEventTemplate;
