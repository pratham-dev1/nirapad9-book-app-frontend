import { Dialog, DialogActions, DialogContent } from "@mui/material";
import React, { useContext, useState } from "react";
import CustomButton from "../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { CREATE_NEW_EVENT, GET_GENERAL_TEMPLATES, GET_USER_EMAILS } from "../constants/Urls";
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

interface FormInputProps {
  title: string;
  date: Dayjs | null;
  email: string;
  startTime: Dayjs | null;
  endTime: Dayjs;
  requiredGuests: any;
  optionalGuests: any;
  eventType: {id: number, value: string};
  eventTime: number;
  template: any;
  newTemplate: any
}

type CompProps = {
  setOpenDialog?: (bool: boolean) => void;
  selectedSlot?: {start: Date, end: Date } | null 
}

const CreateNewEvent: React.FC<CompProps> = ({setOpenDialog, selectedSlot}) => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const { emailData } = useContext(EventsContext);
  const [titleCount, setTitleCount] = useState('')
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
      date: selectedSlot ? dayjs(selectedSlot.start) : null,
      startTime: selectedSlot ? dayjs(selectedSlot.start) : null,
    },
    mode: 'onChange'
  });
  
  const { data: templatesData } = useQuery('general-templates', () => request(`${GET_GENERAL_TEMPLATES}?type=create`))
  const { mutate: mutateCreateEvent, isLoading } = useMutation((body: object) => request(CREATE_NEW_EVENT, "post", body), {
    onSuccess: (data) => {
      setTitleCount('')
      setOpenDialog && setOpenDialog(false)
      showToast(ToastActionTypes.SUCCESS, data?.message)
    },
    onError: (error: any) => {
      setOpenDialog && setOpenDialog(false)
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

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleCreateEvent = async (formdata: FormInputProps) => {
    const currentDateTime = dayjs().tz(default_timeZone);
    const startDateTime = dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`, default_timeZone);
    if (currentDateTime > startDateTime) {
      showToast(ToastActionTypes.ERROR, 'Please choose a time that is not in the past');
      return;
    }
    const eventTime = watch('eventTime')
    mutateCreateEvent({
        title: formdata.title, 
        requiredGuests: formdata.requiredGuests,
        optionalGuests: formdata.optionalGuests || [], 
        email: formdata.email, 
        startDateTime: dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`,default_timeZone).toISOString(),
        endDateTime: dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime?.format("HH:mm")}`, default_timeZone).add(eventTime, 'minutes').toISOString(),
        template: formdata.newTemplate
    });
  };

  const requiredGuests = watch('requiredGuests');
  const optionalGuests = watch('optionalGuests');

  const validateRequiredGuests = (guests: any) => {
    if (optionalGuests?.some((guest: any) => guests.includes(guest))) {
      return 'Duplicate Guests found in optional and required Attendees';
    }
    // trigger('requiredGuests')
    else {
      clearErrors('requiredGuests')
      clearErrors('optionalGuests')
    }
    return true;
  };

  const validateOptionalGuests = (guests: any) => {
    if (requiredGuests?.some((guest: any) => guests.includes(guest))) {
      return 'Duplicate Guests found in optional and required Attendees';
    }
    else {
      clearErrors('requiredGuests')
      clearErrors('optionalGuests')
    }
    // trigger('requiredGuests')
    return true;
  };

  return (
    <>
    {isLoading && <Loader />}
          <form onSubmit={handleSubmit(handleCreateEvent)} onKeyDown={handleKeyDown} className="create-event-form">
            <h3>Create New Event</h3>
            <div className="d-flex justify-between mb-30">
                <div className="w-32">
                  <label className="input-label">Title (Text {`${titleCount?.length || 0}/30`} Characters)</label> 
                  <Controller
                    name="title"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange } }) => (
                      <CustomTextField
                        label=""
                        size="small"
                        fullWidth
                        onChange={onChange}
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
                        options={[{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}]}
                        getOptionLabel={option => option.value}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(e,v) =>{
                           onChange(v)
                           setValue('requiredGuests', '')
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
                  {watch('eventType')?.id === 1 ?
                  <Controller
                    name="requiredGuests"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange } }) => (
                      <CustomTextField
                        label="Add one Guest"
                        size="small"
                        fullWidth
                        onChange={(e) => onChange([e.target.value])}
                        error={!!errors?.requiredGuests}
                        helperText={errors?.requiredGuests?.message as string}
                      />
                    )}
                  /> 
                  : watch('eventType')?.id === 2 ?
                  <>
                  <Controller
                    name="requiredGuests"
                    control={control}
                    rules={{ 
                      required: "This field is required",
                      validate: validateRequiredGuests
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
                    rules={{ validate: validateOptionalGuests }}
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
                  </>
                  : null
                  }
                </div>
              </div> 
              <div className="d-flex justify-between mb-30">
                <div className="w-100 d-flex justify-between">
                  <div className="w-20">
                    <Controller
                      name="eventTime"
                      control={control}
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange } }) => (
                        <CustomAutocomplete
                          label="Event Time"
                          options={[15, 30, 45, 60]}
                          getOptionLabel={option => option + ' min'}
                          onChange={(e,v) => onChange(v)}
                          error={!!errors?.eventTime}
                          helperText={errors?.eventTime?.message}              
                        />
                      )}
                    />
                  </div>
                  <div className="w-20">
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
                  <div className="w-20">
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
                  <div className="w-35">
                    <Controller
                      name="email"
                      control={control}
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange } }) => (
                        <CustomAutocomplete
                          label="Select Email"
                          options={emailData || []}
                          getOptionLabel={(option) => option.email}
                          onChange={(e,v) => onChange(v?.email)}
                          error={!!errors?.email}
                          helperText={errors?.email?.message}
                          disableClearable={true}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex mb-50">
                
                <div className="w-32">
                  <div className="w-100 mb-20">
                    <Controller
                      name="template"
                      control={control}
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <CustomAutocomplete
                          label='Select Template'
                          options={templatesData?.data || []}
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
                  { watch("template") && <ViewTemplate value={watch('template')?.template} /> }
                </div>
                   
              </div>
           
            {/* <Controller
              name="endTime"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field: { onChange } }) => (
                <CustomTimePicker
                  label="End Time"
                  size="small"
                  className="avail-date-filter"
                  style={{ width: 150 }}
                  minutesStep={15}
                  onChange={onChange}
                  error={!!errors?.endTime}
                  helperText={errors?.endTime?.message}
                />
              )}
            /> */}
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
            <div className="form-act mt-30">
              <CustomButton className="primary_btns" label="Save" type="submit" />
            </div>
          </form>
    </>
  );
};

export default CreateNewEvent;
