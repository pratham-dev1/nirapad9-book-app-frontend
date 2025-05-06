import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackArrowIcon from '../styles/icons/BackArrowIcon'
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CustomDateCalendar from '../components/CustomDateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import { EditOutlined } from '@mui/icons-material';
import { useMutation, useQuery } from 'react-query';
import request from '../services/http';
import { DELETE_BOOKED_OPEN_AVAILABILITY, DELETE_OPEN_AVAILABILITY, GET_OPEN_AVAILABILITY_BY_TAG_ID, GET_OPEN_AVAILABILITY_TAG, UPDATE_BOOKED_OPEN_SLOT, UPDATE_OPEN_SLOT } from '../constants/Urls';
import { AuthContext } from '../context/auth/AuthContext';
import Loader from '../components/Loader';
import CustomButton from '../components/CustomButton';
import { queryClient } from '../config/RQconfig';
import showToast from '../utils/toast';
import { ToastActionTypes } from '../utils/Enums';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import EditAvailabilityRespondInvite from './talentpartner/EditAvailabilityRespondInvite';
import EditAvailability from './talentpartner/EditAvailability';
import WarningIcon from '../styles/icons/WarningIcon';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const AllOpenAvailabilities = () => {
  const navigate = useNavigate()
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const [value, setValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);
  const [selectedTag, setSelectedTag] = useState<any>()
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [formattedDate,setFormattedDate] = useState<any>()
  const [deleteIds, setDeleteIds] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>({})
  const [deleteDialogState, setDeleteDialogState] = useState<boolean>(false);
  const [singleDeleteState, setSingleDeleteState] = useState<{ id: number; booked: boolean }>()
  const [page, setPage] = useState(0)
  const [slotsByPage, setSlotsByPage] = useState<any[]>([])

  const { data: openAvailabilityTag, isSuccess, isLoading } = useQuery('tag-list', () => request(GET_OPEN_AVAILABILITY_TAG), {
    onSuccess: (data) => {
      setSelectedTag(data?.data[0])
    }
  });
  const TAGS = openAvailabilityTag?.data?.filter((option: any) => option.isDeleted === null)

  const { data: Slots, isLoading: isLoading2, refetch } = useQuery(['slots-by-tagId', selectedTag?.id, selectedMonth], () => request(GET_OPEN_AVAILABILITY_BY_TAG_ID, "get",
    { tagId: selectedTag.id, startDate: selectedMonth ? dayjs(selectedMonth).tz(default_timeZone).toISOString() : null, endDate: selectedMonth ? dayjs(selectedMonth).endOf('month').tz(default_timeZone).toISOString() : null }
  ),
    {
      enabled: isSuccess && !!selectedTag
    });

  useEffect(() => {
    if (Slots?.data && Slots.data.length > 0) {
      let earliestDate;
      if (availableSlots.length > 0) {
        // The date should be selected as same after deleting any unbooked slot - so we need to check if availableSlots has some data then we need to get earliest date from there because in AvailableSlot array will only have all the slots for that same selected date so it will return same date otherwise if we check from whole slots.data then it will give first available earliest date for the month and it will change the date in calendar
        earliestDate = availableSlots[0]
      }
      else {
        earliestDate = Slots.data.reduce((earliest: any, current: any) => {
          return dayjs(current.datetime).tz(default_timeZone).isBefore(dayjs(earliest.datetime).tz(default_timeZone)) ? current : earliest;
        });
      }
      const earliestDateAsDate = dayjs(earliestDate.datetime).tz(default_timeZone);
      setSelectedDate(earliestDateAsDate);
      filterAvailableTimeslots(earliestDateAsDate)
      setFormattedDate(earliestDateAsDate.format("dddd, MMMM D, YYYY"))
    }
    else {
      setAvailableSlots([])
    }
  }, [Slots?.data])

  const totalItems = availableSlots.length || 0
  const limit = 20
  const totalPages = Math.ceil(totalItems/limit)
  const startIndex = page * limit
  const endIndex = startIndex + limit

  useEffect(() => {
    setSlotsByPage(availableSlots?.slice(startIndex, endIndex))
  },[availableSlots, page])

  const { mutate:deleteOpenAvailability} = useMutation((body: object) => request(DELETE_OPEN_AVAILABILITY, "delete", body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('slots-by-tagId');
        showToast(ToastActionTypes.SUCCESS, data.message)
        setDeleteIds([])
      },
    })
  
  const { mutate:deleteBookedOpenAvailability} = useMutation((body: object) => request(DELETE_BOOKED_OPEN_AVAILABILITY, "delete", body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('slots-by-tagId');
        showToast(ToastActionTypes.SUCCESS, data.message)
        setOpenDialog(false)
      },
    })

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setSelectedTag(TAGS[newValue])       // finding by index
    setSelectedDate(null)
    setSelectedMonth(null)
    setAvailableSlots([])
    setFormattedDate(null)
    setDeleteIds([])
    setPage(0)
  };

  const filterAvailableTimeslots = (date: Dayjs) => {
    const selectedDateFormatted = dayjs(date).tz(default_timeZone).format("DD-MM-YYYY");
    const availableTimeslotsForDate = Slots?.data?.filter((item: any) => {
      const itemDateFormatted = dayjs(item.datetime).tz(default_timeZone).format("DD-MM-YYYY");
      return itemDateFormatted === selectedDateFormatted;
    });
    setAvailableSlots(availableTimeslotsForDate || []);

  };

  const handleDateChange = (date: Dayjs) => {
    setSelectedDate(date);
    filterAvailableTimeslots(date)
    setFormattedDate(dayjs(date).tz(default_timeZone).format("dddd, MMMM D, YYYY"))
    setPage(0)
    setDeleteIds([])
  };


  const handleMonthChange = (month: Dayjs) => {
    setSelectedMonth(month)
    setPage(0)
    setDeleteIds([])
    setAvailableSlots([])
  };

  const availableDatesSet = useMemo(() => {
    return new Set(
      Slots?.data?.map((item: any) =>
        dayjs(item.datetime).tz(default_timeZone).format("DD-MM-YYYY")
      ) || []
    );
  }, [Slots?.data]);


  const isDateAvailable = (date: Dayjs) => {
    const dateFormatted = dayjs(date).tz(default_timeZone).format("DD-MM-YYYY");
    return availableDatesSet.has(dateFormatted);
  };

  const handleClickSlot = (item: any) => {
    if(!item.booked) {
      setAvailableSlots(prev => prev.map((i: any) => item.id === i.id ? {...i, selected: !i.selected} : i ))
      setDeleteIds(prev => item.selected ? prev.filter((ids: any) => ids !== item.id) : [...prev, item.id])
    }
  }

  const handleConfirmDelete = () => {
    deleteBookedOpenAvailability({ id: singleDeleteState?.id });
    setDeleteDialogState(false)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="page-wrapper top_algn-clr-mode">
      <div className="d-flex  mb-20">
        <h1 className="mt-0 mb-zero">
          <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/dashboard?tab=2&view=0')} ><BackArrowIcon /></span>
          Slot Broadcast
        </h1>
      </div>
      <Box sx={{ width: '100%', bgcolor: '#e0e0eb' }}>
        <Tabs value={value} onChange={handleChange} centered>
          {TAGS?.map((item: any) => {
            return <Tab label={<span>{item.tagName} <br /> <small>{item.eventDuration + ' Mins'}</small></span>} sx={{ textTransform: "none", minWidth: "250px" }} />
          })}
        </Tabs>
      </Box>
      <div style={{ display: 'flex', margin: 50}}>
        <div className="slots-container2" style={{marginRight: 100 }}>
          <CustomDateCalendar
            value={selectedDate}
            disablePast={true}
            shouldDisableDate={(date: Dayjs) => !isDateAvailable(date)}
            onChange={handleDateChange}
            onMonthChange={handleMonthChange}
          />
        </div>
        <div>
        {availableSlots.length > 0 && <div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div><b>{formattedDate}</b></div>
          <div style={{ marginRight: 80, display: "flex", alignItems: "center", gap: "15px" }}>
          <Button onClick={() => deleteOpenAvailability({ids: deleteIds})} disabled={deleteIds.length === 0} style={{padding: '4px 20px'}}>Delete</Button>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#ff8080", display: "inline-block" }}></div> 
              Delete
            </span> 
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#9fff80", display: "inline-block" }}></div> 
              Booked
            </span> 
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#EBECF0", display: "inline-block" }}></div> 
              Available
            </span>
          </div>

          </div>
        </div>}
        <div style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop:20,
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)", // Ensures 4 columns
          gap: "15px",
          maxWidth: "900px", // Increased to fit 4 boxes
        }}>
          {slotsByPage?.map((item: any, index: number) => {
            return <><div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // Adjust spacing for icon
                backgroundColor: item.booked ? '#9fff80' : item.selected ? '#ff8080' : "#EBECF0",
                textAlign: "center",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                height: "50px",
                width: "140px", // Keep fixed width
                flexDirection: "row", // Place text & icon in one line
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: 600
              }}
              onClick={() => handleClickSlot(item)}
            >
              <span>
                {dayjs(item.datetime).tz(default_timeZone).format("h:mm A")} -{" "}
                {dayjs(item.endtime).tz(default_timeZone).format("h:mm A")}
              </span>
            </div>
            <EditOutlined sx={{ cursor: "pointer"}} onClick={() => {setSelectedSlot(item); setOpenDialog(true)}} />
            </>
          })
          }
        </div>
        {availableSlots.length > 0 &&  
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30}}>
          <div>
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: '#2283C1',
              color: "white",
              borderRadius: "50%",
              border: "none",
              // transition: "background-color 0.2s",
              opacity: page === 0 ? 0.3 : 5
            }} 
          >
            <ArrowBackIosNewIcon sx={{width: '15px'}} />
          </button> &nbsp;
          <button
            disabled={(page + 1) === totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: '#2283C1',
              color: "white",
              borderRadius: "50%",
              border: "none",
              opacity: (page + 1) === totalPages ? 0.3 : 5
              // transition: "background-color 0.2s",
            }}
          >
            <ArrowForwardIosIcon sx={{width: '15px'}} />
          </button>
          </div>
          <div>Page {page + 1} of {totalPages}</div>
        </div>}
        </div>
      </div>


      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="edit-event-popup"
      >
        <div className="popup-header">
          <h2>Edit Event</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
        {selectedSlot?.booked ? (
          <EditAvailabilityRespondInvite formData={{...selectedSlot, time: dayjs(selectedSlot.datetime).tz(default_timeZone).format("h:mm A"), title: selectedSlot?.tagData?.title}} URL={UPDATE_BOOKED_OPEN_SLOT} setOpenDialog={setOpenDialog} setDeleteDialogState={setDeleteDialogState} setSingleDeleteState={setSingleDeleteState} />
        ):(
          <EditAvailability formData={selectedSlot} URL={UPDATE_OPEN_SLOT} refetch={refetch} setOpenDialog={setOpenDialog} />
        )}
       </DialogContent>
      </Dialog>
      
      <Dialog
        open={deleteDialogState}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="confirm-popup"
      >
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Delete Record?</span></h2>
          <CloseIcon onClick={() => setDeleteDialogState(false)} />
        </div>
        <DialogContent>
          <h3 className="text-center">Are you sure you want to delete the selected slot(s)?</h3> 
        </DialogContent>
        <DialogActions>
        <CustomButton
            onClick={handleConfirmDelete}
            color="primary"
            className="primary_btns"
            label="Delete"
        />
          {/* <CustomButton onClick={() => handleConfirmDelete()} color="primary" label="Confirm" /> */}
          <CustomButton
              onClick={() => {
                setDeleteDialogState(false)
              }}
              color="secondary"
              className="secondary_btns"
              label="Cancel"
          />  
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AllOpenAvailabilities