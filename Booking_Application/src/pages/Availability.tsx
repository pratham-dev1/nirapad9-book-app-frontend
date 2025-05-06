import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState, useContext } from "react";
import CustomButton from "../components/CustomButton";
import CustomCheckBox from "../components/CustomCheckbox";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomTimePicker from "../components/CustomTimePicker";
import { CHECK_EXISTING_SLOTS_OR_SAVE, SAVE_SLOT, CHECK_EXISTING_OPEN_AVAILABILITY_OR_SAVE, GET_USER_EMAILS, GET_OPEN_AVAILABILITY_TAG, GET_TAG_LINK_TYPES } from "../constants/Urls";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import CloseIcon from '@mui/icons-material/Close';
import CustomAutocomplete from "../components/CustomAutocomplete";
import Loader from "../components/Loader";
import CopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import { CLIENT_URL } from "../services/axios";
import { AuthContext } from "../context/auth/AuthContext";
import CustomTextField from "../components/CustomTextField";
import { useLocation, useNavigate } from "react-router-dom";
import { EventsContext } from "../context/event/EventsContext";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface DateProps {
  date: Dayjs | null;
  day: number;
}

interface WeekDaysProps {
  dayName: string;
  selected: boolean;
  date: Dayjs | null;
  isVisible: boolean;
  isWeekend?: boolean;
}

interface EventProps {
  startTime: string;
  endTime: string;
}

interface AvailabilityProps {
  URL?: string;
  SAVE_SLOT_OPEN_AVAILABILITY?: string;
}

interface EmailProps {
  id: number,
  value: string
}

interface OpenAvailabilityTagOptionProps {
  userId: number;
  tagName: string;
  defaultEmail?: string;
  isDeleted?: boolean;
  openAvailabilityText?: string;
  isPrimaryEmailTag: boolean
}

