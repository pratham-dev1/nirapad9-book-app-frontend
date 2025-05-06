import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import CustomButton from "../components/CustomButton";
import { BOOK_OPEN_AVAILABILITY, GET_OPEN_AVAILABILITY, GET_OPEN_AVAILABILITY_USER_DATA, GET_TIMEZONES } from "../constants/Urls";
// import moment from "moment-timezone";
import dayjs from "dayjs";
// import CustomDatePicker from "../components/CustomDatePicker";
import { Avatar } from "@mui/material";
import { SERVER_URL } from "../services/axios"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import '../styles/AvailableSlotsStyle.css'
import CustomDateCalendar from "../components/CustomDateCalendar";
import Loader from "../components/Loader";
import PhoneInput from "react-phone-input-2";
import { queryClient } from "../config/RQconfig";
import CustomAutocomplete from "../components/CustomAutocomplete";
import OpenSlotFeedbackForm from "./OpenSlotFeedbackForm";
import BackArrowIcon from "../styles/icons/BackArrowIcon";

interface FormInputProps {
  purpose: string;
  name: string;
  email: string;
  phone: string;
  guests: string[];
  timezone: any;
}
interface Timeslot {
  id: string;
  time: string;
  datetime: string;
}

interface OpenAvailabilityData {
  isTagDeleted: boolean;
  data: { id: string; datetime: string, user: {fullname: string, email: string} }[];
  tagName: string;
  openAvailabilityText: string;
  isAllowedToAddAttendees: boolean;
  openAvailabilityQuestions: any[];
  email: string;
  image: string;
  isOrgDisabledTagLogo: boolean;
  isEmailDeleted: boolean;
  showCommentBox: boolean;
  eventDuration: number;
  emailVisibility: boolean
}

