import { useEffect, useState,useCallback, useContext } from "react";
import Box from "@mui/material/Box";
import { useMutation, useQuery,useQueryClient  } from "react-query";
import request from "../../services/http";
import { CANCEL_SLOT_REQUEST_OR_WITHDRAWN_BY_TP, GET_TALENT_PARTNER_HISTORY, GET_TIMEZONES, UPDATE_RECORD_TIME, UPDATE_SLOTS } from "../../constants/Urls";
import dayjs, { Dayjs } from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Drawer } from "@mui/material";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomButton from "../../components/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import CustomTextField from "../../components/CustomTextField";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import TuneIcon from "@mui/icons-material/Tune";
import CustomDataGrid from "../../components/CustomDataGrid";
import moment from 'moment-timezone';
import { DELETE_AVAILABILITY } from "../../constants/Urls";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { GridColDef, GridToolbarContainer,GridSortModel, GridRowSelectionModel,GridRenderCellParams,GridPaginationModel, GridRowParams, GridSortDirection, GridPagination, GridCloseIcon  } from "@mui/x-data-grid";
import EditAvailability from "./EditAvailability";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import OpenAvailabilityHistory from "../OpenAvailabilityHistory";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CustomTimePicker from "../../components/CustomTimePicker";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Loader from "../../components/Loader";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "../../context/auth/AuthContext";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import WarningIcon from "../../styles/icons/WarningIcon";
import EventHubHistory from "../EventHubHistory";

dayjs.extend(utc);
dayjs.extend(timezone);

interface TimeZoneProps {
  id:number;
  timezone: string;
  value: string;
  abbreviation: string;
}

interface FormInputProps {
  reason: string;
}

const useStyles = makeStyles({
  rowWithLineThrough: {
    textDecoration: 'line-through',
  }
});

