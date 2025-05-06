import { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { GridColDef, GridPagination, GridPaginationModel, GridRenderCellParams, GridRowParams, GridRowSelectionModel, GridSortDirection, GridSortModel, GridToolbarContainer } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import request from "../../services/http";
import { CANCEL_EVENT_BY_RECRUITER, CHANGE_BOOKED_SLOT, GET_AVAILABLE_SLOTS, GET_RECRUITER_HISTORY, GET_SELECTED_USER_AVAILABLE_SLOTS, GET_TIMEZONES, UPDATE_SLOTS_BY_RECRUITER } from "../../constants/Urls";
import dayjs from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer } from "@mui/material";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomButton from "../../components/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
// import CustomTextField from "../../components/CustomTextField";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import TuneIcon from "@mui/icons-material/Tune";
import CustomDataGrid from "../../components/CustomDataGrid";
import moment from 'moment-timezone';
import OpenAvailabilityHistory from "../OpenAvailabilityHistory";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CustomTextField from "../../components/CustomTextField";
import { makeStyles } from "@mui/styles";
import Loader from "../../components/Loader";
import { AuthContext } from "../../context/auth/AuthContext";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import EventHubHistory from "../EventHubHistory";
import CustomCheckBox from "../../components/CustomCheckbox";


interface RecruiterData {
  id: number;
  user: { username: string };
  datetime: string;
  // booked: boolean;
  // bookedBy: string | null;
  skills: { skillName: string }[];
  availabilitySecondarySkills: { secondarySkillName: string }[];
  availabilitySkillsSearched: { skillName: string }[];
  availabilitySecondarySkillsSearched: { secondarySkillName: string }[];
  candidateId: number;
  interviewStatus: string;
}

interface TimeZoneProps {
  id:number;
  timezone: string;
  value: string;
  abbreviation: string;
}

interface ParamsProps {
  page: number;
  pageSize: number;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
  bookedFilter: boolean | 'cancelled' | 'cancelRequested' | null;
}
interface EventProps {
  startTime: string;
  endTime: string;
}

const useStyles = makeStyles({
  rowWithLineThrough: {
    textDecoration: 'line-through',
  },
  rowWithTpCancellationReason: {
    backgroundColor: 'orange',
  }
});

const InterviewStatus = [
  "Invite Sent",
  "Postponed By TP",
  "Postponed By Candidate",
  "Interrupted By Candidate",
  "Interrupted By TP",
  "TP Didn't Join",
  "Candidate Didn't Join",
  "Interview Completed",
];

