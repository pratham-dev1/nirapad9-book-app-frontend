import React, { useContext, useEffect, useState } from "react";
import CustomTextField from "../../components/CustomTextField";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import CustomButton from "../../components/CustomButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, Divider, IconButton, Rating } from "@mui/material";
import CustomCheckBox from "../../components/CustomCheckbox";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { CREATE_USER, GET_USERTYPES, EDIT_USER, RESPOND_EVENT_INVITE, RESPOND_ACCEPT_INVITE, GET_OPEN_AVAILABILITY_QUESTION_ANSWER } from "../../constants/Urls";
import { GET_SKILLS, GET_SECONDARY_SKILLS } from "../../constants/Urls";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import request from "../../services/http";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomTimePicker from "../../components/CustomTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { UPDATE_SLOTS, } from "../../constants/Urls";
import Loader from "../../components/Loader";
import { AuthContext } from "../../context/auth/AuthContext";
import { GridCloseIcon } from "@mui/x-data-grid";
import CloseIcon from "../../styles/icons/CloseIcon";
import CheckOutlinedIcon from "../../styles/icons/CheckOutlinedIcon";
import PencilIcon from "../../styles/icons/PencilIcon";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import moment from "moment-timezone";
import EditAvailability from "./EditAvailability";
import { queryClient } from "../../config/RQconfig";


interface Props {
  formData: object | any;
  URL: string
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBookedOpenDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteDialogState: any;
  setSingleDeleteState: any;
  notification?: boolean
}
type FormInputProps = {
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
  text: string;
};

