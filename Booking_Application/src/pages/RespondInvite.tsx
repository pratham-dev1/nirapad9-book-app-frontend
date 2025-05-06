import React, { useContext, useState } from "react";
import CustomButton from "../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import dayjs, { Dayjs } from "dayjs";
import CustomDatePicker from "../components/CustomDatePicker";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { GET_PROPOSE_NEW_TIME, RESPOND_EVENT_INVITE } from "../constants/Urls";
import { useLocation } from "react-router-dom";
import CustomTimePicker from "../components/CustomTimePicker";
import { AuthContext } from "../context/auth/AuthContext";
import moment from 'moment-timezone';
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";
import { queryClient } from "../config/RQconfig";

type FormInputProps = {
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
  text: string;
};

const RespondInvite = ({formData, setOpenDialog}: any) => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const event = formData || {}
  const [showForm, setShowForm] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputProps>();

  const {mutate, isLoading} = useMutation((body: object) => request(RESPOND_EVENT_INVITE, 'post', body),{
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setOpenDialog(false)
      queryClient.invalidateQueries('event-hub-history');
      queryClient.invalidateQueries('propose-new-time-list');
    }
  })

  const {data, isLoading: isLoading2} = useQuery('propose-new-time-list', () => request(`${GET_PROPOSE_NEW_TIME}/${event?.eventIdAcrossAllCalendar}/${state.userId}`))

  const onSubmit = ({date,startTime,endTime,text}: FormInputProps) => {
    // let startDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime.format("HH:mm")}`, default_timeZone).toISOString();
    // let endDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${endTime.format("HH:mm")}`, default_timeZone).toISOString();
    // console.log(startDateTime, endDateTime)
    const isPastEvent = dayjs().tz(default_timeZone) > dayjs(event.startTimeValue).tz(default_timeZone)
        if(isPastEvent) {
          showToast(ToastActionTypes.ERROR, "You Can't Perform Actions on Past Events")
          return;
        }

    if(dayjs().tz(default_timeZone) > dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime.format("HH:mm")}`, default_timeZone)){
      showToast(ToastActionTypes.ERROR, "Please Provide Future Date-time only")
      return;
    }
    mutate({
      date: dayjs(date).format("DD-MM-YYYY"),
      startTime: `${dayjs(startTime).format("h:mm A")} ${default_timeZone_abbr}`,
      endTime: `${dayjs(endTime).format("h:mm A")} ${default_timeZone_abbr}`,
      text, 
      senderEmail: event.senderEmail,
      datetimeUTC: dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime.format("HH:mm")}`, default_timeZone).toISOString(),
      eventTitle: formData.title,
      emailAccount: event.emailAccount,
      eventId: event?.eventId,
      isProposingNewtime: true,
      startDateTime: dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime.format("HH:mm")}`, default_timeZone).toISOString(),
      endDateTime: dayjs.tz(`${date?.format("YYYY-MM-DD")} ${endTime.format("HH:mm")}`, default_timeZone).toISOString(),
      eventIdAcrossAllCalendar: event?.eventIdAcrossAllCalendar,
      eventDate: dayjs(formData?.startTimeValue).tz(default_timeZone).format('DD-MM-YYYY'),
      eventStartTime: `${dayjs(formData?.startTimeValue).tz(default_timeZone).format("h:mm A")} ${default_timeZone_abbr}`,
      eventEndTime: `${dayjs(formData?.endTimeValue).tz(default_timeZone).format("h:mm A")} ${default_timeZone_abbr}`,
      title: formData?.title
    })
  };
  return (
    <>
    {isLoading && <Loader /> }
      <div className="edit-event-popup-inner d-flex flex-row items-center">
        <div className="w-100 evnt_details d-flex flex-column primary_color items-center">
          <h3 className="mt-0 mb-10"><strong>{event?.title}</strong></h3>
          <div className="mb-50">
            <p className="mt-0 mb-5">
              <strong className="mr-10">Event:</strong>
              <span>{`${event.eventTypeValue || 'NA'} | ${event.eventDurationInMinutes} mins`}</span>
            </p>
            <p className="mt-0 mb-5">
              <strong className="mr-10">Created By:</strong>
              <span>{event?.senderEmail}</span>
            </p>
            <p className="mt-0 mb-5">
              <strong className="mr-10">No. of attendees:</strong>
              <span>{event?.attendees?.split(',').length || 'NA'}</span>
            </p>
            <p className="mt-0 mb-5">
              <strong className="mr-10">Date:</strong>
              <span>{event?.startTime}</span>
            </p>
          </div>
        </div>

        <div className="d-flex flex-row justify-center w-100 mb-50">
          <CustomButton label="Accept" className="primary_btns mr-25" onClick={() => mutate({eventId: event?.eventId, status: true, senderEmail: event.senderEmail, senderEmailServiceProvider: event.senderEmailServiceProvider, emailAccount: event.emailAccount})} />
          <CustomButton label="Reject" className="primary_btns mr-25" onClick={() => mutate({eventId: event?.eventId, status: false, senderEmail: event.senderEmail, senderEmailServiceProvider: event.senderEmailServiceProvider, emailAccount: event.emailAccount})} />
          <CustomButton label="Propose new" className="primary_btns" onClick={() => setShowForm(true)} />
        </div>
      </div>

      {showForm && <>
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
                  onChange={onChange}
                  error={!!errors?.startTime}
                  helperText={errors?.startTime?.message}
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
              rules={{ required: "This is required field" }}
              render={({ field: { onChange } }) => (
                <CustomTextField
                    label="Text Message"
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
      <div className="w-100 d-flex flex-row list-view-template all-qus-list mt-30">
        <h3>Time proposed by you : -  </h3>
      <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
      <div className="w-100 d-flex tmplt_list_item items-center" style={{backgroundColor: '#f1f2f6'}}>
      <div className="tmplt_nme"><span>StartTime</span></div> 
      <div className="tmplt_nme"><span>EndTime</span></div> 
      <div className="tmplt_nme"><span>Comment</span></div>
      </div>
        {data?.data?.map((item: any) => {
          return <div className="w-100 d-flex tmplt_list_item items-center">
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
    </div>
      </>
      }
    </>
  );
};

export default RespondInvite;
