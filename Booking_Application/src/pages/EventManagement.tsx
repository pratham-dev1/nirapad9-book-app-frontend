import { useEffect, useState, useCallback, useContext } from "react";
import Box from "@mui/material/Box";
import { useMutation, useQuery, useQueryClient } from "react-query";
import request from "../services/http";
import { DELETE_BOOKED_OPEN_AVAILABILITY, DELETE_EVENT_HUB_EVENT, DELETE_OPEN_AVAILABILITY, GET_ALL_UPCOMING_EVENTS, GET_EVENT_HUB_HISTORY, GET_TALENT_PARTNER_HISTORY, GET_TIMEZONES, UPDATE_BOOKED_OPEN_SLOT, UPDATE_OPEN_SLOT } from "../constants/Urls";
import dayjs, { Dayjs } from "dayjs";
import { Dialog, DialogActions, DialogContent, Drawer } from "@mui/material";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomButton from "../components/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import CustomTextField from "../components/CustomTextField";
import CustomAutocomplete from "../components/CustomAutocomplete";
import TuneIcon from "@mui/icons-material/Tune";
import CustomDataGrid from "../components/CustomDataGrid";
import moment from "moment-timezone";
import {
  DELETE_AVAILABILITY,
  GET_OPEN_AVAILABILITY_HISTORY,
} from "../constants/Urls";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  GridColDef,
  GridToolbarContainer,
  GridSortModel,
  GridRowSelectionModel,
  GridRenderCellParams,
  GridPaginationModel,
  GridRowParams,
  GridSortDirection,
  GridPagination,
} from "@mui/x-data-grid";
import EditAvailability from "./talentpartner/EditAvailability";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import TpHistory from "./talentpartner/History";
import RecruiterHistory from "./recruiter/History"
import { AuthContext } from "../context/auth/AuthContext";

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningIcon from "../styles/icons/WarningIcon";
import OpenAvailabilityHistory from "./OpenAvailabilityHistory";
import EditEvent from "./EditEvent";
import { useNavigate } from "react-router-dom";
import RespondInvite from "./RespondInvite";
import { makeStyles } from "@mui/styles";
import Loader from "../components/Loader";
import CustomTimePicker from "../components/CustomTimePicker";

interface TimeZoneProps {
  id:number;
  timezone: string;
  value: string;
  abbreviation: string;
}

const useStyles = makeStyles({
  rowWithLineThrough: {
    textDecoration: 'line-through',
  },
});

const EventManagement: React.FC<{ value: number, index: number }> = ({ value, index })=> {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(dayjs().tz(default_timeZone).startOf('day'));
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>()
  const [endTime, setEndTime] = useState<Dayjs | null>()
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZoneProps>({
    timezone: "America/Dallas",
    abbreviation: "CST",
    value: "America/Chicago",
    id: 1
  });
  const [allTimeZones, setAllTimeZones] = useState<unknown[]>([]);
  const [data, setData] = useState({ data: [], totalCount: 0 });
  const [bookedFilter, setBookedFilter] = useState<any>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>();
  // const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
//   const [historyView, setHistoryView] = useState({id:2 , name:'Open Availability History'})
  const [singleDeleteState, setSingleDeleteState] = useState<{ eventId: string; booked: boolean, senderEmail: string, senderEmailServiceProvider: string }>()
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean, type: 'single' | 'multiple' }>({ open: false, type: 'single' });
  const [eventTypeFilter, setEventTypeFilter] = useState({id: 6, name: 'All'})
//   const [url, setUrl] = useState<string>(UPDATE_OPEN_SLOT);
  