const History: React.FC<{ value: number, index: number }> = ({ value, index })=> {
  const classes = useStyles();
  const queryClient = useQueryClient()
  const { state } = useContext(AuthContext);
 
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [historyView, setHistoryView] = useState({id:1 , name:'History'})
  const [params, setParams] = useState<ParamsProps>({
    page: 0,
    pageSize: 20,
    startDate: "",
    endDate: "",
    sortBy: "datetime",
    sortOrder: "desc",
    bookedFilter: true,
  });
  const [bookedFilter, setBookedFilter] = useState<any>()
  const [tpId, setTpId] = useState<any>()
  const [previousSlotId, setPreviousSlotId] = useState<any>()
  const [editSlot, setEditSlot] = useState<any>()
  const [editSlotError, setEditSlotError] = useState<boolean>(false)
  const [newDatetime, setNewDatetime] = useState('');
  const [openNewDateTimeDialog, setOpenNewDateTimeDialog] = useState<boolean>(false);
  const [existingEvents, setExistingEvents] = useState<EventProps[]>([]);
  const [openExistingSlotDialog, setOpenExistingSlotDialog] = useState<boolean>(false)
  const [cancelSlot, setCancelSlot] = useState(false);

  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZoneProps>({
    timezone: "America/Dallas",
    abbreviation: "CST",
    value: "America/Chicago",
    id: 1
  });
  // const [allTimeZones, setAllTimeZones] = useState<unknown[]>([])
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [openDialog2, setOpenDialog2] = useState<any>({ open: false, type: 'single' });
  const [formData, setFormData] = useState<any>()
  const [cancelReason, setCancelReason] = useState<string | null>(null)
  // useEffect(() => {
  //   const timeZones = moment.tz.names().map((timezone: string) => ({ timezone: timezone, offset: moment.tz(timezone).format('Z'), abbr: moment.tz(timezone).format('z') }))

  //   setAllTimeZones(timeZones)
  // }, [])
  
  const { data: singleUserAvailableSlotsData, refetch, isLoading: singleUserAvailableSlotsLoading } = useQuery(
    ["availableSlotsForEdit", tpId],
    () => request(GET_SELECTED_USER_AVAILABLE_SLOTS, 'get', { tpId }),
    {
      enabled: !!tpId,
      select: (data) => {
        return {
          ...data,
          data: data.data?.map((item:any) => ({
            ...item,
            showDateTime: dayjs(item.datetime).tz(default_timeZone).format("DD MMM YYYY hh:mm a"),
            // datetime: dayjs(item.datetime).tz(default_timeZone).format("YYYY-MM-DDTHH:mm:ssZ")
          })),
        };
      },
    }
  );

  const {mutate: cancelEvent, isLoading: isLoadingCancelEvent} = useMutation((body: object) => request(CANCEL_EVENT_BY_RECRUITER, 'post', body),{
    onSuccess: (data) => {
      queryClient.invalidateQueries("recruiter-history")
      showToast(ToastActionTypes.SUCCESS, data.message)
    }
  })

  const {mutate: changeBookedSlot, isLoading: isLoadingChangeBookedSlot} = useMutation((body: object) => request(CHANGE_BOOKED_SLOT, 'post', body),{
    onSuccess: (data) => {
      setOpenDialog(false)
      setOpenNewDateTimeDialog(false)
      setOpenExistingSlotDialog(false)
    
      // setEditSlot(null)
      // queryClient.invalidateQueries("recruiter-history")
      if (data && data.datetime) {
        // const localDatetime = dayjs(data.datetime).tz(current_timeZone).format('YYYY-MM-DD HH:mm:ss');
        setNewDatetime(data.datetime);
        setOpenNewDateTimeDialog(true)
      } else if (data && data.existingEvents) {
        setExistingEvents(data.existingEvents)
        setOpenExistingSlotDialog(true)
      } 
      else {
        showToast(ToastActionTypes.SUCCESS, data?.message)
        setPreviousSlotId(null)
        setEditSlot(null)
        setTpId(null)
        setCancelSlot(false)
        queryClient.invalidateQueries("recruiter-history")
      }
    }
    // onSuccess: (data) => {
    //   setOpenDialog(false)
    //   setEditSlot(null)
    //   queryClient.invalidateQueries("recruiter-history")
    // }
  })

  const columns: GridColDef[] = [
    { field: "action", headerName: "Actions", width: 150, sortable: false, 
      renderCell: (params: GridRenderCellParams) => {
      const handleEditClick = () => {
        setTpId(params.row.tpId)
        setPreviousSlotId(params.row)
        setOpenDialog(true);
        queryClient.invalidateQueries("availableSlotsForEdit")
        // refetch()
      };

      const handleCancelEvent = () => {
        setFormData(params.row);
        setOpenDialog2({open: true, type: 'single'});
      }

      const isPastSlot = dayjs() > dayjs(params.row.datetime)
        return (
        <>
        {(!isPastSlot && !params.row.isCancelled) && <>
          <EditOutlinedIcon onClick={handleEditClick} />
          <CancelOutlinedIcon onClick={handleCancelEvent} />
        </>
        }
      </>
      )
     }},
    // { field: "id", headerName: "S No.", width: 90, sortable: false, },
    { field: "interviewStatus", headerName: "Interview Status", width: 200, sortable: false, editable: true, type: 'singleSelect', valueOptions: InterviewStatus },
    { field: "tpUsername", headerName: "Talent Partner Id", width: 200, sortable: false, },
    { field: `date`, headerName: `Date_${default_timeZone_abbr}`, width: 200, valueGetter: (params) => dayjs(params.row.datetime).tz(default_timeZone).format("DD-MM-YYYY") },
    { field: `time`, headerName: `Time_${default_timeZone_abbr}`, width: 200, valueGetter: (params) => dayjs(params.row.datetime).tz(default_timeZone).format("h:mm A"), sortable: false, },
    { field: `selectedDate`, headerName: `Date_${selectedTimeZone.abbreviation}`, width: 200, valueGetter: (params) => dayjs(params.row.datetime).tz(selectedTimeZone.value).format("DD-MM-YYYY"), sortable: false, },
    { field: `selectedTime`, headerName: `Time_${selectedTimeZone.abbreviation}`, width: 200, valueGetter: (params) => dayjs(params.row.datetime).tz(selectedTimeZone.value).format("h:mm A"), sortable: false, },
    // { field: "booked", headerName: "Booked", width: 200, sortable: false, },
    // { field: "bookedBy", headerName: "Booked By", width: 200, sortable: false, },
    { field: "primarySkill", headerName: "Primary Skill", width: 200, sortable: false, },
    { field: "secondarySkill", headerName: "Secondary Skill", width: 200, sortable: false, },
    { field: "primarySkillsSearched", headerName: "Primary Skills Searched", width: 200, sortable: false, },
    { field: "secondarySkillSearched", headerName: "Secondary Skills Searched", width: 200, sortable: false, },
    { field: "candidateId", headerName: "Candidate Id", width: 200, sortable: false, },
    { field: "cancelReasonByRecruiter", headerName: "Cancel Reason for Recruiter", width: 200, sortable: false, },
    {
      field: "meetingLink",
      headerName: "Meeting Link",
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return (
          params.row.meetingLink && (
            <a target="_blank" href={params.row.meetingLink}>Join</a>
          )
        );
      }
    },
    { field: `tpCancellationReason`, headerName: `Cancel Reason for TP`, width: 300, sortable: false, },
  ];
  const{data:timezones}=useQuery("timezones",()=>request(GET_TIMEZONES),{
    enabled:(value === index)
  })

  const { data: initialData } = useQuery(
    ["recruiter-history", params], () =>
    request(GET_RECRUITER_HISTORY, 'get', params), {
    enabled:(value === index),
    select: (data) => {
      const historyData = data.data?.map((item: RecruiterData) => ({
        ...item,
        tpUsername: item.user?.username,
        date: dayjs(item.datetime).tz(default_timeZone).format("DD-MM-YYYY"),
        time: dayjs(item.datetime).tz(default_timeZone).format("h:mm A"),
        primarySkill: item.skills.map(skill => skill.skillName).join(", "),
        secondarySkill: item.availabilitySecondarySkills.map(skill => skill.secondarySkillName).join(", "),
        primarySkillsSearched: item.availabilitySkillsSearched.map(skill => skill.skillName).join(", "),
        secondarySkillSearched: item.availabilitySecondarySkillsSearched.map(skill => skill.secondarySkillName).join(", "),
      }));
      return {
        historyData: historyData,
        totalItems: data.totalItems,
      };
    }
  },
  );
  const handleApplyFilter = () => {
    let startDateValue: any = null;
    let endDateTimeValue: any = null;
    
    if(startDate){
      const datePart = dayjs(startDate).format('YYYY-MM-DD');
      startDateValue = dayjs.tz(datePart, default_timeZone);
    }
    if(endDate){
      const endDateTime= dayjs(endDate).add(23, 'hour').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      endDateTimeValue = dayjs.tz(endDateTime, default_timeZone)
    }

    setParams((prev) => ({
      ...prev, 
        startDate: startDateValue ? startDateValue.toISOString() : '',
        endDate: endDateTimeValue ? endDateTimeValue.toISOString() : '', 
       ...(bookedFilter?.id === 1 ? { bookedFilter: true } :
        bookedFilter?.id === 3 ? { bookedFilter: null } :
        bookedFilter?.id === 2 ? { bookedFilter: 'cancelled' } : 
        bookedFilter?.id === 4 ? { bookedFilter: 'cancelRequested' } : {}
      )
    }))
  };


  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    // setParams((prev) => ({ ...prev, ...newPaginationModel, page: 0 }))
    setRowSelectionModel([])
    setParams((prev) =>
      (prev.pageSize !== newPaginationModel.pageSize) ?
        { ...prev, ...newPaginationModel, page: 0, } :
        { ...prev, ...newPaginationModel, }
    );
  }

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setParams((prev) => ({ ...prev, sortOrder: newSortModel[0].sort as string }))
  }

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null)
    setBookedFilter({ id: 1, value: 'Booked' })
    setParams((prev) => ({ ...prev, startDate: "", endDate: "", bookedFilter: true }))
  };

  const handleStartDate = (value: Date) =>{
     setStartDate(value)
      setEndDate(null);
  }
  const handleEndDate = (value: Date) => setEndDate(value)

  const {mutate, isLoading} = useMutation((body: object) => request(UPDATE_SLOTS_BY_RECRUITER, 'put', body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('recruiter-history')
      showToast(ToastActionTypes.SUCCESS, data.message)
    }
  })