const EditAvailabilityRespondInvite = (props: Props) => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const { formData, URL, setOpenDialog, setIsBookedOpenDialog, setDeleteDialogState, setSingleDeleteState, notification } = props;
  const [showForm, setShowForm] = useState(false);
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormInputProps>();

  const { data: quesAns, isLoading: isLoading2 } = useQuery(['open-availability-que-ans', formData.id], () => request(GET_OPEN_AVAILABILITY_QUESTION_ANSWER, 'get', {openAvailabilityId: formData.id}))

  const { mutate, isLoading }: any = useMutation((body: object) => request(URL, "post", body), {
    onSuccess: (data) => {
      if(data.isBooked){
        setIsBookedOpenDialog?.(true)      
      }
        showToast(ToastActionTypes.SUCCESS, data?.message);
        queryClient.invalidateQueries('open-availability-history');
        queryClient.invalidateQueries('slots-by-tagId');
        setOpenDialog(false)  
    }
  });
  const { mutate: respondAccept, isLoading: isRespondAcceptLoading }: any = useMutation((body: object) => request(RESPOND_ACCEPT_INVITE, "post", body), {
    onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, data?.message);
        queryClient.invalidateQueries('open-availability-history');
        queryClient.invalidateQueries('slots-by-tagId');
        queryClient.invalidateQueries('notifications');
        setOpenDialog(false)  
    }
  });

  const dateTimeSlotCalculation = (
    date: Dayjs | null,
    startTime: Dayjs,
    endTime: Dayjs
  ) => {
    let dateTimeSlot = null;

    let startDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime?.format("HH:mm")}`, default_timeZone).utc();
    let endDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${endTime?.format("HH:mm")}`, default_timeZone).utc();
    if (endDateTime.isBefore(startDateTime)) {
      endDateTime = endDateTime.add(1, "day");
    }
    return {startTime: startDateTime, endTime: endDateTime};
  };

  const isPastEvent = dayjs().tz(default_timeZone) > dayjs(formData.datetime).tz(default_timeZone)

  const onSubmit = ({date,startTime,endTime,text}: FormInputProps) => {
    const oldFormData = {startTime: dayjs(formData.datetime).tz(default_timeZone).toISOString(), endTime: dayjs(formData.datetime).add((formData?.tagData?.eventDuration || formData?.eventDurationInMinutes), "minutes").tz(default_timeZone).toISOString()}
    const newFormData = {startTime: dayjs(startTime).tz(default_timeZone).toISOString(), endTime: dayjs(endTime).tz(default_timeZone).toISOString()}
    const isEqual = JSON.stringify(oldFormData) === JSON.stringify(newFormData)
    if(isEqual) {
      showToast(ToastActionTypes.ERROR, 'No changes Provided')
      return;
    }
    // const endDateTime = startTime.add(30, "minutes")
    if(isPastEvent) {
      showToast(ToastActionTypes.ERROR, "You can't make changes on past event")
      return;
    }
    const currentDateTime = dayjs().tz(default_timeZone);
    let newDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime?.format("HH:mm")}`, default_timeZone);
    const isPastSlot = currentDateTime > newDateTime
    if (isPastSlot) {
      showToast(ToastActionTypes.ERROR, 'Please choose different range which should not contain past time')
      return;
    }
    let currentDateTimeSlot = dateTimeSlotCalculation(
      date,
      startTime,
      endTime
    );
    mutate({
      id: formData.id,
      dateTimeSlot: currentDateTimeSlot?.startTime,
      text: text,
      endtime: currentDateTimeSlot?.endTime
    });
  };

  const handleAcceptClick = () => {
    if(isPastEvent) {
      showToast(ToastActionTypes.ERROR, "You can't make changes on past event");
      return;
    }
    setOpenDialog(false) 
    const endTimeValue = formData.datetime ? (dayjs(formData.datetime).add(30, 'minute')).tz(default_timeZone) : null;
    respondAccept({
       id: formData?.id,
       receiverEmail: formData?.receiverEmail,
       date: formData?.date,
       startTime: `${formData?.time} ${default_timeZone_abbr}`,
       endTime: `${dayjs(endTimeValue).format("h:mm A")} ${default_timeZone_abbr}`,
       })
  }
  const handleDeleteClick = () => {
    if(isPastEvent) {
      showToast(ToastActionTypes.ERROR, "You can't make changes on past event");
      return;
    }
    setDeleteDialogState(notification ? true : { open: true, type: 'single' });
    setSingleDeleteState({
      id: formData.id,
      booked: formData.booked,
    });
  };

  return (
    <>
    {(isLoading || isLoading2 || isRespondAcceptLoading) && <Loader />}
    <div
      className="edit-event-popup-inner"
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="w-100 evnt_details d-flex flex-column primary_color items-center">
        <p className="mt-0 mb-10"><strong>{formData?.title}</strong></p>
        <div className="mb-50">
          <p className="mt-0 mb-5">
            <strong className="mr-10">Event:</strong>
            <span>One to One</span>
            <span> | </span> 
            <span>{formData?.tagData?.eventDuration || formData?.eventDurationInMinutes} mins</span>
            <span> | </span> 
            <span>Video</span>
          </p>
          <p className="mt-0 mb-5">
            <strong className="mr-10">Booked By:</strong>
            <span>{formData?.receiverName}</span>
          </p>
          <p className="mt-0 mb-5">
            <strong className="mr-10">Date:</strong>
            <span>{formData?.date}</span>
            <span> | </span>
            <strong className="mr-10">Time:</strong>
            <span>{formData?.time}</span>
          </p>
        </div>
      </div>
      {formData.isBookedSlotUpdated && <div className="qus-item">The "Accept" button is hidden because this is the slot you have proposed to the end user. Therefore, it is assumed that you have already accepted and proposed a new slot.</div>}
      <div className="d-flex flex-row justify-center w-100 mb-50">

        {(formData?.statusId !== 2 && !formData.isBookedSlotUpdated) && 
          
          <button className="primary_btns svg-linr-icns d-flex items-center" onClick={handleAcceptClick}>
            <span className="mr-10 d-flex"><CheckOutlinedIcon /></span>Accept
          </button>
        }
        <button className="primary_btns svg-linr-icns d-flex items-center" onClick={handleDeleteClick}>
          <span className="mr-10 d-flex"><CloseIcon /></span>Reject
        </button>
        <button className="primary_btns svg-linr-icns d-flex items-center" onClick={() => setShowForm(true)}>
          <span className="mr-10 d-flex"><PencilIcon /></span>Edit
        </button>
      </div> 
      {showForm && (
      <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="d-flex flex-row justify-between w-100 pl-20 pr-20">
          <div className="w-30 mr-10 mb-20">
            <Controller
              name="date"
              control={control}
              rules={{ required: "This is required field" }}
              render={({ field: { onChange, value } }) => (
                <CustomDatePicker
                  label="New Date"
                  value={value}
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
          <div className="w-30 mr-10 mb-20">
            <Controller
              name="startTime"
              control={control}
              rules={{ required: "This is required field" }}
              render={({ field: { onChange, value } }) => (
                <CustomTimePicker
                  label="Start Time"
                  value={value || null}
                  size="small"
                  className="avail-date-filter"
                  onChange={(newValue) => {
                    onChange(newValue);
                    const endtime = newValue.add((formData?.tagData?.eventDuration || formData?.eventDurationInMinutes), "minutes")
                    setValue('endTime', endtime)
                  }}
                  // onChange={onChange , const endtime  = selectedvalue setValue('endTime',endtime)}
                  error={!!errors?.startTime}
                  helperText={errors?.startTime?.message}
                  minutesStep={15}
                />
              )}
            />
          </div>
          <div className="w-30 mb-20">
            <Controller
              name="endTime"
              control={control}
              rules={{ required: "This is required field" }}
              render={({ field: { onChange, value } }) => (
                <CustomTimePicker
                  label="End Time"
                  value={value || null}
                  size="small"
                  className="avail-date-filter"
                  onChange={onChange}
                  disabled={true}
                  minutesStep={15}
                  error={!!errors?.endTime}
                  helperText={errors?.endTime?.message}
                />
              )}
            />
          </div>
          <div className="w-100 mb-20">
            <Controller
              name="text"
              control={control}
              rules={{ 
                required: "This field is required",
                validate: (value) => value.trim() !== "" || "This field is required", 
              }}
              render={({ field: { onChange } }) => (
                <CustomTextField
                    label="Description Text"
                    size="medium"
                    sx={{ marginBottom: 2 }}
                    className="w-100"
                    onChange={onChange}
                    error={!!errors?.text}
                    helperText={errors?.text?.message}
                  />
              )}
            />
          </div>
          <div className="w-100 d-flex justify-center">
            <CustomButton
              type="submit"
              size="medium"
              className="primary_btns"
              label="Submit"
            />
          </div>
        </div>
        
      </form>

      </>
      )}
      <Divider />
      <div style={{marginRight: 'auto', width: '100%'}}>
        <hr />
      <h3>Question - Answers</h3>
      {quesAns?.data?.length > 0 ? 
        <div>
          {quesAns?.data?.map((i: any, index: number) => {
            return (
              <div key={i.id}>
              <b> {index+1}) {i.question}</b>
              {i.type === "Rating" ? 
              <><br /> <Rating size="large" value={parseInt(i?.answer || 0)} readOnly /></>
              :
              <>
              { i.answer ? <ul>
                {i.answer.split(',').map((j: any) => {
                  return <li>{j}</li>
                })}
              </ul> : <p>NA</p> }
              </>
          }
              </div>
            )
          })}
        </div>
        : <b>No Questions are Available</b>  
      }
      <br />
      <h3>Comments - </h3>
      {formData?.comments ? formData?.comments : 'NA'}
      </div>
    </div>
   
    </>
  );
};

export default EditAvailabilityRespondInvite;
