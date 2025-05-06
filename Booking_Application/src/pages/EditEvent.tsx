import React, { useContext, useEffect, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { GridCloseIcon } from "@mui/x-data-grid";
import CustomDatePicker from "../components/CustomDatePicker";
import { AuthContext } from "../context/auth/AuthContext";
import CustomTextField from "../components/CustomTextField";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomTimePicker from "../components/CustomTimePicker";
import Loader from "../components/Loader";
import request from "../services/http";
import { GET_PROPOSE_NEW_TIME, UPDATE_EVENT } from "../constants/Urls";
import CustomButton from "../components/CustomButton";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import CustomCheckBox from "../components/CustomCheckbox";

interface Props {
  formData: object | any;
//   URL: string
  refetch?: any;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBookedOpenDialog?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FormInputProps {
    title: string;
    date: Dayjs | null;
    startTime: Dayjs | null;
    guests: any;
    endTime: Dayjs | null
  }

const EditEvent = (props: Props) => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const { formData, refetch, setOpenDialog, setIsBookedOpenDialog } = props;
  const [acceptCheckboxEmail, setAcceptCheckboxEmail] = useState('')
  const [newProposedTimeData, setNewProposedTimeData] = useState<any[]>([])
const {
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<FormInputProps>();

  useEffect(() => {
    const startDateTimeValue = formData.startTimeValue ? dayjs(formData.startTimeValue).tz(default_timeZone) : null;
    const endDateTimeValue = formData.endTimeValue ? dayjs(formData.endTimeValue).tz(default_timeZone) : null
    const guestsArray = formData?.attendees ? formData.attendees.split(',') : [];
    reset({ title: formData?.title, guests: guestsArray, date: startDateTimeValue, startTime: startDateTimeValue, endTime: endDateTimeValue })
  }, [formData]);

  const {data: proposedNewTimeData, isLoading: isLoading2} = useQuery('propose-new-time-list', () => request(`${GET_PROPOSE_NEW_TIME}/${formData?.eventIdAcrossAllCalendar}`))
  // const newProposedTimeData = proposedNewTimeData?.data.filter((i: any) => !i.isRejected)
  const rejectedProposedTimeData = proposedNewTimeData?.data.filter((i: any) => i.isRejected)

  useEffect(() => {
    if(proposedNewTimeData?.data) {
    setNewProposedTimeData(proposedNewTimeData?.data.filter((i: any) => !i.isRejected))
    }
  },[proposedNewTimeData])

  const { mutate, isLoading: editEventLoading }: any = useMutation((body: object) => request(UPDATE_EVENT, "post", body), {
    onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, data?.message);
        refetch && refetch();
        setOpenDialog(false)  
    }
  });

const dateTimeSlotCalculation = (
    date: Dayjs | null,
    startTime: string,
    endTime: string
  ) => {
    let dateTimeSlot = null;

    let startDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime}`, default_timeZone).utc();
    let endDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${endTime}`, default_timeZone).utc();
    if (endDateTime.isBefore(startDateTime)) {
      endDateTime = endDateTime.add(1, "day");
    }
    // const durationMinutes = endDateTime.diff(startDateTime, "minutes");
    // if (durationMinutes >= formData?.eventDurationInMinutes) {
    //   dateTimeSlot = startDateTime.toISOString();
    dateTimeSlot = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };
    // }
    return dateTimeSlot;
  };

    const handleEditEvent = async (formdata: FormInputProps, event:any) => {
        // console.log(formdata)\
        const isPastEvent = dayjs().tz(default_timeZone) > dayjs(formData.startTimeValue).tz(default_timeZone)
        if(isPastEvent) {
          showToast(ToastActionTypes.ERROR, "You Can't Perform Actions on Past Events")
          return;
        }
        const startTime = dayjs(formdata?.startTime).format("HH:mm");
        const endTime = dayjs(formdata?.endTime).format("HH:mm");

        let currentDateTimeSlot = dateTimeSlotCalculation(
            formdata.date,
            startTime,
            endTime
          );
          mutate({
            id: formData.id,
            startTimeSlot: currentDateTimeSlot?.startTime,
            endTimeSlot: currentDateTimeSlot?.endTime,
            title: formdata?.title,
            guests: formdata?.guests,
            eventId: formData.eventId,
            emailAccount: formData.emailAccount,
            senderEmailServiceProvider: formData.senderEmailServiceProvider,
            senderEmail: formData.senderEmail,
            rejectedEmails: newProposedTimeData.map((i: any) => i.email)
          });
    };
    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      };

    const handleAcceptProposedTime = (value: boolean,startTime: string, endTime: string, email: string) => {
      setAcceptCheckboxEmail(value ? email : '')
      setValue('date', value ? dayjs(startTime).tz(default_timeZone) : dayjs(formData?.startTime))
      setValue('startTime', value ? dayjs(startTime).tz(default_timeZone) : dayjs(formData?.startTime))
      setValue('endTime', value ? dayjs(endTime).tz(default_timeZone): dayjs(formData?.endTime))    
    }

    const handleRejectProposedTime = (value: boolean, email: string) => {
      let AllGuest = watch('guests')
      let guests = AllGuest.filter((i: string) => i !== email)
      setValue('guests', (value ? guests : [...guests, email]))
      setNewProposedTimeData(prev => prev.map((i: any) => i.email === email ? {...i, rejected: value} : i))
    }

    const handleRejectAll = (e: any, value: boolean) => {

      let initialGuests = formData.attendees.split(',') || []
      let AllGuest = watch('guests')
      let proposedTimeEmails = newProposedTimeData?.map((i: any) => i.email)
      setNewProposedTimeData(prev => prev?.map((i: any) => ({...i, rejected: value})))
      const filteredValue = AllGuest.filter((email: string) => !proposedTimeEmails.includes(email))
      setValue('guests', (value ? filteredValue : initialGuests) )
    }

  return (
    <>
    {editEventLoading && <Loader />}
      <form onSubmit={handleSubmit(handleEditEvent)} onKeyDown={handleKeyDown} className="create-event-form mw-500">
        <div className="d-flex flex-row justify-between">
          <div className="w-100 mb-20">
            <Controller
              name="title"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, value } }) => (
              <CustomTextField
                  label="Title"
                  size="small"
                  fullWidth
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.title}
                  helperText={errors?.title?.message}
                  inputProps={{ maxLength: 30 }}
              />
              )}
            />
          </div>
          <div className="w-100 mb-20">
            <Controller
              name="guests"
              control={control}
              // rules={{ 
              //   required: "This field is required",
              //   validate: (value) => {
              //     if(Array.isArray(value)){
              //       const invalidEmails = value?.filter((email: string) => 
              //         !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)
              //       );
              //       if (invalidEmails.length) {
              //         return "One or more email addresses are invalid";
              //       }
              //       return true;
              //     }
              //   },
              // }}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                    label="Add Multiple Guests"
                    options={[]}
                    onChange={(e, val) => {
                    const filteredValue = val.filter((v:any) => v.trim() !== '');
                    onChange(filteredValue)
                    }}
                    error={!!errors?.guests}
                    helperText={errors?.guests?.message as string}
                    value={value || []}
                    multiple
                    freeSolo
                    limitTags={2}
                />
              )}
            />
          </div>
        </div>

        <div className="d-flex justify-between mb-50">
          <div className="w-49">
            <Controller
              name="date"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field: { onChange } }) => (
                <CustomDatePicker
                  label="Date"
                  value={watch("date") || null}
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
          <div className="w-49">
            <Controller
              name="startTime"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field: { onChange } }) => {
                const label = `StartTime (${default_timeZone})`; 
                return (
                  <CustomTimePicker
                    label={label} 
                    value={watch("startTime") || null}
                    size="small"
                    className="avail-date-filter w-100"
                    onChange={onChange}
                    error={!!errors?.startTime}
                    helperText={errors?.startTime?.message}
                  />
                );
              }}
            />
          </div>
          <div className="w-49">
            <Controller
              name="endTime"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field: { onChange } }) => {
                const label = `EndTime (${default_timeZone})`; 
                return (
                  <CustomTimePicker
                    label={label} 
                    value={watch("endTime") || null}
                    size="small"
                    className="avail-date-filter w-100"
                    onChange={onChange}
                    error={!!errors?.endTime}
                    helperText={errors?.endTime?.message}
                  />
                );
              }}
            />
          </div>
        </div>
        
        <div className="d-flex justify-center mt-30">
          <CustomButton className="primary_btns" label="Save" type="submit" />
        </div>
    </form>
    { newProposedTimeData?.length > 0 && <div className="w-100 d-flex flex-row list-view-template all-qus-list mt-30">
        <h3>All New Proposed Time : -  </h3>
        <div style={{marginLeft: 'auto'}}><CustomCheckBox label="Reject All" checked={newProposedTimeData?.every(i => i.rejected)} labelPlacement="end" onChange={handleRejectAll} /></div>
      <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
      <div className="w-100 d-flex tmplt_list_item items-center" style={{backgroundColor: '#f1f2f6'}}>
      <div className="tmplt_nme"><span>Email</span></div>
      <div className="tmplt_nme"><span>StartTime</span></div> 
      <div className="tmplt_nme"><span>EndTime</span></div> 
      <div className="tmplt_nme"><span>Comment</span></div>
      <div className="tmplt_nme"><span>Accept</span></div>
      <div className="tmplt_nme"><span>Reject</span></div>
      </div>
        {newProposedTimeData?.map((item: any) => {
          return <div className="w-100 d-flex tmplt_list_item items-center">
            <div className="tmplt_nme">
              <span>{item.email || '-'}</span>
            </div>
            <div className="tmplt_nme">
              <span>{dayjs(item?.startTime).tz(default_timeZone).format("DD-MM-YYYY h:mm A")}</span>
            </div>
            <div className="tmplt_nme">
              <span>{dayjs(item?.endTime).tz(default_timeZone).format("DD-MM-YYYY h:mm A")}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item.comment || '-'}</span>
            </div>
            <div className="tmplt_nme">
              <span><CustomCheckBox label="" labelPlacement="end" checked={acceptCheckboxEmail === item.email} onChange={(e: any, v: boolean) => handleAcceptProposedTime(v, item.startTime, item.endTime, item.email)} /></span>
            </div>
            <div className="tmplt_nme">
              <span><CustomCheckBox label="" labelPlacement="end" checked={item.rejected || false} onChange={(e: any, v: boolean) => handleRejectProposedTime(v, item.email)} /></span>
            </div>
          </div>
        })}
      </div>
    </div> }

    { rejectedProposedTimeData?.length > 0 && <div className="w-100 d-flex flex-row list-view-template all-qus-list mt-30">
        <h3>Rejected Proposed Time : -  </h3>
      <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
      <div className="w-100 d-flex tmplt_list_item items-center" style={{backgroundColor: '#f1f2f6'}}>
      <div className="tmplt_nme"><span>Email</span></div>
      <div className="tmplt_nme"><span>StartTime</span></div> 
      <div className="tmplt_nme"><span>EndTime</span></div> 
      <div className="tmplt_nme"><span>Comment</span></div>
      </div>
        {rejectedProposedTimeData?.map((item: any) => {
          return <div className="w-100 d-flex tmplt_list_item items-center">
            <div className="tmplt_nme">
              <span>{item.email || '-'}</span>
            </div>
            <div className="tmplt_nme">
              <span>{dayjs(item?.startTime).tz(default_timeZone).format("DD-MM-YYYY h:mm A")}</span>
            </div>
            <div className="tmplt_nme">
              <span>{dayjs(item?.endTime).tz(default_timeZone).format("DD-MM-YYYY h:mm A")}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item.comment || '-'}</span>
            </div>
          </div>
        })}
      </div>
    </div> }
    </> 
  );
};

export default EditEvent;