const onCancelEvent = () => {
  if (openDialog2.type === 'single') {
    setOpenDialog2({open:false, type: 'single' })
    cancelEvent({availabilityIds: [formData?.id], reason: cancelReason})
  }
  else if (openDialog2.type === 'multiple') {
    setOpenDialog2({open:false, type: 'multiple' })
    cancelEvent({availabilityIds: rowSelectionModel, reason: cancelReason})
  }
}

const handleEditSlotSave = () => {
  if(editSlot){
  // const utcDatetimeISO = dayjs(editSlot.datetime).tz(default_timeZone).utc().toISOString();
    changeBookedSlot({id: editSlot.id, datetime: editSlot.datetime, previousSlotId: previousSlotId?.id, cancelSlot: cancelSlot })
  }else{
    setEditSlotError(true)
  }
};
const handleConfirmation = () => {
  changeBookedSlot({id: editSlot.id, datetime: newDatetime, previousSlotId: previousSlotId?.id, cancelSlot: cancelSlot })
};

const handleBookingConfirmation = () => {
  changeBookedSlot({id: editSlot.id, datetime: newDatetime, previousSlotId: previousSlotId?.id, cancelSlot: cancelSlot })
};
  const CustomPagination = () => {
    const pageCount = Math.ceil(initialData?.totalItems / params.pageSize) || 1;
    return (
      <div style={{
        display: "flex", marginRight: 20, justifyContent: "center", alignItems: "center"
      }}>
        <GridPagination
          sx={{
            height: 60,
          }}
        />
        <div style={{ height: "60px", paddingTop: "15px", paddingLeft: "10px" }}>
          Page: {params.page + 1} of {pageCount}
        </div>
      </div>
    );
  }
  
  const CustomToolbar = () => {
    return (
      <div className="table_filter filter-toolbar" style={{backgroundColor:"#f1f2f6",height:60,display:"flex",alignItems:"center"}}>
        <>
          <CustomAutocomplete
            options={timezones?.data || []}
            disableClearable={true}
            getOptionLabel={(option) => option.timezone || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedTimeZone}
            onChange={(_, v) => setSelectedTimeZone(v)}
            label="Timezones"
            size="small"
            sx={{ width: 300 }}
          />
        </>
        <CustomAutocomplete
          label="History View"
          options={[{id:1 , name:'History'}, {id:2, name:'Open Availability History'}, {id:3, name:'Event Hub History'}]}
          getOptionLabel={(item) => item.name}
          value={historyView}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          onChange={(event, value) => {setHistoryView(value); setOpenDrawer(false)}}
          size="small"
          sx={{ width: 250, mx: 1 }}
          disableClearable={true}
        />
        <>
          <CustomButton
            label="More Filter"
            color="inherit"
            className="more-filter-btn"
            size="small"
            onClick={() => setOpenDrawer((prev) => !prev)}
            startIcon={<TuneIcon />}
            sx={{ mx: 2 }}
          />
          <CustomButton className="apply-btn" label="Apply" color="inherit" size="small" />
          {rowSelectionModel.length > 0 &&
            <CustomButton
              label={rowSelectionModel.length > 1 ? 'Cancel All Events' : 'Cancel Event'}
              onClick={() => setOpenDialog2({open: true, type: 'multiple'})}
            />
          }
        </>
        </div>
    );
  };

  const getRowClassName = (params: any) => {
    if (params.row?.isCancelled) {
      const isCancelledClass = params.row.isCancelled ? classes.rowWithLineThrough : '';
      return isCancelledClass;
    }
    const hasTpCancellationReasonClass = params.row.tpCancellationReason ? classes.rowWithTpCancellationReason : '';
    return hasTpCancellationReasonClass;
  };

  return (
    <>
    { historyView.name === 'History' ? 
    <>
      <div className="history-table-wrapper evnt_history_tbl">
      {CustomToolbar()}
      <CustomDataGrid
        rows={initialData?.historyData || []}
        columns={columns}
        checkboxSelection={true}
        disableRowSelectionOnClick={true}
        disableColumnMenu={true}
        isRowSelectable={(params: GridRowParams) => dayjs() < dayjs(params.row.datetime) && !params.row.isCancelled}
        slots={{ pagination: CustomPagination }}
        rowCount={initialData?.totalItems || 0}
        pageSizeOptions={[20, 50, 100]}
        paginationModel={{ page: params.page, pageSize: params.pageSize }}
        paginationMode="server"
        onPaginationModelChange={handlePaginationModelChange}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        sortingOrder={['desc', 'asc']}
        sortModel={[{ field: 'date', sort: params.sortOrder as GridSortDirection }]}
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        getRowClassName={getRowClassName}
        processRowUpdate={(newRow,oldRow) => {
          mutate({id: newRow.id, status: newRow?.interviewStatus})
          return newRow;
        }}
        onProcessRowUpdateError={(e:any) => showToast(ToastActionTypes.ERROR, "Error Generating from Datagrid")}
        
      />
      <Drawer
        anchor={"right"}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        className="right-slide-popup"
        variant="persistent"
      >
        <div className="popup-inner">
          <div className="d-flex align-center justify-between">
            <p className="font-20 font-bold">All Filters</p>
            <CloseIcon
              className="pointer"
              sx={{ float: "right", my: 2, mx: 2 }}
              onClick={() => setOpenDrawer(false)}
            />
          </div>

          <Box role="presentation">
            <div className="history-filter-panel">
              <CustomDatePicker
                value={startDate || null}
                label="Start Date"
                className="placeholder-label"
                onChange={handleStartDate}
                size="small"
                sx={{ width: 200, paddingRight: 2 }}
              />
              <CustomDatePicker
                value={endDate || null}
                label="End Date"
                className="placeholder-label"
                onChange={handleEndDate}
                size="small"
                sx={{ width: 200 }}
                disabled={!startDate}
                minDate={startDate}
              />
              <CustomAutocomplete
                  label="Booked Filter"
                  options={[
                    { id: 1, value: 'Booked' },
                    { id: 2, value: 'Cancelled' },
                    { id: 4, value: 'Cancel Request Raised' },
                    { id: 3, value: 'All' },
                  ]}
                  getOptionLabel={(item) => item.value}
                  value={bookedFilter || setBookedFilter({ id: 1, value: 'Booked' })}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  onChange={(event, value) => setBookedFilter(value)}
                  size="small"
                  sx={{ width: 200 }}
                  disableClearable={true}
                  />
              <div className="w-100" style={{ flexDirection: "column", marginTop: 20 }}>
                <CustomButton
                  label="Apply"
                  size="small"
                  className="primary_btns"
                  onClick={handleApplyFilter}
                />
                <CustomButton
                  label="Clear"
                  size="small"
                  variant="outlined"
                  className="secondary_btns"
                  sx={{ mx: 2 }}
                  onClick={clearDates}
                />
                
              </div>
            </div>
          </Box>
        </div>
        
      </Drawer>
      </div>
      </> : 
    <div className="history-table-wrapper">
    {historyView && historyView.id === 2 ? (
      <OpenAvailabilityHistory value={value} index={index} />
    ) : (
      <EventHubHistory value={value} index={index} />
    )}
  </div>
      }
      <Dialog
        open={openDialog2?.open}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="reason-popup"
        PaperProps={{
          sx: {
            height: "300px"
          }
        }}
      >
        <DialogContent>
            <p>Reason for Cancelation</p>
            <div>{`${cancelReason?.length || 0}/255`} Characters</div>
            <TextareaAutosize minRows={6} placeholder="Reason for Cancelation" maxLength={255} onChange={(e:any)=> setCancelReason(e.target.value)}/> <br />
            <CustomButton label="Save" className="primary_btns mr-25" onClick={onCancelEvent}/>
            <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDialog2({...openDialog2 , open: false})} />
        </DialogContent>
      </Dialog>
      {(isLoading || isLoadingCancelEvent) && <Loader />}
      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="edit-event-popup"
      >
        {(isLoadingChangeBookedSlot) && <Loader />}
        <div className="popup-header">
          <h2>Edit Booked Event</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
        <CustomAutocomplete
          label='Select Slot'
          options={singleUserAvailableSlotsData?.data}
          getOptionLabel={option => option.showDateTime}
          isOptionEqualToValue={(option, value) => option.id == value.id}
          onChange={(_, selectedValue) => {
            setEditSlotError(false)
            setEditSlot(selectedValue)
          }}
          value={(editSlot || null) as any}
          error={editSlotError}
          helperText={editSlotError ? 'This field is required' : ''}
          // disabled={!!formData}
          // getOptionDisabled={option => isOptionDisabled(option)}
          disableFilter={true}
        />
        {previousSlotId?.tpCancellationReason &&
         <CustomCheckBox
          label="Cancel Previous slot"
          onChange={(_: React.SyntheticEvent, value: boolean) => {
            setCancelSlot(value)   
          }}
          checked={cancelSlot}
        />}
        </DialogContent>
        <DialogActions>
          <CustomButton label="Save" onClick={handleEditSlotSave} disabled={isLoadingChangeBookedSlot}/>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openNewDateTimeDialog}
        onClose={() => setOpenNewDateTimeDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Slot Timings Changed</DialogTitle>
        <DialogContent>
          <p>Selected Slots timings were changed. Do you want to continue with new timing?</p>
          {newDatetime && <p>New Slot timining: {dayjs(newDatetime).tz(default_timeZone).format('YYYY-MM-DD HH:mm:ss')}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmation} disabled={isLoadingChangeBookedSlot} color="primary" autoFocus>
            Continue
          </Button>
          <Button onClick={() => setOpenNewDateTimeDialog(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openExistingSlotDialog}
        onClose={() => setOpenExistingSlotDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Event already Exists </DialogTitle>
        <DialogContent>
          <p>You already have an existing event at this Slot. Do you still wish to continue?</p>
          {existingEvents.map((item) => (
            <li key={`${item.startTime}`}>
              {`Start Time: ${dayjs(item.startTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')} - End Time: ${dayjs(item.endTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')}`}
            </li>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingConfirmation} disabled={isLoadingChangeBookedSlot} color="primary" autoFocus>
            Continue
          </Button>
          <Button onClick={() => setOpenExistingSlotDialog(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default History;