//   const { mutate:deleteOpenAvailability} = useMutation((body: object) => request(DELETE_OPEN_AVAILABILITY, "delete", body),
//   {
//     onSuccess: (data) => {
//       queryClient.invalidateQueries('open-availability-history');
//       showToast(ToastActionTypes.SUCCESS, data.message)
//     },
//   })

  useEffect(() => {
    const timeZones = moment.tz
      .names()
      .map((timezone: string) => ({
        timezone: timezone,
        abbr: moment.tz(timezone).format("z"),
      }));
    setAllTimeZones(timeZones);
  }, []);

  const [params, setParams] = useState({
    page: 0,
    pageSize: 20,
    startDateFilter: dayjs().tz(default_timeZone).toISOString(),
    endDateFilter: "",
    sortingColumn: "startTime",
    sortingOrder: "asc",
    eventTypeFilter: 'All'
  });

  const {
    data: historyData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery(["all-upcomimg-events", params], () =>
    request(GET_ALL_UPCOMING_EVENTS, "get", params),
    {
      enabled: (value === index)
    }
  );
  const{data:timezones, refetch: timezoneRefetch}=useQuery("timezones",()=>request(GET_TIMEZONES),{
    enabled:(value === index)
  })

  useEffect(() => {
    if (historyData?.data) {
      const DATA = historyData?.data?.map((item: any) => ({
        ...item,
        [`startTime`]: dayjs(item.startTime)
          .tz(default_timeZone)
          .format("D MMMM YYYY, h:mm A"),
        [`endTime`]: dayjs(item.endTime)
        .tz(default_timeZone)
        .format("D MMMM YYYY, h:mm A"),
        [`selectedStartTime`]: dayjs(item.startTime)
        .tz(selectedTimeZone.value)
        .format("D MMMM YYYY, h:mm A"),
        [`selectedEndTime`]: dayjs(item.endTime)
        .tz(selectedTimeZone.value)
        .format("D MMMM YYYY, h:mm A"),
        startTimeValue: item.startTime,
        endTimeValue: item.endTime
      }));
      setData({ data: DATA, totalCount: historyData.totalCount });
    }
  }, [historyData]);
  const handleApplyFilter = () => {
      const startDateTime = startTime ? dayjs.tz(`${startDateFilter?.format("YYYY-MM-DD")} ${startTime?.format('HH:mm')}`, default_timeZone).toISOString() : startDateFilter ? dayjs(startDateFilter).toISOString() : ''
      const endDateTime = endTime ? dayjs.tz(`${endDateFilter?.format("YYYY-MM-DD")} ${endTime?.format('HH:mm')}`, default_timeZone).toISOString() : endDateFilter ? dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').toISOString() : ''
      setParams((prev) => ({ ...prev, startDateFilter: startDateTime, endDateFilter: endDateTime}))
  };

  const handlePagination = (pageInfo: GridPaginationModel) => {
    setRowSelectionModel([])
    setParams((prev) => ({ ...prev, ...pageInfo }));
  };

  const handleSortModelChange = (sortInfo: GridSortModel) => {
    setParams((prev) => ({
      ...prev,
      sortingOrder: sortInfo[0].sort as string,
    }));
  };

  const handleInputChange = () => {
    setParams(prev => ({ ...prev, ...(bookedFilter?.id === 1 ? { bookedFilter: true } : 
      bookedFilter?.id === 2 ? { bookedFilter: false } : 
      bookedFilter?.id === 3 ? { bookedFilter: null } : 
      bookedFilter?.id === 4 ? { bookedFilter: 'cancelled' } :
      bookedFilter?.id === 5 ? {bookedFilter: 'cancelRequested'} : {} 
  )}));
  };

  const handleEventTypeFilter = (value: any) => {
    setEventTypeFilter(value)
    setParams(prev => ({...prev, eventTypeFilter: value.name }))
  }

  const { mutate:deleteEventHubEvent, isLoading: isDeleteLoading} = useMutation((body: object) => request(DELETE_EVENT_HUB_EVENT, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('all-upcomimg-events');
      showToast(ToastActionTypes.SUCCESS, data.message)
    },
  })

  // const handleConfirmDelete = () => {
  //   deleteOpenAvailability({ ids: rowSelectionModel });
  //   // deleteOpenAvailability({ids: singleDeleteId});
  //   setDeleteDialogState({ open: false, type: 'multiple' });
  // };
  const handleConfirmSingleDelete = () => {
    if(singleDeleteState?.booked){
      deleteEventHubEvent({ eventId: singleDeleteState.eventId, senderEmail: singleDeleteState.senderEmail, senderEmailServiceProvider: singleDeleteState.senderEmailServiceProvider });
    }else{
      // deleteOpenAvailability({ ids: singleDeleteState?.id });
    }
    setDeleteDialogState({ open: false, type: 'single' })
  }
  const handleClearFilter = () => {
    setStartDateFilter(dayjs().tz(default_timeZone));
    setEndDateFilter(null);
    setStartTime(null);
    setEndTime(null);
    setParams((prev) => ({ ...prev, startDateFilter: dayjs().tz(default_timeZone).toISOString(), endDateFilter: "" }))
  };

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Actions",
      width: 110,
      renderCell: (params: GridRenderCellParams) => {
        const handleEditClick = () => {
          // if (params.row.creatorFlag) {
          setFormData(params.row);
          setOpenDialog(true);
          // }
          // else {
          //   navigate('/respond-event-invite', {state: {data: params.row}})
          // }
        };

        const handleDeleteClick = () => {
          setDeleteDialogState({ open: true, type: 'single' });
          setSingleDeleteState({
            eventId: params.row.eventId,
            booked: true,
            senderEmail: params.row.senderEmail,
            senderEmailServiceProvider: params.row.senderEmailServiceProvider
          });
        };
        const isPastSlot = dayjs() > dayjs(params.row.startTimeValue)
        return (
          <>
            {(!isPastSlot && !params.row.isCancelled && !params.row.isDeleted) &&
              <>
                <EditOutlinedIcon className="pointer" onClick={handleEditClick} />
                {!params.row.isCancelled && <CancelOutlinedIcon className="pointer" onClick={handleDeleteClick} />}
                {/* {params.row.booked ? (
                  <CancelOutlinedIcon onClick={handleDeleteClick} />
                ) : (
                  <DeleteOutlineOutlinedIcon onClick={handleDeleteClick} />
                )} */}
              </>
            }
          </>
        );
      },
    },
    // {
    //   field: "id",
    //   headerName: "S No.",
    //   width: 100,
    //   sortable: false,
    // },
    {
      field: "title",
      headerName: "Title",
      width: 250,
      sortable: false,
    },
    {
      field: "creatorFlag",
      headerName: "Owner",
      width: 250,
      sortable: false,
    },
    {
      field: "source",
      headerName: "Source",
      width: 250,
      sortable: false,
      renderCell: (params) => {
        return params.row?.source ? params.row?.source : 'Outside'
      }
    },
    {
      field: `eventDurationInMinutes`,
      headerName: `Event Duration`,
      width: 160,
      sortable: false,
    },
    {
      field: `startTime`,
      headerName: `Start Time_${default_timeZone_abbr}`,
      width: 220,
    },
    {
        field: `endTime`,
        headerName: `End Time_${default_timeZone_abbr}`,
        width: 220,
        sortable: false,
    },
    {
      field: `selectedStartTime`,
      headerName: `Start Time_${selectedTimeZone.abbreviation}`,
      width: 220,
      sortable: false,
    },
    {
        field: `selectedEndTime`,
        headerName: `End Time_${selectedTimeZone.abbreviation}`,
        width: 220,
        sortable: false,
    },
    // {
    //     field: `attendees`,
    //     headerName: `attendees`,
    //     width: 300,
    //     sortable: false,
    // },
    {
      field: "meetingLink",
      headerName: "Meeting Link",
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return (
          params.row.meetingLink && (params.row.meetType != 2 && params.row.meetType != 3) && (
            <a target="_blank" href={params.row.meetingLink}>Join</a>
          )
        );
      }
    },
    {
      field: `attendees`,
      headerName: `Guests`,
      width: 220,
      sortable: false,
      renderCell: (params) => {
        return params.row.attendees?.split(',').filter((i: any) => i !== params.row.senderEmail).join(', ')
      }
    },
    {
      field: '-',
      headerName: `Guest Count`,
      width: 220,
      sortable: false,
      renderCell: (params) => {
        return params.row.attendees?.split(',')?.length
      }
    },
    {
      field: `eventTypeValue`,
      headerName: `Event Type`,
      width: 220,
      sortable: false,
      renderCell: (params) => {
        return params.row.eventTypeValue || '-'
      }
    },
    {
      field: `senderEmail`,
      headerName: `Sender Email`,
      width: 220,
      sortable: false
    },
  ];

  const getRowClassName = (params: any) => {
    if (params.row?.isCancelled || params.row?.isDeleted) {
      return classes.rowWithLineThrough;
    }
  };

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
        <>
          <CustomAutocomplete
            label="Booked Filter"
            options={[
              { id: 3, value: "All" },
              { id: 4, value: 'Cancelled' },
            ]}
            getOptionLabel={(item) => item.value}
            value={bookedFilter || { id: 3, value: "All" }}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, value) => setBookedFilter(value)}
            size="small"
            sx={{ width: 150 }}
            disableClearable={true}
          />
          {/* { (state.userType === 1 || state.userType === 2) && 
          <CustomAutocomplete
            label="History View"
             options={[{ id: 1, name: 'History' }, { id: 2, name: 'Open Availability History' }, {id:3, name:'Event Hub History'}]}
            getOptionLabel={(item) => item.name}
            value={historyView}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, value) => { setOpenDrawer(false); setHistoryView(value)}}
            size="small"
            sx={{ width: 250, mx: 1 }}
            disableClearable={true}

          />} 
          {(state.userType == 4)&&
            <CustomAutocomplete
              label="History View"
              options={[{id:2 , name: 'Open Availability History'}, {id:3, name:'Event Hub History'}]}
              getOptionLabel={(item) => item.name}
              value={historyView}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              onChange={(event, value) => { setOpenDrawer(false); setHistoryView(value)}}
              size="small"
              sx={{ width: 250, mx: 1 }}
              disableClearable={true}
            />
          } */}
            <CustomAutocomplete
              label="Event Type Fllter"
              options={[{id:1 , name: 'One to one'}, {id:2, name:'One to many'}, {id:3, name:'Custom'}, {id:4, name:'Group'}, {id:5, name:'Advanced'}, {id:6, name:'All'}]}
              getOptionLabel={(item) => item.name}
              value={eventTypeFilter}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              onChange={(event, value) => handleEventTypeFilter(value)}
              size="small"
              sx={{ width: 250, mx: 1 }}
              disableClearable={true}
            />
           <CustomButton
            label="More Filter"
            color="inherit"
            size="small"
            className="more-filter-btn"
            onClick={() => setOpenDrawer((prev) => !prev)}
            startIcon={<TuneIcon />}
            sx={{ mx: 2 }}
          />
          <CustomButton
            label="Apply"
            className="apply-btn"
            onClick={handleInputChange}
            color="inherit"
            size="small"
          />
          {rowSelectionModel.length > 0 && (
            <CustomButton
              label={`${rowSelectionModel.length > 1 ? "Delete All" : "Delete"}`}
              size="small"
              className="delete-btn"
              onClick={() => setDeleteDialogState({ open: true, type: 'multiple' })}
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
    // <p>Event Hub History</p>
    <>
    {isDeleteLoading && <Loader />}
      <>
      <div className="history-table-wrapper">
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
          paginationModel={{ page: params.page, pageSize: params.pageSize }}
          paginationMode="server"
          pageSizeOptions={[20, 50, 100]}
          loading={isLoading || isRefetching}
          onPaginationModelChange={handlePagination}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          sortModel={[{ field: `startTime`, sort: params.sortingOrder as GridSortDirection }]}
          sortingOrder={["desc", "asc"]}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          slots={{ pagination: CustomPagination }}
          getRowClassName={getRowClassName as any}
          // GridToolbar
        />
      </div>
      </>
    
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
                label="Start Date"
                className="placeholder-label"
                value={startDateFilter || null}
                size="small"
                sx={{ width: 200, paddingRight: 2 }}
                onChange={(value: Dayjs) => {
                  setStartDateFilter(value)
                    setEndDateFilter(null);
                  }
                }
                disablePast
              />
              <CustomDatePicker
                label="End Date"
                className="placeholder-label"
                value={endDateFilter || null} 
                size="small"
                sx={{ width: 200 }}
                onChange={(value: Dayjs) =>
                  setEndDateFilter(value)
                }
                disabled={!startDateFilter}
                minDate={startDateFilter}
              />
              <CustomTimePicker
                label="Start Time"
                size="small"
                className="placeholder-label"
                style={{ width: 150}}
                minutesStep={15}
                onChange={(value: Dayjs) => {
                  setStartTime(value);
                }}
                value={startTime || null}
                disabled={!startDateFilter}
              />
              <CustomTimePicker
                label="End Time"
                size="small"
                className="placeholder-label"
                style={{ width: 150 }}
                minutesStep={15}
                onChange={(value: Dayjs) => setEndTime(value)}
                value={endTime || null}
                disabled={!endDateFilter}
              />
              <div style={{ flexDirection: "column", marginTop: 20 }}>
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
          {formData?.creatorFlag ? <EditEvent formData={formData} refetch={refetch} setOpenDialog={setOpenDialog} /> 
          : <RespondInvite formData={formData} setOpenDialog={setOpenDialog} />
          }
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
          <h3 className="text-center">Are you sure you want to delete?</h3> 
        </DialogContent>
        <DialogActions>
        <CustomButton
            onClick={() => {
                if (deleteDialogState.type === 'single') {
                    handleConfirmSingleDelete();
                } else {
                  // handleConfirmDelete();
                }
            }}
            color="primary"
            className="primary_btns"
            label="Delete"
        />
          {/* <CustomButton onClick={() => handleConfirmDelete()} color="primary" label="Confirm" /> */}
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
      </>
    //   </>: <>{state.userType === 1 ?  <TpHistory value={value} index={1} /> : state.userType === 2 ? <RecruiterHistory value={value} index={1} /> : null}</>  }
    // </>
  );
};

export default EventManagement;