const Availability: React.FC<AvailabilityProps> = ({ URL, SAVE_SLOT_OPEN_AVAILABILITY }) => {
  const { state } = useContext(AuthContext);
  const {emailData} = useContext(EventsContext)
  const isEmailSynced = emailData?.filter(i => i.emailServiceProvider)?.length >= 1
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const navigate = useNavigate()
  const location = useLocation()

  const weekdays: Array<WeekDaysProps> = [
    { dayName: "Mon", selected: false, date: null, isVisible: true },
    { dayName: "Tues", selected: false, date: null, isVisible: true },
    { dayName: "Wed", selected: false, date: null, isVisible: true },
    { dayName: "Thurs", selected: false, date: null, isVisible: true },
    { dayName: "Fri", selected: false, date: null, isVisible: true },
    { dayName: "Sat", selected: false, date: null, isVisible: false, isWeekend: true },
    { dayName: "Sun", selected: false, date: null, isVisible: false, isWeekend: true },
  ];
  const { data, isLoading, isError } = useQuery('email-list', () => request(GET_USER_EMAILS));
  const { data: tagLinkTypes } = useQuery('tag-link-types', () => request(GET_TAG_LINK_TYPES))
  const TAG_LINK_TYPES = tagLinkTypes?.data || []
  const { data: openAvailabilityTag } = useQuery('tag-list', () => request(GET_OPEN_AVAILABILITY_TAG));
  const TAGS = openAvailabilityTag?.data?.filter((option: OpenAvailabilityTagOptionProps) => option.isDeleted === null)

  const [currentWeekDays, setCurrentWeekDays] =
    useState<WeekDaysProps[]>(weekdays);
  const [nextWeekDays, setNextWeekDays] = useState<WeekDaysProps[]>(weekdays);
  const [thirdWeekDays, setThirdWeekDays] = useState<WeekDaysProps[]>(weekdays);
  const [fourthWeekDays, setFourthWeekDays] = useState<WeekDaysProps[]>(weekdays);

  // const weekdays = ["Mon", "Tues", "Wed", "Thurs", "Fri"];
  const [getDate, setDate] = useState<DateProps>({ date: null, day: 0 });
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [minEndTime, setMinEndTime] = useState<any>();
  const [newSlots, setNewSlots] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [existingEvents, setExistingEvents] = useState<EventProps[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [email, setEmail] = useState<any>();
  const [openDialog2, setOpenDialog2] = useState<boolean>(false);
  const [existingOpenSlots, setExistingOpenSlots] = useState([]);
  const [duration, setDuration] = useState<any>()
  const [showWeekend, setShowWeekend] = useState(false)
  const [rawStartTime, setRawStartTime] = useState<any>()
  const [tagName, setTagName] = useState('')
  const [selectedTag, setSelectedTag] = useState<any>()

  useEffect(() => {
    // Update endTime when minEndTime changes
    if (minEndTime) {
      setEndTime(dayjs(minEndTime).format("HH:mm"));
    }
  }, [minEndTime]);

  useEffect(() => {
    rawStartTime && setMinEndTime(dayjs(rawStartTime).add(duration?.value, "minutes"));
  }, [selectedTag])
  const dateTimeSlotCalculation = (
    date: Dayjs | null,
    startTime: string,
    endTime: string
  ) => {
    let dateTimeSlots = [];

    let startDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${startTime}`, default_timeZone).utc();
    let endDateTime = dayjs.tz(`${date?.format("YYYY-MM-DD")} ${endTime}`, default_timeZone).utc();
    if (endDateTime.isBefore(startDateTime)) {
      // if endtime is before start time then adding date by 1 day for endtime
      endDateTime = endDateTime.add(1, "day");
    }

    while (
      // startDateTime < endDateTime &&
      endDateTime.diff(startDateTime, "minutes") >= duration.value // A slot must be of selected duration
    ) {
      dateTimeSlots.push({startTime: startDateTime.toISOString(), endTime: startDateTime.add(duration.value, 'minutes').toISOString()});
      startDateTime = startDateTime.add(duration.value, "minutes");
    }
    return dateTimeSlots;
  };

  const { mutate, isLoading: saveSlotLoading }: any = useMutation(
    (body: object) => request(URL ||
      CHECK_EXISTING_SLOTS_OR_SAVE,
      "post", body),
    {
      onSuccess: (data) => {
        setOpenDialog2(false)
        if ((data.existingSlots?.length > 0 || data.existingEvents?.length > 0 || data.existingOpenSlots?.length > 0) && data.newSlots?.length > 0) {
          setExistingSlots(data.existingSlots);
          setExistingOpenSlots(data.existingOpenSlots)
          setNewSlots(data.newSlots);
          setExistingEvents(data.existingEvents)
          setOpenDialog(true);
        } else if (
          (data.existingSlots?.length > 0 && data.existingEvents?.length > 0 && data.existingOpenSlots?.length > 0) &&
          data.newSlots?.length === 0
        ) {
          showToast(ToastActionTypes.WARNING, "All slots are duplicate in events , slots and open slots");
        }
        else if (
          (data.existingSlots?.length > 0 && data.existingEvents?.length > 0) &&
          data.newSlots?.length === 0
        ) {
          showToast(ToastActionTypes.WARNING, "All slots are duplicate in events and slots ");
        } else if (
          (data.existingEvents?.length > 0 && data.existingOpenSlots?.length > 0) &&
          data.newSlots?.length === 0
        ) {
          showToast(ToastActionTypes.WARNING, "All slots are duplicate in events and open slots ");
        } else if (
          (data.existingSlots?.length > 0 && data.existingOpenSlots?.length > 0) &&
          data.newSlots?.length === 0
        ) {
          showToast(ToastActionTypes.WARNING, "All slots are duplicate in slots and open slots ");
        }
        else if (data.existingSlots?.length > 0 && data.newSlots?.length === 0) {
          showToast(ToastActionTypes.WARNING, "All slots are creating dublicates with availability slots");
        } else if (data.existingEvents?.length > 0 && data.newSlots?.length === 0) {
          showToast(ToastActionTypes.WARNING, "All slots are clashing with events");
        }
        else if (data.existingOpenSlots?.length > 0 && data.newSlots?.length === 0) {
          showToast(ToastActionTypes.WARNING, "All slots are clashing with open slots");
        }
        else {
          showToast(ToastActionTypes.SUCCESS, data.message);
        }
      },
      onError: (error: any) => {
        let message = '';
        if (error.response.data?.failedEmails.length > 0) {
          message = (
            `${error.response.data.message} \n ${error.response.data?.failedEmails.map((item: any) => `${item} \n`)}`
          )
        }
        else {
          message = error.response.data.message;
        }
        showToast(ToastActionTypes.ERROR, message)
      }
    }
  );

  const { mutate: saveSlot, isLoading: saveSlotLoading2 }: any = useMutation(
    (body: object) => request(SAVE_SLOT_OPEN_AVAILABILITY || SAVE_SLOT, "post", body),
    {
      onSuccess: (data) => {
        setOpenDialog(false);
        showToast(ToastActionTypes.SUCCESS, data.message);
      },
    }
  );

  const checkExistingSlotsOrSave = () => {
    setOpenDialog2(false)
    let currentDateTimeSlots = dateTimeSlotCalculation(
      getDate.date,
      startTime,
      endTime
    );

    let currentWeekDateTimeSlots: any[] = [];
    currentWeekDays.forEach((item) => {
      if (item.selected) {
        currentWeekDateTimeSlots = [
          ...currentWeekDateTimeSlots,
          ...dateTimeSlotCalculation(item.date, startTime, endTime),
        ];
      }
    });

    let nextWeekDateTimeSlots: any[] = [];
    nextWeekDays.forEach((item) => {
      if (item.selected) {
        nextWeekDateTimeSlots = [
          ...nextWeekDateTimeSlots,
          ...dateTimeSlotCalculation(item.date, startTime, endTime),
        ];
      }
    });

    let thirdWeekDateTimeSlots: any[] = [];
    thirdWeekDays.forEach((item) => {
      if (item.selected) {
        thirdWeekDateTimeSlots = [
          ...thirdWeekDateTimeSlots,
          ...dateTimeSlotCalculation(item.date, startTime, endTime),
        ];
      }
    });

    let fourthWeekDateTimeSlots: any[] = [];
    fourthWeekDays.forEach((item) => {
      if (item.selected) {
        fourthWeekDateTimeSlots = [
          ...fourthWeekDateTimeSlots,
          ...dateTimeSlotCalculation(item.date, startTime, endTime),
        ];
      }
    });
    if (startTime === endTime) {
      showToast(ToastActionTypes.ERROR, 'Start time and end time can not be same')
      return;
    }

    // let formattedStartTime = dayjs(`${getDate.date?.format("YYYY-MM-DD")} ${startTime}`)
    // let formattedEndTime = dayjs(`${getDate.date?.format("YYYY-MM-DD")} ${endTime}`)
    let formattedStartTime = dayjs(`${getDate.date?.format("YYYY-MM-DD")} ${startTime}`).tz(default_timeZone)
    let formattedEndTime = dayjs(`${getDate.date?.format("YYYY-MM-DD")} ${endTime}`).tz(default_timeZone)
    if (formattedEndTime.isBefore(formattedStartTime)) {
      // if endtime is before start time then adding date by 1 day for endtime
      formattedEndTime = formattedEndTime.add(1, "day");
    }
    if (formattedEndTime.diff(formattedStartTime, "minutes") < duration.value) {
      showToast(ToastActionTypes.ERROR, `Slots is less than ${duration.value} minutes`)
      return;
    }

    const currentDateTime = dayjs().tz(default_timeZone);
    const startTimeWithSelectedDate = dayjs.tz(`${getDate?.date?.format("YYYY-MM-DD")} ${startTime}`,default_timeZone);
    const isPastSlot = currentDateTime > startTimeWithSelectedDate
    if (isPastSlot) {
      showToast(ToastActionTypes.ERROR, 'Please choose different range which should not contain past time')
      return;
    }
    mutate({
      dateTimeSlots: [
        ...currentDateTimeSlots,
        ...currentWeekDateTimeSlots,
        ...nextWeekDateTimeSlots,
        ...thirdWeekDateTimeSlots,
        ...fourthWeekDateTimeSlots
      ],
      email: email?.value,
      tagId: selectedTag?.id
    });
  };

  const handleSaveSlots = () => {
    setOpenDialog(false)
    const body = {
      dateTimeSlots: newSlots,
      email: email?.value,
      tagId: selectedTag?.id
    };
    saveSlot(body);
  };

  useEffect(() => {
    let currentWeekDaysWithDate = currentWeekDays.map(
      (item: object, index: number) => ({
        ...item,
        date: getDate?.date?.startOf("week").day(index + 1), // day(1) = monday and so on ...
        selected: false,
      })
    );
    setCurrentWeekDays(currentWeekDaysWithDate as WeekDaysProps[]);

    let nextWeekDaysWithDate = nextWeekDays.map(
      (item: object, index: number) => ({
        ...item,
        date: getDate?.date?.add(1, getDate.day === 0 ? 'day' : 'week').day(index + 1),
        selected: false,
      })
    );
    setNextWeekDays(nextWeekDaysWithDate as WeekDaysProps[]);
    
    let thirdWeekDaysWithDate = thirdWeekDays.map(
      (item: object, index: number) => ({
        ...item,
        date: getDate?.date?.add((getDate.day === 0 ? 1 : 2), 'week').day(index + 1),
        selected: false,
      })
    );
    setThirdWeekDays(thirdWeekDaysWithDate as WeekDaysProps[]);

    let fourthWeekDaysWithDate = fourthWeekDays.map(
      (item: object, index: number) => ({
        ...item,
        date: getDate?.date?.add((getDate.day === 0 ? 2 : 3), 'week').day(index + 1),
        selected: false,
      })
    );
    setFourthWeekDays(fourthWeekDaysWithDate as WeekDaysProps[]);
  }, [getDate]);

  const handleSlots = () => {
    if ((startTime > endTime) && endTime != "00:00" && endTime != "00:15") {
      setOpenDialog2(true)
    }
    else {
      checkExistingSlotsOrSave()
    }
  }

  const handleTagChange = (_: any, value: any) => {
    const tag = openAvailabilityTag.data.find((item: any) => item.tagName === value.tagName);
    setEmail({ id: 1, value: tag.defaultEmail });
    setDuration({value:tag.eventDuration})
    setTagName(tag.tagName)
    setSelectedTag(tag)
  }

  return (
    <div>
      {saveSlotLoading && <Loader />}
      <div className="availablity-filters filter-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <CustomDatePicker
          label="Date"
          size="small"
          className="avail-date-filter"
          sx={{ width: 300, paddingRight: 2 }}
          onChange={(value: Dayjs) =>{
            setDate({
              date: dayjs(value),
              day: dayjs(value).day(),
            })}
          }
          disablePast={true}
          value={getDate?.date || null}
        />
        {/* <CustomAutocomplete
          label="Duration"
          className="primary-dropdown-bg"
          options={[{label: '15 min', value: 15}, {label: '30 min', value: 30}, {label:'45 min', value: 45}, {label:'60 min', value: 60}]}
          sx={{ width: 150, my: 1, ml: 1 }}
          disableClearable={true}
          onChange={(e,v) => setDuration(v)}
          value={duration}
        /> */}
        {!!URL && <CustomAutocomplete
          label="TagId"
          className="primary-dropdown-bg"
          options={[{ id: "add_new", tagName: "Add New Tag" }, ...(TAGS || []) ]}
          getOptionLabel={(option: OpenAvailabilityTagOptionProps) => `${option?.tagName}`}
          sx={{ width: 300, my: 1, ml: 1 }}
          disableClearable={true}
          disableFilter
          onChange={(e, v) => {
            if(v.id === "add_new") {
                isEmailSynced ?  navigate('/add-new-tag', {state: {from:'/dashboard?tab=2&view=0'}}) : showToast(ToastActionTypes.ERROR, 'Sync your calendar to get started')
            }
            handleTagChange(e,v)
          }}
          value={selectedTag || null}
          renderOption={(props: any, option: any) => {
            if (option.id === "add_new") {
              return (
                <>
                  <li {...props} style={{ fontWeight: "bold", color: "#6298BB", cursor: "pointer" }}>
                    <AddCircleOutlineIcon /> {option.tagName}
                  </li>
                  {TAGS?.length > 0 && <hr />}
                </>
              );
            }
            return <li {...props}>{option.tagName}</li>;
          }}
        />}
        {!!URL && selectedTag && (
          <>
          <CustomTextField
          label="Tag Duration"
          className="primary-input-white"
          sx={{ width: 300, my: 1, ml: 1 }}
          value={duration?.value + ' mins'}
          disabled={true}
        />
          <CustomTextField
          label="Email"
          className="primary-input-white"
          sx={{ width: 300, my: 1, ml: 1 }}
          value={email?.value || ""}
          disabled={true}
        />
        </>
        )}
        <CustomTimePicker
          label="Start Time"
          size="small"
          className="avail-date-filter"
          style={{ width: 150}}
          minutesStep={15}
          onChange={(value: Dayjs) => {
            setRawStartTime(dayjs(value))
            setStartTime(dayjs(value).format("HH:mm"));
            setMinEndTime(dayjs(value).add(duration.value, "minutes"));
          }}
          disabled={!selectedTag}
          value={rawStartTime}
        />
        <CustomTimePicker
          label="End Time"
          size="small"
          className="avail-date-filter"
          style={{ width: 150 }}
          minutesStep={15}
          onChange={(value: Dayjs) => {
            setEndTime(dayjs(value).format("HH:mm"))
          }}
          value={minEndTime || null}
          // minTime={minEndTime || null}
          // maxTime={dayjs().set("hour", 23).set("minute", 59)}
          disabled={!startTime}
        />
        {selectedTag &&
          <Tooltip title="Copy link">
            <CopyIcon
              sx={{ my: 2, ml: 1, cursor: 'pointer' }}
              onClick={() => {
                showToast(ToastActionTypes.INFO, 'Link Copied', {autoClose: 1000})
                navigator.clipboard.writeText(`${CLIENT_URL}/book-your-appointment/${tagName}-${duration.value}mins/${state.userId}/${selectedTag?.id}/${TAG_LINK_TYPES[0]?.typeId}`)
              }}
            />
          </Tooltip>
        }
      </div>
      {getDate?.date && <CustomCheckBox
              label="Show Weekend"
              onChange={(_: React.SyntheticEvent, value: boolean) => {
                setCurrentWeekDays(prevDays => prevDays.map(i => (i.isWeekend ? {...i, isVisible: value, selected: false} : i)))
                setNextWeekDays(prevDays => prevDays.map(i => (i.isWeekend ? {...i, isVisible: value, selected: false} : i)))
                setThirdWeekDays(prevDays => prevDays.map(i => (i.isWeekend ? {...i, isVisible: value, selected: false} : i)))
                setFourthWeekDays(prevDays => prevDays.map(i => (i.isWeekend ? {...i, isVisible: value, selected: false} : i)))
                setShowWeekend(value)
              }}
              // checked={currentWeekDays.filter(i => i.isWeekend).every(day => day.selected)}
        />}
      {getDate?.date && getDate?.day !== 0 && (                    // day = 0 means sunday
        <div className="availabilty-days-content">
          {(getDate.day < 5 || showWeekend) && <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <p className="color-red">Current week</p>{" "}
            <CustomCheckBox
              label="Select all"
              onChange={(_: React.SyntheticEvent, value: boolean) => {
                setCurrentWeekDays(prevDays => {
                  return prevDays.map((day, index) => {
                    if (index >= getDate?.day && day.isVisible) {
                      return { ...day, selected: value };
                    }
                    return day;
                  });
                });
              }}
              checked={currentWeekDays.slice(getDate.day).filter(i => i.isVisible).length > 0 ? currentWeekDays.slice(getDate.day).filter(i => i.isVisible).every(day => day.selected) : false}
            />
          </div>}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            {currentWeekDays.slice(getDate.day).map(({ dayName, selected, date, isVisible}) => (
              <>
              {isVisible && <div
                key={dayName}
                className="days-chip"
                style={{
                  backgroundColor: selected ? "#b4cfe1" : "#f1f2f6",
                }}
                onClick={() => {
                  setCurrentWeekDays([
                    ...currentWeekDays.map((i) => {
                      if (i.dayName === dayName) {
                        return { ...i, selected: !selected };
                      }
                      return i;
                    }),
                  ]);
                }}
              >
                {dayName} ({dayjs(date).tz(default_timeZone).format('DD/MM/YY')})
              </div>
              } 
              </>
            ))}
          </div>
        </div>
      )}
      {getDate.date && (
        <>
        <div className="availabilty-days-content">
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ marginRight: "20px" }}>Next week</p>{" "}
            <CustomCheckBox
              label="Select all"
              onChange={(_: React.SyntheticEvent, value: boolean) =>
                setNextWeekDays(prevDays => {
                  return prevDays.map((day, index) => {
                    if (day.isVisible) {
                      return { ...day, selected: value };
                    }
                    return day;
                  });
                })
              }
              checked={nextWeekDays.filter(i => i.isVisible).every(day => day.selected)}
            />
          </div>
          <div style={{ display: "flex", marginBottom: "20px" }}>
            {nextWeekDays.map(({ dayName, selected, date, isVisible }) => (
              <>
               {isVisible && <div
                key={dayName}
                className="days-chip"
                style={{
                  backgroundColor: selected ? "#b4cfe1" : "#f1f2f6",
                }}
                onClick={() => {
                  setNextWeekDays([
                    ...nextWeekDays.map((i) => {
                      if (i.dayName === dayName) {
                        return { ...i, selected: !selected };
                      }
                      return i;
                    }),
                  ]);
                }}
              >
                {dayName} ({dayjs(date).tz(default_timeZone).format('DD/MM/YY')})
              </div>
              }
              </>
            ))}
          </div>
        </div>
        <div className="availabilty-days-content">
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <p style={{ marginRight: "20px" }}>Third week</p>{" "}
          <CustomCheckBox
            label="Select all"
            onChange={(_: React.SyntheticEvent, value: boolean) =>
              setThirdWeekDays(prevDays => {
                return prevDays.map((day, index) => {
                  if (day.isVisible) {
                    return { ...day, selected: value };
                  }
                  return day;
                });
              })
            }
            checked={thirdWeekDays.filter(i => i.isVisible).every(day => day.selected)}
          />
        </div>
        <div style={{ display: "flex",  marginBottom: "20px" }}>
          {thirdWeekDays.map(({ dayName, selected, date, isVisible }) => (
            <>
             {isVisible && <div
              key={dayName}
              className="days-chip"
              style={{
                backgroundColor: selected ? "#b4cfe1" : "#f1f2f6",
              }}
              onClick={() => {
                setThirdWeekDays([
                  ...thirdWeekDays.map((i) => {
                    if (i.dayName === dayName) {
                      return { ...i, selected: !selected };
                    }
                    return i;
                  }),
                ]);
              }}
            >
              {dayName} ({dayjs(date).tz(default_timeZone).format('DD/MM/YY')})
            </div>
            }
            </>
          ))}
        </div>
      </div>
      <div className="availabilty-days-content">
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ marginRight: "20px" }}>Fourth week</p>{" "}
            <CustomCheckBox
              label="Select all"
              onChange={(_: React.SyntheticEvent, value: boolean) =>
                setFourthWeekDays(prevDays => {
                  return prevDays.map((day, index) => {
                    if (day.isVisible) {
                      return { ...day, selected: value };
                    }
                    return day;
                  });
                })
              }
              checked={fourthWeekDays.filter(i => i.isVisible).every(day => day.selected)}
            />
          </div>
          <div style={{ display: "flex" }}>
            {fourthWeekDays.map(({ dayName, selected, date, isVisible }) => (
              <>
               {isVisible && <div
                key={dayName}
                className="days-chip"
                style={{
                  backgroundColor: selected ? "#b4cfe1" : "#f1f2f6",
                }}
                onClick={() => {
                  setFourthWeekDays([
                    ...fourthWeekDays.map((i) => {
                      if (i.dayName === dayName) {
                        return { ...i, selected: !selected };
                      }
                      return i;
                    }),
                  ]);
                }}
              >
                {dayName} ({dayjs(date).tz(default_timeZone).format('DD/MM/YY')})
              </div>
              }
              </>
            ))}
          </div>
        </div>
        </>
      )}

      <CustomButton
        label="Save Slots"
        size="medium"
        onClick={handleSlots}
        sx={{ marginTop: 3 }}
        disabled={!Boolean(URL ? getDate.date && startTime && email : getDate.date && startTime)}
      /> <br />
      <CustomButton
        label="Created Slots"
        size="medium"
        onClick={() => navigate('/all-slots')}
        sx={{ marginTop: 3 }}
      />
      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <h2 className="popup-title">Duplicate Slots Warning</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </DialogTitle>
        <DialogContent>
        {saveSlotLoading2 && <Loader />}
          {existingSlots.length > 0 && (
            <div className="mb-30">
              <ul className="font-bold">
                {existingSlots.map((item: any) => {
                  return (
                    <li key={item}>{dayjs(item.startTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')}</li>
                  )
                })}
              </ul>
              These above Slots are already saved by you. Do you want to continue with new
              slots?
            </div>
          )}

          {existingEvents.length > 0 && (
            <div className="mb-30">
              <ul className="font-bold">
                {existingEvents.map((item: any) => (
                  <li key={`${item.startTime}`}>
                    {`Start Time: ${dayjs(item.startTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')} - End Time: ${dayjs(item.endTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')}`}
                  </li>
                ))}
              </ul>
              You already have events at the above slot timings. Do you want to continue with new slots?
            </div>
          )}

          {existingOpenSlots.length > 0 && (
            <div className="mb-30">
              <ul className="font-bold">
                {existingOpenSlots.map((item:any) => (
                  <li key={item}>{dayjs(item.startTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')}</li>
                ))}
              </ul>
              You already have Open Slots at the above slot timings. Do you want to continue with new slots?
            </div>
          )}
          <div className="d-flex justify-center mt-20">
            <CustomButton className="secondary_btns mr-25" label="Cancel" onClick={() => setOpenDialog(false)} />
            <CustomButton className="primary_btns mr-0" label="Save" onClick={handleSaveSlots} disabled={saveSlotLoading2} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDialog2}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Warning
        </DialogTitle>
        <CloseIcon onClick={() => setOpenDialog2(false)} />
        <Divider />
        <DialogContent>
        {saveSlotLoading && <Loader />}
          You have selected an End Date less than the Start Date. The slots staring from 12 AM will be saved for next day. Click on save to continue
        </DialogContent>
        <DialogActions>
          <CustomButton label="Save" onClick={checkExistingSlotsOrSave} disabled={saveSlotLoading}/>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Availability;