const AvailableSlots = () => {
  const navigate = useNavigate()
  const current_timeZone = dayjs.tz.guess()
  const { userId, tagId, tagTypeId, slotId } = useParams<{ userId: string, tagId: string, tagTypeId: string, slotId: string }>();
  const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<{ id: string; time: string, datetime: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<null | number>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(0);
  const [uiMode, setUiMode] = useState('slots');
  const [selectedslot, setSelectedSlot] = useState<{ id: string; time: string } | null>(null);
  const [formTitle, setFormTitle] = useState('')
  const [loading, setLoading] = useState(true);
  const [nameCount, setNameCount] = useState('')
  const [titleCount, setTitleCount] = useState('')
  const [dialCode, setDialCode] = useState<string>('')
  const [showAddGuestField, setShowAddGuestField] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [eventInfo, setEventInfo] = useState<any>({})
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [formattedDateTime, setFormattedDateTime] = useState<string | null>(null);
  const [tagRelatedContent, setTagRelatedContent] = useState<any>()
  const [isEmailDeleted, setIsEmailDeleted] = useState(false)
  const [rescheduleReason, setRescheduleReason] = useState('')
  const {
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormInputProps>({
    defaultValues: {
      timezone: {timezone: current_timeZone, value: current_timeZone}
    }
  });
  
  const { data: openAvailabilityUserData, isLoading: userDataLoading } = useQuery('openAvailabilityUserData', () => request(GET_OPEN_AVAILABILITY_USER_DATA, 'get', { userId: userId }));

  const { data: openAvailabilitySlots, isLoading: slotDataLoading } = useQuery<OpenAvailabilityData>(
    ['openAvailabilitySlots', selectedMonth],
    () => request(GET_OPEN_AVAILABILITY, 'get', { userId: userId, tagId: tagId, startDate: selectedMonth ? dayjs(selectedMonth).tz(watch('timezone').value).toISOString() : null, endDate: selectedMonth ? dayjs(selectedMonth).tz(watch('timezone').value).endOf('month').toISOString() : null }), {
      onSuccess: (data) => {
        if (data.isTagDeleted) {
          setUiMode("Link Expired")
        }
        if(data.isAllowedToAddAttendees){
          setShowAddGuestField(true)
        }
        if(data.isEmailDeleted) {
          setIsEmailDeleted(true)
        }
      }
    }
  );
  const { data: timezones } = useQuery("timezones", () => request(GET_TIMEZONES))
  // const { isDateAvailable } = useAvailableDates(openAvailabilitySlots, watch("timezone")?.value);

  const handleTimeslotClick = (timeslot: { id: string; time: string, datetime: string }) => {
    setSelectedTimeslot(timeslot);
    setSelectedSlot(timeslot)

    const start = dayjs(timeslot.datetime).tz(watch('timezone')?.value);
    const end = start.add(openAvailabilitySlots?.eventDuration!, 'minute'); 
    const formatted = `${start.format('MMMM D')}, ${start.format('hh:mm')} - ${end.format('hh:mm A')}`;
    setFormattedDateTime(formatted);
    setCurrentStep(3);
  };

  const { mutateAsync: mutateSendEvent, isLoading, data } = useMutation(
    (body: object) => request(BOOK_OPEN_AVAILABILITY, "post", body),
    {
      onSuccess: (data) => {
        if(data.isTimeSlotChanged) {
          queryClient.invalidateQueries("openAvailabilitySlots");
        }else if (data.isTagDeleted || data?.isLimitOverToBookSlot) {
          data.isEmailDeleted && setIsEmailDeleted(true)
          setUiMode('Link Expired')
        }
        else {
          const updatedTimeslots = availableTimeslots.filter(timeslot => timeslot.id !== selectedTimeslot?.id);
          setAvailableTimeslots(updatedTimeslots);
          setCurrentPage(1)
          setSelectedTimeslot(null);
          // setUiMode('confirmation');
          setUiMode('Feedback')
          // reset({})
          setTitleCount('')
          setNameCount('')
          showToast(ToastActionTypes.SUCCESS, data.message);
        }
      },
    }
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendEvent = async (formdata: FormInputProps) => {
    setFormTitle(formdata?.purpose);
    if (selectedTimeslot && dayjs(selectedTimeslot.datetime).tz(watch('timezone')?.value).isAfter(dayjs().tz(watch('timezone')?.value))) {
      // mutateSendEvent({ ...formdata, userId: userId, tagId: tagId, id: selectedTimeslot?.id, booked: true,
      //   datetime: selectedTimeslot?.datetime, 
      //   phone: `+${dialCode} ${formdata.phone.replace(dialCode, '').trim()}`});
      setEventInfo({
         ...formdata, 
         userId: userId, 
         tagId: tagId, 
         id: selectedTimeslot?.id, booked: true,
         datetime: selectedTimeslot?.datetime, 
         phone: `+${dialCode} ${formdata.phone.replace(dialCode, '').trim()}`
        })
        setUiMode('Feedback')
    }else {
      if(!selectedTimeslot){
        showToast(ToastActionTypes.ERROR, 'Please choose a time slot.');
      }else{
        showToast(ToastActionTypes.ERROR, 'Selected datetime is in the past. Please Select another Slot');
      }
      queryClient.invalidateQueries("openAvailabilitySlots");
    }
    // mutateSendEvent({ ...formdata, userId: userId, tagId: tagId, id: selectedTimeslot?.id, booked: true,
    // datetime: selectedTimeslot?.datetime, 
    // phone: `+${dialCode} ${formdata.phone.replace(dialCode, '').trim()}`});
  };

  const handleDateChange = (date: Date) => {
    setCurrentPage(1)
    setSelectedDate(date);

    const formattedDate = dayjs(date).tz(watch('timezone')?.value).format('dddd, MMMM D, YYYY');
    setFormattedDate(formattedDate);

    setSelectedTimeslot(null)
    fetchAvailableTimeslots(date);
    setCurrentStep(2);
  };

  const handleMonthChange = (month: number) => {
    setSelectedDate(null)
    setSelectedTimeslot(null)
    setSelectedMonth(month)
    setCurrentPage(1)
    setCurrentStep(1);
  };
  const fetchAvailableTimeslots = (date: Date) => {
    const selectedDateFormatted = dayjs(date).tz(watch('timezone')?.value).format("DD-MM-YYYY");
    const availableTimeslotsForDate = openAvailabilitySlots?.data?.filter(item => {
      const itemDateFormatted = dayjs(item.datetime).tz(watch('timezone')?.value).format("DD-MM-YYYY");
      return itemDateFormatted === selectedDateFormatted;
    });
    const timeslots = availableTimeslotsForDate?.map(item => ({
      id: item.id,
      time: dayjs(item.datetime).tz(watch('timezone')?.value).format("h:mm A"),
      datetime: item.datetime
    }));
    setAvailableTimeslots(timeslots || []);

  };

  useEffect(() => {
    const isTagDeleted = openAvailabilitySlots?.isTagDeleted
    if (openAvailabilitySlots?.data && openAvailabilitySlots.data.length > 0 && isTagDeleted === false) {
      const earliestDate = openAvailabilitySlots.data.reduce((earliest, current) => {
        return dayjs(current.datetime).tz(watch('timezone')?.value).isBefore(dayjs(earliest.datetime)) ? current : earliest;
      });
      const earliestDateAsDate = dayjs(new Date(earliestDate.datetime)).tz(watch('timezone')?.value);
      setSelectedDate(earliestDateAsDate);
      fetchAvailableTimeslots(earliestDateAsDate.toDate());
      setUiMode('slots');
    }
    openAvailabilitySlots?.data && setTagRelatedContent({openAvailabilityText: openAvailabilitySlots.openAvailabilityText, tagName: openAvailabilitySlots.tagName, tagLogo: openAvailabilitySlots.image, isOrgDisabledTagLogo: openAvailabilitySlots.isOrgDisabledTagLogo})
  }, [openAvailabilitySlots, watch('timezone')]);

  const availableDatesSet = useMemo(() => {
    return new Set(
      openAvailabilitySlots?.data?.map(item =>
        dayjs(item.datetime).tz(watch("timezone")?.value).format("DD-MM-YYYY")
      ) || []
    );
  }, [openAvailabilitySlots?.data, watch("timezone")?.value]);
  
  const isDateAvailable = useCallback((date: Date) => {
    const dateFormatted = dayjs(date).tz(watch("timezone")?.value).format("DD-MM-YYYY");
    return availableDatesSet.has(dateFormatted);
  }, [availableDatesSet]);

  const itemsPerPage = 9;
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReschedule = () => {
    mutateSendEvent({id: selectedTimeslot?.id, userId, tagId, slotId, tagTypeId, rescheduleReason, datetime: selectedTimeslot?.datetime}).then(() => {
      setUiMode("confirmation")
    })
  }

  const renderTimeslots = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return availableTimeslots.slice(startIndex, endIndex).map((timeslot, index) => (
      <div
        key={index}
        onClick={() => handleTimeslotClick(timeslot)}
        style={{
          backgroundColor: selectedTimeslot?.time === timeslot.time ? '#C5DEF7' : '#EBECF0',
          textAlign: "center",
          padding: "16px 40px",
          borderRadius: "5px",
          fontSize: "13px",
          cursor: "pointer"
        }}
      >
        {timeslot.time}
      </div>
    ));
  };
  useEffect(() => {
    const totalPages = Math.ceil(availableTimeslots.length / itemsPerPage);
    if (selectedDate) {
      setPageSize(totalPages)
    }
  }, [availableTimeslots?.length, selectedDate])

  useEffect(() => {
    if (!userDataLoading && !slotDataLoading) {
      setLoading(false);
    }
  }, [userDataLoading, slotDataLoading]);

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const goBack = () => {
    setCurrentStep((prevStep) => Math.max(1, prevStep - 1));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="main-container aa">
      {isLoading && <Loader />}
      {uiMode === "Link Expired" ? (
        <>
          <div className="page-wrapper mt-100">
            <div className="card-box mw-800">
              <h1 className="mt-0 text-center">{data?.isLimitOverToBookSlot ? 'You are not allowed to book more than two slot with same email in a single day' : 'Link Expired'}</h1>
              {(!isEmailDeleted && openAvailabilitySlots?.emailVisibility) && <p className="text-center">Please co-ordinate with the {openAvailabilityUserData?.userData?.fullname} at {openAvailabilitySlots?.email || data?.email}</p> }
            </div>
          </div>
          
        </>
      )
        
        :
        uiMode === "Feedback" ? (
          <>
            <div className="available-slots-main slot-ques-wrp booking-confirm-main d-flex flex-row">

              {isMobile ? (
                <>
                  <div className="w-100">
                    <div className="sideleft-nav">
                      <div className="sidelogo d-flex">
                      <img src={(tagRelatedContent?.tagLogo && !tagRelatedContent?.isOrgDisabledTagLogo) ? `${SERVER_URL}/public/images/profilePictures/${tagRelatedContent?.tagLogo}` : "/logo.png"} height="52" width="75" />
                        <p className="font-bold"> Book a slot with {openAvailabilityUserData?.userData?.fullname}</p>
                      </div>
                      <div className="profile_dtls">
                        <Avatar src={`${SERVER_URL}/public/images/profilePictures/${openAvailabilityUserData?.userData?.profilePicture}`} sx={{ width: 100, height: 100 }} />
                        {/* <p className="user_name">{openAvailabilityUserData?.userData?.fullname}</p> */}
                      </div>
                      <div className="profile-adnl-info color-white slt_time"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>
                    </div>
                    <div className="tme_zone">
                      {currentStep === 3 && ( 
                        <>
                          <div className="slctd_dt-1 d-flex justify-center items-center w-100 pt-20 mb-15">
                            <span className='back-to mr-15 cursur-pointer' onClick={goBack}><BackArrowIcon /></span>
                            <span className="font-20 font-bold">{formattedDateTime}</span>
                          </div>
                        </>
                      )}
                      <img className="mr-10" src='/time-zone.svg'/>
                      <span>{current_timeZone}</span>
                    </div>
                  </div> 

                </>
              ) : (
                <div className="sideleft-nav">
                  <div className="sidelogo">
                    <img src={(tagRelatedContent?.tagLogo && !tagRelatedContent?.isOrgDisabledTagLogo) ? `${SERVER_URL}/public/images/profilePictures/${tagRelatedContent?.tagLogo}` : "/logo.png"} height="52" width="75" />
                    <p> Book a slot with {openAvailabilityUserData?.userData?.fullname}</p>

                  </div>
                  <div className="profile_dtls">
                    <Avatar src={`${SERVER_URL}/public/images/profilePictures/${openAvailabilityUserData?.userData?.profilePicture}`} sx={{ width: 100, height: 100 }} />
                    <p className="user_name">{openAvailabilityUserData?.userData?.fullname}</p>
                  </div>
                  <div className="profile-adnl-info color-white"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>
                  <div className="profile-adnl-info color-white"> <VideocamIcon /> Web conferencing details provided upon confirmation</div>
                </div>
              )}

              {isMobile ? (
                <div className="sideright-main">
                  <h3 className="text-center">Please fill the Questionnaire</h3>
                  <div className="w-100 ques_list_item">
                    <OpenSlotFeedbackForm questions={openAvailabilitySlots?.openAvailabilityQuestions || []} setUiMode={setUiMode} slots={openAvailabilitySlots?.data || []} setSelectedSlot={setSelectedSlot} slot={selectedslot} mutateSendEvent={mutateSendEvent} eventInfo={{...eventInfo, tagTypeId, slotId}} showCommentBox={openAvailabilitySlots?.showCommentBox!} selectedTimezone={watch('timezone')}  />
                  </div>
                </div>
              ) : (
                <div className="sideright-main">
                  <div className="top-head d-flex justify-between">
                    <h3>Please fill the Questionnaire</h3>
                    <p className="timezone-select">Timezone: {current_timeZone}</p>
                  </div>
                  <div className="w-100 ques_list_item">
                    <OpenSlotFeedbackForm questions={openAvailabilitySlots?.openAvailabilityQuestions || []} setUiMode={setUiMode} slots={openAvailabilitySlots?.data || []} setSelectedSlot={setSelectedSlot} slot={selectedslot} mutateSendEvent={mutateSendEvent} eventInfo={{...eventInfo, tagTypeId, slotId}} showCommentBox={openAvailabilitySlots?.showCommentBox!} selectedTimezone={watch('timezone')} />
                  </div>
                </div>
              )}



              
            </div> 

          </>
        )
          
        :
        uiMode === 'confirmation' ?

          <div className="available-slots-main booking-confirm-main d-flex flex-row">
            {isMobile ? (
                <>
                  <div className="w-100">
                    <div className="sideleft-nav">
                      <div className="sidelogo d-flex">
                      <img src={(tagRelatedContent?.tagLogo && !tagRelatedContent?.isOrgDisabledTagLogo) ? `${SERVER_URL}/public/images/profilePictures/${tagRelatedContent?.tagLogo}` : "/logo.png"} height="52" width="75" />
                        <p className="font-bold"> Book a slot with {openAvailabilityUserData?.userData?.fullname}</p>
                      </div>
                      <div className="profile_dtls">
                        <Avatar src={`${SERVER_URL}/public/images/profilePictures/${openAvailabilityUserData?.userData?.profilePicture}`} sx={{ width: 100, height: 100 }} />
                        {/* <p className="user_name">{openAvailabilityUserData?.userData?.fullname}</p> */}
                      </div>
                      <div className="profile-adnl-info color-white slt_time"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>
                    </div>
                    
                  </div> 

                </>
              ) : (
                <div className="sideleft-nav">
                  <div className="sidelogo">
                    <img src={(tagRelatedContent?.tagLogo && !tagRelatedContent?.isOrgDisabledTagLogo) ? `${SERVER_URL}/public/images/profilePictures/${tagRelatedContent?.tagLogo}` : "/logo.png"} height="52" width="75" />
                    <p> Book a slot with {openAvailabilityUserData?.userData?.fullname}</p>

                  </div>
                  <div className="profile_dtls">
                    <Avatar src={`${SERVER_URL}/public/images/profilePictures/${openAvailabilityUserData?.userData?.profilePicture}`} sx={{ width: 100, height: 100 }} />
                    <p className="user_name">{openAvailabilityUserData?.userData?.fullname}</p>
                  </div>
                  <div className="profile-adnl-info color-white"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>
                  <div className="profile-adnl-info color-white"> <VideocamIcon /> Web conferencing details provided upon confirmation</div>
                </div>
              )}
            


            <div className="sideright-main">
              
              <div className="booking-details-info d-flex align-center justify-center flex-column">
                <div className="user_dt d-flex align-center justify-center mb-50">
                  <CheckCircleRoundedIcon />
                  <p className="user_name">Hi {watch('name')} <br />You are scheduled</p>
                </div>
                <p className="calendar_txt">A calendar invitation has been sent to your email address.</p>

                <div className="booking-confirm-details w-100 mw-700">  
                  <h4 className="m-zero">{openAvailabilitySlots?.eventDuration} minutes meeting</h4>

                  <p className="m-zero"><PersonOutlineIcon /> <span>{openAvailabilityUserData?.userData?.fullname}</span></p>
                  <p className="m-zero"><CalendarMonthOutlinedIcon />{selectedslot?.time} {dayjs(selectedDate).tz(current_timeZone).format("DD-MM-YYYY")}</p>
                  <p className="m-zero"><LanguageIcon />{watch('timezone')?.value}</p>
                </div>
                {openAvailabilitySlots?.emailVisibility && <p className="text-center font-bold">Need to re-schedule? Please co-ordinate with the {openAvailabilityUserData?.userData?.fullname} at {openAvailabilitySlots?.data[0]?.user?.email}.</p>}
                {/* <div className="event-calendar">
                  <p>Add event to Calendar</p>
                  <ul>
                    <li>
                      <img src="/calendar.png" />
                      <span>Apple Calendar</span>
                    </li>
                    <li>
                      <img src="/google-meet.png" />
                      <span>Google Calendar</span>
                    </li>
                    <li>
                      <img src="/microsoft-event.png" />
                      <span>Outlook Calendar</span>
                    </li>
                  </ul>
                </div> */}
                
              </div>
              <div style={{textAlign: "center"}}>
              {!data?.isApplicationUser && <CustomButton label="Sign up for better experiences" onClick={() => navigate('/signup')} />}
              </div>
              
            </div>

          </div>
          :
          <>

            

            <div className="available-slots-main">
              {isMobile ? (
                <>
                  <div className="w-100">
                    <div className="sideleft-nav">
                      <div className="sidelogo d-flex">
                      <img src={(tagRelatedContent?.tagLogo && !tagRelatedContent?.isOrgDisabledTagLogo) ? `${SERVER_URL}/public/images/profilePictures/${tagRelatedContent?.tagLogo}` : "/logo.png"} height="52" width="75" />
                        <div>
                          <p className="font-bold mb-zero bk_slt_usr"> Book a slot with {openAvailabilityUserData?.userData?.fullname}</p>
                          {currentStep === 1 && (<p className="tag-text">{tagRelatedContent?.openAvailabilityText}</p>)}
                        </div>
                        

                      </div>
                      {currentStep === 2 && (<div className="profile-adnl-info color-white slt_time"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>)}
                      {currentStep === 3 && (<div className="profile-adnl-info color-white slt_time"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>)}
                      <div className="profile_dtls">
                        <Avatar src={`${SERVER_URL}/public/images/profilePictures/${openAvailabilityUserData?.userData?.profilePicture}`} sx={{ width: 100, height: 100 }} />
                        {/* <p className="user_name">{openAvailabilityUserData?.userData?.fullname}</p> */}
                      </div>

                      {currentStep === 1 && ( 
                        <>
                          <div className="d-flex justify-between">
                            <div className="profile-adnl-info cnfrnc_dtls color-white"> <VideocamIcon /> Web conferencing details provided upon confirmation</div>
                            <div className="tg_dtls">
                              <div className="available-slots-header">{tagRelatedContent?.tagName}</div>
                            </div> 
                          </div>
                        </>
                      )}
                    </div>
                    <div className="tme_zone">
                      {currentStep === 2 && ( 
                        <>
                          <div className="slctd_dt-1 d-flex justify-center items-center w-100 pt-20 mb-15">
                            <span className='back-to mr-15 cursur-pointer' onClick={goBack}><BackArrowIcon /></span>
                            <span className="font-20 font-bold">{formattedDate}</span>
                          </div>
                          <img className="mr-10" src='/time-zone.svg'/>
                          <span>{current_timeZone}</span>
                        </>
                      )}
                      {currentStep === 3 && ( 
                        <>
                          <div className="slctd_dt-1 d-flex justify-center items-center w-100 pt-20 mb-15">
                            <span className='back-to mr-15 cursur-pointer' onClick={goBack}><BackArrowIcon /></span>
                            <span className="font-20 font-bold">{formattedDateTime}</span>
                          </div>
                          <img className="mr-10" src='/time-zone.svg'/>
                          <span>{current_timeZone}</span>
                        </>
                      )}
                      {currentStep === 1 && (
                        <>
                          <div className="stp_1_tm-zn">
                            <img className="mr-10" src='/time-zone.svg'/>
                            <span>{current_timeZone}</span>
                            <div className="profile-adnl-info color-white slt_time"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>
                          </div>
                        </>
                      )}
                      
                      
                    </div>
                  </div> 

                </>
              ) : (
                <div className="sideleft-nav">
                  <div className="sidelogo">
                  <img src={(tagRelatedContent?.tagLogo && !tagRelatedContent?.isOrgDisabledTagLogo) ? `${SERVER_URL}/public/images/profilePictures/${tagRelatedContent?.tagLogo}` : "/logo.png"} height="52" width="75" />
                    <p> Book a slot with {openAvailabilityUserData?.userData?.fullname}</p>
                  </div>
                  <div className="available-slots-header">{tagRelatedContent?.tagName}</div>
                  <p className="tag-text">{tagRelatedContent?.openAvailabilityText}</p>
                  <div className="profile_dtls">
                    <Avatar src={`${SERVER_URL}/public/images/profilePictures/${openAvailabilityUserData?.userData?.profilePicture}`} sx={{ width: 100, height: 100 }} />
                    <p className="user_name">{openAvailabilityUserData?.userData?.fullname}</p>
                  </div>


                  <div className="profile-adnl-info color-white"> <AccessTimeIcon /> {openAvailabilitySlots?.eventDuration} mins</div>
                  <div className="profile-adnl-info color-white"> <VideocamIcon /> Web conferencing details provided upon confirmation</div>
                </div>
              )}
              

              {isMobile ? (
                <>
                  {currentStep === 1 && (
 
                    <>
                      <div className="slots-container2 d-flex flex-row">
                        <p className="text-center font-18 font-bold w-100">Select a Date</p>
                        <CustomDateCalendar
                          value={selectedDate}
                          disablePast={true}
                          shouldDisableDate={(date: Date) => !isDateAvailable(date)}
                          onChange={handleDateChange}
                          onMonthChange={handleMonthChange}
                        />
                      </div>                    
                    </>
                  )}

                  {currentStep === 2 && selectedDate && (
                    <div className="slots-container3 d-flex flex-row">
                      <p className="text-center font-18 font-bold">Select a Time</p>
                      
                      <div className="time-slot">{renderTimeslots()}</div>
                      <div className="pagination">
                        {/* Pagination for timeslots */}
                        <button
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <ArrowBackIosNewIcon />
                        </button>
                        <button
                          disabled={currentPage === pageSize || pageSize === 0}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <ArrowForwardIosIcon />
                        </button>
                      </div>
                      <span>Page {currentPage} of {pageSize}</span>
                    </div>
                  )}
                {
                  slotId ?
                  <>
                  <h3>Rescheduling Reason</h3> Text {rescheduleReason?.length || 0}/200 Characters
                  <textarea maxLength={200} style={{width: '100%', height: '100px'}} onChange={(e) => setRescheduleReason(e.target.value)} value={rescheduleReason} />
                  <CustomButton label="Book" sx={{margin: 'auto'}} onClick={handleReschedule}/>
                  </>
                  :
                  <>
                  {currentStep === 3 && selectedTimeslot && (
                    <div className="login-form-outer-div">
                        
                      <div className="login-form-inner-div guest-form-slot">
                      <form onSubmit={handleSubmit(handleSendEvent)} onKeyDown={handleKeyDown}>
                      <div className="frm-left">
                        <div className="form-col-2">
                          <label className="input-label">Name {`${nameCount?.length || 0}/100`} Characters</label>
                          <Controller
                            name="name"
                            control={control}
                            rules={{ 
                              required: "This field is required",
                              validate: (value) => value.trim() !== "" || "This field is required", 
                            }}
                            render={({ field: { onChange,value } }) => (
                              <CustomTextField
                                label=""
                                size="small"
                                fullWidth
                                className="w-100"
                                onChange={onChange}
                                error={!!errors?.name}
                                helperText={errors?.name?.message}
                                inputProps={{ maxLength: 100 }}
                                onInput={(e: any) => setNameCount(e.target.value)}
                                value={value}
                              />
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                          <label className="input-label">Meeting Purpose {`${titleCount?.length || 0}/30`} Characters</label> 
                          <Controller
                            name="purpose"
                            control={control}
                            rules={{ 
                              required: "This field is required",
                              validate: (value) => value.trim() !== "" || "This field is required", 
                            }}
                            render={({ field: { onChange, value } }) => (
                              <CustomTextField
                                label=""
                                size="small"
                                fullWidth
                                className="w-100"
                                onChange={onChange}
                                error={!!errors?.purpose}
                                helperText={errors?.purpose?.message}
                                inputProps={{ maxLength: 30 }}
                                onInput={(e: any) => setTitleCount(e.target.value)}
                                value={value}
                              />
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                          <label className="input-label">Email</label> 
                          <Controller
                            name="email"
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
                                label=""
                                size="small"
                                fullWidth
                                className="w-100"
                                onChange={onChange}
                                error={!!errors?.email}
                                helperText={errors?.email?.message}
                                value={value}
                              />
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                        <label className="input-label">Mobile Number</label> 
                          <Controller
                            name="phone"
                            control={control}
                            rules={{ 
                              required: "This field is required", 
                              validate: value => value.length > dialCode.length || 'This field is required',
                              minLength: {
                                value: dialCode.length + 6,
                                message: 'Please enter a valid phone number'
                              },
                            }}
                            render={({ field: { onChange, value } }) => (
                            <div>
                            <PhoneInput
                              country={'us'}
                              countryCodeEditable={false}
                              // onChange={onChange}
                              onChange={(phone,data: any) => {
                                onChange(phone)
                                setDialCode(data.dialCode)
                              }}
                              value={value}
                              enableSearch
                              inputStyle={{
                                width: '100%',
                                borderColor: errors?.phone ? 'red' : undefined,
                              }}
                              containerStyle={{ marginBottom: 16 }} 
                              />
                              {errors?.phone && (
                                <div style={{ color: 'red', marginTop: 2 }}>
                                  {errors.phone.message}
                                </div>
                              )}
                              </div>
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                        <Controller
                            name="timezone"
                            control={control}
                            render={({ field: { onChange, value} }) => (
                              <CustomAutocomplete
                                options={timezones?.data || []}
                                disableClearable
                                getOptionLabel={(option) => option.timezone || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                label="Timezones"
                                size="small"
                                value={value}
                                onChange={(_, v) => onChange(v)}
                                className="w-100"
                              />
                            )}
                            />
                          </div>
                      </div>
                      { showAddGuestField && <div className="frm-right">
                        <Controller
                          name="guests"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                              label='Attendees'
                              options={[]}
                              onChange={(_, val) => {
                                const filteredValue = val.filter((v:any) => v.trim() !== '');
                                onChange(filteredValue);
                              }}
                              multiple
                              freeSolo
                              value={value || []}
                            />
                          )}
                        />
                      </div>
                    }
                      <div className="form-act">
                        <CustomButton type="submit" label="Continue" sx={{ marginBottom: 2, width: 200 }} />
                        {/* <CustomButton type="button" label="Continue" sx={{ marginBottom: 2, width: 200 }} /> */}
                      </div>
                    </form>
                      </div>
                    </div>
                  )}
                  </>
                }
                </>
              ) : (
                <div className="available-slots-container sideright-main">
                <div className="top-head">
                  <div className="date_lbl align-center font-bold">Select Date and Time</div>
                  <p className="timezone-select">Timezone: {current_timeZone}</p>
                </div>
                <div className="slot-availability-container-2 w-100 d-flex">
                  <div className="slots-container2">
                    <CustomDateCalendar
                      value={selectedDate}
                      disablePast={true}
                      shouldDisableDate={(date: Date) => !isDateAvailable(date)}
                      onChange={handleDateChange}
                      onMonthChange={handleMonthChange}
                    />
                  </div>
                  <div className="slots-container3">
                    {selectedDate ? (
                      <>
                        <div className="time-slot">
                          {renderTimeslots()}
                        </div>
                        <div className="pagination">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            <ArrowBackIosNewIcon />
                          </button>
                          <button
                            disabled={currentPage === pageSize || pageSize === 0}
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            <ArrowForwardIosIcon />
                          </button>
                        </div>
                        <span>Page {currentPage} of {pageSize}</span>
                      </>
                    ) : null}
                  </div>

                </div>
                
                {slotId ? 
                <>
                <div style={{marginLeft: 40}}><b>Rescheduling Reason</b> &nbsp;&nbsp; (Text {rescheduleReason?.length || 0}/200 Characters)</div>
                <textarea maxLength={200} style={{width: '100%', height: '100px', marginLeft: 40,marginRight: 40}} onChange={(e) => setRescheduleReason(e.target.value)} value={rescheduleReason} />
                <CustomButton label="Book" sx={{margin: 'auto'}} onClick={handleReschedule}/>
                </>
                :
                <div className="login-form-outer-div">
                  <div className="login-form-inner-div guest-form-slot">
                    <form onSubmit={handleSubmit(handleSendEvent)} onKeyDown={handleKeyDown}>
                      <div className="frm-left">
                        <div className="form-col-2">
                          <label className="input-label">Name {`${nameCount?.length || 0}/100`} Characters</label>
                          <Controller
                            name="name"
                            control={control}
                            rules={{ 
                              required: "This field is required",
                              validate: (value) => value.trim() !== "" || "This field is required", 
                            }}
                            render={({ field: { onChange,value } }) => (
                              <CustomTextField
                                label=""
                                size="small"
                                fullWidth
                                className="w-100"
                                onChange={onChange}
                                error={!!errors?.name}
                                helperText={errors?.name?.message}
                                inputProps={{ maxLength: 100 }}
                                onInput={(e: any) => setNameCount(e.target.value)}
                                value={value}
                              />
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                          <label className="input-label">Meeting Purpose {`${titleCount?.length || 0}/30`} Characters</label> 
                          <Controller
                            name="purpose"
                            control={control}
                            rules={{ 
                              required: "This field is required",
                              validate: (value) => value.trim() !== "" || "This field is required", 
                            }}
                            render={({ field: { onChange, value } }) => (
                              <CustomTextField
                                label=""
                                size="small"
                                fullWidth
                                className="w-100"
                                onChange={onChange}
                                error={!!errors?.purpose}
                                helperText={errors?.purpose?.message}
                                inputProps={{ maxLength: 30 }}
                                onInput={(e: any) => setTitleCount(e.target.value)}
                                value={value}
                              />
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                          <label className="input-label">Email</label> 
                          <Controller
                            name="email"
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
                                label=""
                                size="small"
                                fullWidth
                                className="w-100"
                                onChange={onChange}
                                error={!!errors?.email}
                                helperText={errors?.email?.message}
                                value={value}
                              />
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                        <label className="input-label">Mobile Number</label> 
                          <Controller
                            name="phone"
                            control={control}
                            rules={{ 
                              required: "This field is required", 
                              validate: value => value.length > dialCode.length || 'This field is required',
                              minLength: {
                                value: dialCode.length + 6,
                                message: 'Please enter a valid phone number'
                              },
                            }}
                            render={({ field: { onChange, value } }) => (
                            <div>
                            <PhoneInput
                              country={'us'}
                              countryCodeEditable={false}
                              // onChange={onChange}
                              onChange={(phone,data: any) => {
                                onChange(phone)
                                setDialCode(data.dialCode)
                              }}
                              value={value}
                              enableSearch
                              inputStyle={{
                                width: '100%',
                                borderColor: errors?.phone ? 'red' : undefined,
                              }}
                              containerStyle={{ marginBottom: 16 }} 
                              />
                              {errors?.phone && (
                                <div style={{ color: 'red', marginTop: 2 }}>
                                  {errors.phone.message}
                                </div>
                              )}
                              </div>
                            )}
                          />
                        </div>
                        <div className="form-col-2">
                        <Controller
                            name="timezone"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <CustomAutocomplete
                                options={timezones?.data || []}
                                disableClearable
                                getOptionLabel={(option) => option.timezone || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                label="Timezones"
                                size="small"
                                value={value}
                                onChange={(_, v) => onChange(v)}
                                className="w-100"
                              />
                            )}
                            />
                          </div>
                      </div>
                      { showAddGuestField && <div className="frm-right">
                        <Controller
                          name="guests"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                              label='Attendees'
                              options={[]}
                              onChange={(_, val) => {
                                const filteredValue = val.filter((v:any) => v.trim() !== '');
                                onChange(filteredValue);
                              }}
                              multiple
                              freeSolo
                              value={value || []}
                            />
                          )}
                        />
                      </div>
                    }
                      <div className="form-act">
                        <CustomButton type="submit" label="Continue" sx={{ marginBottom: 2, width: 200 }} />
                        {/* <CustomButton type="button" label="Continue" sx={{ marginBottom: 2, width: 200 }} /> */}
                      </div>
                    </form>
                  </div>
                </div>
                }
              </div>
              )}
              
            </div>

          </>
      }
    </div>
  );
};

export default AvailableSlots;
