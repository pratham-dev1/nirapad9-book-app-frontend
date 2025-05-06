import React, { useContext, useEffect, useState } from "react";
import CustomTextField from "../../components/CustomTextField";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import CustomButton from "../../components/CustomButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import CustomCheckBox from "../../components/CustomCheckbox";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { CREATE_USER, GET_USERTYPES, EDIT_USER } from "../../constants/Urls";
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

interface Props {
  formData: object | any;
  URL: string
  refetch: () => void;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBookedOpenDialog?: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditAvailability = (props: Props) => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const [date, setDate] = useState<any>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [title, setTitle] = useState<string>();
  const { formData, URL, refetch, setOpenDialog, setIsBookedOpenDialog } = props;
  const [minEndTime, setMinEndTime] = useState<any>();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Update endTime when minEndTime changes
    if (minEndTime) {
      setEndTime(dayjs(minEndTime).format("HH:mm"));
    }
  }, [minEndTime]);

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
    return {startTime: startDateTime, endTime: endDateTime};
  };

  useEffect(() => {
    const dateValue = formData.datetime ? dayjs(formData.datetime).tz(default_timeZone) : null;
    setDate(dateValue)
    const startTimeValue = formData.datetime ? dayjs(formData.datetime).tz(default_timeZone).format("HH:mm") : ""
    setStartTime(startTimeValue)
    const endTimeValue = formData.datetime ? (dayjs(formData.datetime).add(formData?.tagData?.eventDuration, 'minute')).tz(default_timeZone) : null;
    setMinEndTime(endTimeValue)
    // const titleValue = formData?.events?.[0]?.title || '';
    const titleValue = formData?.title || '';
    setTitle(titleValue)
  }, []);

  const { mutate, isLoading: editAvailabilityLoading }: any = useMutation((body: object) => request(URL, "post", body), {
    onSuccess: (data) => {
      if(data.isBooked){
        setIsBookedOpenDialog?.(true)      
      }
        showToast(ToastActionTypes.SUCCESS, data?.message);
        refetch();
        setOpenDialog(false)  
    }
  });

  const checkExistingSlotsOrUpdate = () => {
    let currentDateTimeSlot = dateTimeSlotCalculation(
      date,
      startTime,
      endTime
    );
    mutate({
      id: formData.id,
      dateTimeSlot: currentDateTimeSlot?.startTime,
      title: title,
      endtime: currentDateTimeSlot?.endTime
    });
  };

  return (
    <>
    {editAvailabilityLoading && <Loader />}
    <div
      className="edit-event-popup-inner"
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {formData?.booked && (
        <>
          <div className="w-100">
            <CustomTextField
              label="Title"
              className="w-100"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              value={title || ""}
            />
          </div>
        </>
      )}

      <div className="d-flex flex-row justify-center w-100 pl-20 pr-20">
        <div className="w-30 mr-10">
          <CustomDatePicker
            label="New Date"
            size="small"
            className="w-100"
            value={date || null}
            onChange={(value: Dayjs) =>
              setDate(value)
            }
            disablePast={true}
          />
        </div>
        <div className="w-30 mr-10">
          <CustomTimePicker
            label={`Start Time (${default_timeZone})`}
            size="small"
            value={(dayjs(formData.datetime).tz(default_timeZone)) || null}
            minutesStep={15}
            onChange={(newValue) => {
              setStartTime(dayjs(newValue).format("HH:mm"));
              setMinEndTime(dayjs(newValue).add(formData?.tagData?.eventDuration, "minutes"));
            }}
          />
        </div>
        
        <div className="w-30">
          <CustomTimePicker
            label="End Time"
            size="small"
            value={ minEndTime || null}
            minutesStep={15}
            disabled={true}
            onChange={(newValue) => {
              setEndTime(newValue);
            }}
          />
        </div>
        {/* <div className="w-95 pl-10 pr-10 mt-20">
          <label className="input-label">Text Message</label>
          <TextareaAutosize  aria-label="minimum height" minRows={3} placeholder="Text Message" />
        </div> */}
      </div>
     

      <div className="form-act">
        <CustomButton
          label="Save Booking"
          size="medium"
          onClick={checkExistingSlotsOrUpdate}
          sx={{ marginTop: 3 }}
        />
      </div>
    </div>
    </>
  );
};

export default EditAvailability;