const History : React.FC<{ value: number, index: number }> = ({ value, index }) => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const queryClient = useQueryClient();
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [startDateFilter,setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter,setEndDateFilter] = useState<Date | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZoneProps>({
    timezone: "America/Dallas",
    abbreviation: "CST",
    value: "America/Chicago",
    id: 1
  });
  // const [allTimeZones, setAllTimeZones] = useState<unknown[]>([])
  const [data, setData] = useState({data: [], totalCount : 0})
  const [bookedFilter,setBookedFilter] = useState<any>()
  const [openDialog,setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>();
  const [historyView, setHistoryView] = useState({id:1 , name:'History'})
  const [rowDataId, setRowDataId] = useState<any>();
  const [recordTimeData, setRecordTimeData] = useState<number>(30);
  const [recordCommentsData, setRecordCommentsData] = useState<string>();
  const [recordTimeDialog, setRecordTimeDialog] = useState<boolean>(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean, type: 'single' | 'multiple' }>({ open: false, type: 'single' });
  const [singleDeleteId, setSingleDeleteId] = useState<GridRowSelectionModel>([]);
  const [cancelDialog, setCancelDialog] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState('')
  const [isBookedOpenDialog,setIsBookedOpenDialog] = useState<boolean>(false);

  const classes = useStyles();
  
  const { mutate:deleteAvailability} = useMutation((body: object) => request(DELETE_AVAILABILITY, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('TP-history');
      showToast(ToastActionTypes.SUCCESS, data.message)
    },
  })
  const{data:timezones} = useQuery("timezones",() => request(GET_TIMEZONES),{
    enabled:(value === index)
  })
  const handleConfirmDelete = () => {
    deleteAvailability({ ids: rowSelectionModel });
    setDeleteDialogState({ open: false, type: 'multiple' });
  };
  const handleConfirmSingleDelete = () => {
    deleteAvailability({ ids: singleDeleteId });
    setDeleteDialogState({ open: false, type: 'single' });
  }

  // useEffect(()=>{
  // //  const timeZones = moment.tz.names().map((timezone:any) => moment.tz(timezone).format('z')).filter((item:string) => !item.includes('-') && !item.includes('+'))
  // const timeZones = moment.tz.names().map((timezone:string) =>({ timezone: timezone ,abbr: moment.tz(timezone).format('z'), offset: moment.tz(timezone).format('Z')}))
  // setAllTimeZones(timeZones) 
  // },[])

  const [params,setParams ]= useState({
    page: 0,
    pageSize: 20,
    startDateFilter: "",
    endDateFilter: "",
    sortingColumn: "datetime",
    sortingOrder: "desc"
  });

  const { data: historyData, isLoading,refetch } = useQuery( ['TP-history',params],() => 
  request(GET_TALENT_PARTNER_HISTORY,'get',params),{
    enabled:(value === index),
  });

  useEffect(()=>{
if(historyData?.data) {
 const DATA = historyData?.data?.map((item: any) => ({ 
          ...item,
          date: dayjs(item.datetime).tz(default_timeZone).format("DD-MM-YYYY"),
          time: dayjs(item.datetime).tz(default_timeZone).format("h:mm A"),
          [`date_${selectedTimeZone.abbreviation}`]: dayjs(item.datetime).tz(selectedTimeZone.value).format("DD-MM-YYYY"),
          [`time_${selectedTimeZone.abbreviation}`]: dayjs(item.datetime).tz(selectedTimeZone.value).format("h:mm A"),
          recordTime: item.recordTime ? dayjs().hour(item.recordTime / 60).minute(item.recordTime % 60).format('HH:mm') : null,
        }));
        setData({data: DATA, totalCount:historyData.totalCount})
}
  },[historyData, selectedTimeZone])

  const { mutate: mutateRecordData }: any = useMutation((body: object) => request(UPDATE_RECORD_TIME, "post", body), {
    onSuccess: (data: { message: string; }) => {
      showToast(ToastActionTypes.SUCCESS, data?.message);
      setRecordTimeData(30)
      setRecordCommentsData(undefined)
      refetch();
      setRecordTimeDialog(false)
    }
  });

  const { mutate: eventCancelRequestOrWithdrawnRequest, isLoading: isLoadingCancelEvent } = useMutation((body: object) => request(CANCEL_SLOT_REQUEST_OR_WITHDRAWN_BY_TP, 'post', body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries("TP-history")
      showToast(ToastActionTypes.SUCCESS, data.message)
      setCancelReason('')
    }
  })
  const { reset,control,unregister, register, handleSubmit: handleReasonSubmit, formState: { errors } } = useForm<FormInputProps>();

  useEffect(() => {
    unregister("reason");
    reset({ reason: formData?.tpCancellationReason });
 
    register("reason", {
      required: !formData?.tpCancellationReason
        ? "This field is required"
        : false,
    });
  }, [formData?.tpCancellationReason]);

  const handleSubmit = (bool: boolean) => {
    const body = {
      id: rowDataId,
      recordTime: recordTimeData,
      isRecordTimeSubmitted: bool === false ? null : true,
      recordTimeComments: recordCommentsData
    };
    mutateRecordData(body);
  };

  // const handleApplyFilter = () => {
  //     setParams((prev) => ({ ...prev, startDateFilter: startDateFilter ? dayjs(startDateFilter).toISOString() : '', endDateFilter: endDateFilter ? dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').toISOString() : '' }))
  // };
  const handleApplyFilter = () => {
    let startDateValue: any = null;
    let endDateTimeValue: any = null;
    
    if(startDateFilter){
      const datePart = dayjs(startDateFilter).format('YYYY-MM-DD');
      startDateValue = dayjs.tz(datePart, default_timeZone);
    }
    if(endDateFilter){
      const endDateTime= dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      endDateTimeValue = dayjs.tz(endDateTime, default_timeZone)
    }

    setParams((prev) => ({...prev,
      startDateFilter: startDateValue ? startDateValue.toISOString() : '',
      endDateFilter: endDateTimeValue ? endDateTimeValue.toISOString() : '' 
    }))    
  };
  const handlePagination = (pageInfo: GridPaginationModel) => {
    setRowSelectionModel([])
    setParams((prev)=> ({...prev,...pageInfo}))
  }

  const handleSortModelChange =(sortInfo: GridSortModel) => {
    setParams((prev)=>({...prev,sortingOrder: sortInfo[0].sort as string}))
  };

  const handleInputChange = () => {
    setParams(prev => ({ ...prev, ...(bookedFilter?.id === 1 ? { bookedFilter: true } : 
      bookedFilter?.id === 2 ? { bookedFilter: false } : 
      bookedFilter?.id === 3 ? { bookedFilter: null } : 
      bookedFilter?.id === 4 ? { bookedFilter: 'cancelled' } :
      bookedFilter?.id === 5 ? {bookedFilter: 'cancelRequested'} : {} 
  )}));
  };
  
  const onSubmit: SubmitHandler<FormInputProps> = (data) => {
    if(!(formData?.tpCancellationReason)){
      eventCancelRequestOrWithdrawnRequest({ id: formData?.id, reason: data?.reason })
      reset()
    }else{
      eventCancelRequestOrWithdrawnRequest({ id: formData?.id, reason: null})
    }
   
    setCancelDialog(false)
  }

  const getRowClassName = (params: any) => {
    if (params.row?.isCancelled) {
      const isCancelledClass = params.row.isCancelled ? classes.rowWithLineThrough : '';
      return isCancelledClass;
    }
  };


  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Actions",
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
  
        const handleEditClick = () => {
          setFormData(params.row);
          setOpenDialog(true);
        };
  
        const handleDeleteClick = () => {
          setDeleteDialogState({ open: true, type: 'single' });
          setSingleDeleteId([params.id]);
        };
        const handleRecordClick = () => {
          setRowDataId(params.id);
          const time = dayjs(params.row.recordTime, 'HH:mm');
          const totalMinutes = time.hour() * 60 + time.minute();
          setRecordTimeData(totalMinutes)
          setRecordTimeDialog(true);
          setRecordCommentsData(params.row.recordTimeComments)
        };
        const handleCancelEvent = () => { 
          setFormData(params.row);
          setCancelDialog(true);
        }

        const isPastSlot = dayjs() > dayjs(params.row.datetime)
        return (
          <>
            { (!isPastSlot && !params.row.booked) &&
              <>
                <EditOutlinedIcon onClick={handleEditClick} />
                <DeleteOutlineOutlinedIcon onClick={handleDeleteClick} />
              </>
            }
            {(isPastSlot && !params.row.isRecordTimeSubmitted && params.row.booked && !params.row.isCancelled) && <AccessTimeIcon onClick={handleRecordClick} />}
            {(!isPastSlot && params.row.booked && !params.row.isCancelled) && <CancelOutlinedIcon onClick={handleCancelEvent} />}
          </>
        )
       }
    },
    // { 
    //   field: "id", 
    //   headerName: "S No.", 
    //   width: 90,
    //   sortable: false,
    // },
    {
      field: `date`,
      headerName: `Date_${default_timeZone_abbr}`,
      width: 300,
    },
    {
      field: `time`,
      headerName: `Time_${default_timeZone_abbr}`,
      width: 300,
      sortable: false,
    },
    {
      field: `date_${selectedTimeZone.abbreviation}`,
      headerName: `Date_${selectedTimeZone.abbreviation}`,
      width: 300,
      sortable: false,
    },
    {
      field: `time_${selectedTimeZone.abbreviation}`,
      headerName: `Time_${selectedTimeZone.abbreviation}`,
      width: 300,
      sortable: false,
    },
    {
      field: "formLink",
      headerName: "Form Link",
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return <a target="_blank" href={params.row.formLink}>{params.row.formLink}</a>
      }
    },
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
    {
      field: `recordTime`,
      headerName: `Record Time(in Hours)`,
      width: 300,
      sortable: false,
    },
    {
      field: `recordTimeComments`,
      headerName: `Record Time Comments`,
      width: 300,
      sortable: false,
    },
    {
      field: `isRecordTimeSubmitted`,
      headerName: `Record Time Status`,
      width: 300,
      sortable: false,
    },
  ];

  const handleClearFilter = () => {
    setStartDateFilter(null);
    setEndDateFilter(null)
    setParams((prev) => ({ ...prev, startDateFilter: "", endDateFilter: "" }))
  };

  const CustomToolbar = () => {
    const handleDeleteAll = () => {
      // deleteAvailability({ ids: rowSelectionModel });
      setDeleteDialogState({ open: true, type: 'multiple' })
    };
    return (
      <div className="table_filter filter-toolbar" style={{backgroundColor:"#f1f2f6",height:60,display:"flex",alignItems:"center"}}>
      <>
        <CustomAutocomplete 
        options={timezones?.data || []}
        disableClearable={true}
        getOptionLabel={(option) => option.timezone || ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={selectedTimeZone } 
        onChange={(_,v) => setSelectedTimeZone(v)} 
        label="Timezones" 
        size="small" 
        sx={{width: 300}} 
        />
      </>
      <>
        <CustomAutocomplete
          label="Booked Filter"
          options={[
            { id: 1, value: 'Booked'},
            { id: 2, value: 'Not Booked'},
            { id: 4, value: 'Cancelled' },
            { id:5, value: 'Cancel Request Raised' },
            {id: 3, value: 'All'},
          ]}
          getOptionLabel={(item) => item.value}
          value={bookedFilter || { id: 3, value: 'All' }}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          onChange={(event, value) => setBookedFilter(value)}
          size="small"
          sx={{ width: 150, mx: 1 }}
          disableClearable={true}

        />
        <CustomAutocomplete
          label="History View"
          options={[{id:1 , name:'History'}, {id:2, name:'Open Availability History'}, {id:3, name:'Event Hub History'}]}
          getOptionLabel={(item) => item.name}
          value={historyView}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          onChange={(event, value) => {setOpenDrawer(false); setHistoryView(value)}}
          size="small"
          sx={{ width: 250, mx: 1 }}
          disableClearable={true}
        />
        <CustomButton
          label="More Filter"
          color="inherit"
          className="more-filter-btn"
          size="small"
          onClick={() => setOpenDrawer((prev) => !prev)}
          startIcon={<TuneIcon />}
          sx={{ mx: 2 }}
        />
        <CustomButton className="apply-btn" label="Apply" onClick={handleInputChange} color="inherit" size="small" />
        {rowSelectionModel.length > 0 && (
            <CustomButton
              label={`${rowSelectionModel.length > 1 ? "Delete All" : "Delete"}`}
              size="small"
              className="delete-btn"
              onClick={handleDeleteAll}
              sx={{ mx: 2 }}
            />
          )}
      </>
    </div>
    );
  };

  const CustomPagination = () => {
    const pageCount = Math.ceil(data?.totalCount / params.pageSize) || 1;
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

  return (
    <>
    { historyView.name === 'History' ? 
    <>
      <div className="history-table-wrapper evnt_history_tbl">
      {CustomToolbar()}
      <CustomDataGrid
        rows={data?.data || []}
        pagination
        columns={columns}
        checkboxSelection={true}
        disableRowSelectionOnClick={true}
        isRowSelectable={(params: GridRowParams) => dayjs() < dayjs(params.row.datetime) && !params.row.booked}
        disableColumnMenu={true}
        rowCount={data?.totalCount || 0}
        paginationModel={{page: params.page, pageSize: params.pageSize}}
        paginationMode="server"
        pageSizeOptions={[20,50,100]} 
        loading={isLoading}
        getRowClassName={getRowClassName as any}
        onPaginationModelChange={handlePagination}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        sortModel={[{ field: `date`, sort: params.sortingOrder as GridSortDirection }]}
        sortingOrder={['desc', 'asc']}
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        slots={{pagination: CustomPagination}}
      />
      <Drawer
        anchor={"right"}
        open={openDrawer}
        className="right-slide-popup"
        onClose={() => setOpenDrawer(false)}
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
                label="Start Date"
                className="placeholder-label"
                value={startDateFilter || null}
                size="small"
                sx={{ width: 200, paddingRight: 2 }}
                onChange={(value: Date) => {
                  setStartDateFilter(value)
                    setEndDateFilter(null);
                }
                }
              />
              <CustomDatePicker
                label="End Date"
                className="placeholder-label"
                value={endDateFilter || null}
                size="small"
                sx={{ width: 200 }}
                onChange={(value: Date) =>
                  setEndDateFilter(value)} 
                disabled={!startDateFilter}
                minDate={startDateFilter}
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
                  variant="outlined"
                  className="secondary_btns"
                  onClick={handleClearFilter}
                  sx={{ mx: 2 }}
                />
                
              </div>
            </div>
          </Box>
        </div>
      </Drawer>
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
          <EditAvailability formData={formData} URL={UPDATE_SLOTS} refetch={refetch} setOpenDialog={setOpenDialog} setIsBookedOpenDialog={setIsBookedOpenDialog} />
        </DialogContent>
      </Dialog>
          <Dialog
            open={deleteDialogState.open}
            // onClose={() => setOpenDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            className="confirm-popup"
          >
            <div className="popup-header">
              <h2><WarningIcon /> <span className="pl-10">Delete Record?</span></h2>
              <CloseIcon onClick={() => {setDeleteDialogState({ open: false, type: 'single' })}} />
            </div>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <h3 className="text-center">Are you sure you want to delete thee selected slot(s)?</h3>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <CustomButton
                onClick={() => {
                  if (deleteDialogState.type === 'single') {
                    handleConfirmSingleDelete();
                  } else {
                    handleConfirmDelete();
                  }
                }}
                color="primary"
                className="primary_btns"
                label="Confirm"
              />
              <CustomButton
                onClick={() => {
                  setDeleteDialogState({ open: false, type: 'single' })
                }}
                color="secondary"
                className="secondary_btns"
                label="Cancel"
              />
            </DialogActions>
          </Dialog>
      <Dialog
            open={recordTimeDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <div className="popup-header">
                <h2>Record Details</h2>
                <CloseIcon onClick={() => setRecordTimeDialog(false)} />
            </div>
            <DialogContent>
              <div className="d-flex flex-column justify-center items-center">
                <div className="w-66 mb-20">
                  <CustomTimePicker
                    label="Record Time (in hours)"
                    size="small"
                    ampm={false}
                    timeSteps={{ minutes: 1 }}
                    className="avail-date-filter"
                    style={{ width: 200, marginRight: 15 }}
                    value={recordTimeData ? dayjs().hour(recordTimeData / 60).minute(recordTimeData % 60) : undefined}
                    onChange={(newValue: Dayjs) => {
                      const time = dayjs(newValue, 'hh:mm A');
                      const totalMinutes = time.hour() * 60 + time.minute();
                      setRecordTimeData(totalMinutes);
                    }}
                  />
                </div>
                <div className="w-66 mb-15">
                  <label className="form-label">Record Comments</label> 
                  <TextareaAutosize
                    minRows={6}
                    maxLength={255}
                    placeholder="Record Comments"
                    value={recordCommentsData}
                    onChange={(e) => {
                      setRecordCommentsData(e.target.value);
                    }} />
                </div>

                <div className="w-66 d-flex justify-center items-center">
                  <Button className="primary_btns mr-25" onClick={() => handleSubmit(true)}>
                    Submit
                  </Button>
                  <Button className="cancel-btn mr-25" onClick={() => setRecordTimeDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="primary_btns" onClick={() => handleSubmit(false)}>
                    Save
                  </Button>
                </div>
              </div> 

            </DialogContent>
          </Dialog>

          <Dialog
            open={cancelDialog}
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
            <div className="popup-header">
              <h2>Raise Cancellation Request.</h2>
              <CloseIcon onClick={() =>setCancelDialog(false)} />
            </div>
            <DialogContent>
              <form onSubmit={handleReasonSubmit(onSubmit)}>
              <label className="form-label">Reason {`${cancelReason?.length|| formData?.tpCancellationReason?.length  || 0}/255`} Characters</label>
              <Controller
                name="reason"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    label=""
                    onChange={(e) => {
                      onChange(e);
                      setCancelReason(e.target.value);
                    }}
                    value={value || ""}
                    disabled={formData?.tpCancellationReason ? true : false}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                    inputProps={{ maxLength: 255 }}
               />
              )}
              />
              <div className="d-flex items-center justify-center">
                <CustomButton
                  type="submit"
                  className="primary_btns mr-25"
                  label={!(formData?.tpCancellationReason) ? "Save": "Withdraw Cancel Request" }
                />
                <CustomButton label="Cancel" className="secondary_btns" onClick={() =>setCancelDialog(false)} />
              </div>
              </form>
            </DialogContent>
          </Dialog>
          {(isLoadingCancelEvent) && <Loader />}
        </div>
      </> :
        <div className="history-table-wrapper">
          {/* <OpenAvailabilityHistory value={value} index={4}/>  */}
          {historyView && historyView.id === 2 ? (
          <OpenAvailabilityHistory value={value} index={index} />
          ) : (
            <EventHubHistory value={value} index={index} />
          )}
        </div>
       }
        <Dialog
        open={isBookedOpenDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="edit-event-popup"
      >
        <div className="popup-header">
          <h2>This Event was just booked</h2>
          <GridCloseIcon onClick={() => setIsBookedOpenDialog(false)} />
        </div>
        <DialogContent>
          <p>Would you like to raise a cancelation request</p>
        </DialogContent>
        <DialogActions>
              <CustomButton
                onClick={() => {
                  setCancelDialog?.(true);
                  setIsBookedOpenDialog(false)
                }}
                color="primary"
                className="primary_btns"
                label="Yes"
              />
              <CustomButton
                onClick={() => {
                  setIsBookedOpenDialog(false)
                }}
                color="secondary"
                className="secondary_btns"
                label="No"
              />
            </DialogActions>
      </Dialog>
    </>
  );
};

export default History;
