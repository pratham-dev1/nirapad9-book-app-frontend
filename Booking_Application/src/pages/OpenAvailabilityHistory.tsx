import { useEffect, useState, useCallback, useContext } from "react";
import Box from "@mui/material/Box";
import { useMutation, useQuery, useQueryClient } from "react-query";
import request from "../services/http";
import { DELETE_BOOKED_OPEN_AVAILABILITY, DELETE_OPEN_AVAILABILITY, GET_PREDEFINED_MEETS_TYPES, GET_TALENT_PARTNER_HISTORY, GET_TIMEZONES, UPDATE_BOOKED_OPEN_SLOT, UPDATE_OPEN_SLOT } from "../constants/Urls";
import dayjs, { Dayjs } from "dayjs";
import { Dialog, DialogActions, DialogContent, Drawer, Rating } from "@mui/material";
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
import { Applications, ToastActionTypes } from "../utils/Enums";
import TpHistory from "./talentpartner/History";
import RecruiterHistory from "./recruiter/History"
import { AuthContext } from "../context/auth/AuthContext";

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningIcon from "../styles/icons/WarningIcon";
import EventHubHistory from "./EventHubHistory";
import EditAvailabilityRespondInvite from "./talentpartner/EditAvailabilityRespondInvite";
import CustomTimePicker from "../components/CustomTimePicker";
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import { makeStyles } from "@mui/styles";

interface TimeZoneProps {
  id:number;
  timezone: string;
  value: string;
  abbreviation: string;
}

const useStyles = makeStyles({
  strikethrough: {
    "& .MuiDataGrid-cell": {
      textDecoration: "line-through",
      color: "gray",
    },
  },
});

const OpenAvailabilityHistory: React.FC<{ value: number, index: number }> = ({ value, index }) => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { state, dispatch } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>()
  const [endTime, setEndTime] = useState<Dayjs | null>()
  // const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZoneProps>({
  //   timezone: "America/Dallas",
  //   abbreviation: "CST",
  //   value: "America/Chicago",
  //   id: 1
  // });
  // const [allTimeZones, setAllTimeZones] = useState<unknown[]>([]);
  const [data, setData] = useState({ data: [], totalCount: 0 });
  const [bookedFilter, setBookedFilter] = useState<any>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>();
  const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
  const [historyView, setHistoryView] = useState(state.appAccess.includes(Applications.SLOT_BROADCAST) ? {id:2 , name:'Open Availability History'} : {id:3, name:'Event Hub History'})
  const [singleDeleteState, setSingleDeleteState] = useState<{ id: number; booked: boolean }>()
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean, type: 'single' | 'multiple' }>({ open: false, type: 'single' });
  const [url, setUrl] = useState<string>(UPDATE_OPEN_SLOT);
  
  const {data: meetTypes} = useQuery('predefined-meet-types', () => request(GET_PREDEFINED_MEETS_TYPES))
  const { mutate:deleteOpenAvailability} = useMutation((body: object) => request(DELETE_OPEN_AVAILABILITY, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('open-availability-history');
      showToast(ToastActionTypes.SUCCESS, data.message)
    },
  })
  

  // useEffect(() => {
  //   //  const timeZones = moment.tz.names().map((timezone:any) => moment.tz(timezone).format('z')).filter((item:string) => !item.includes('-') && !item.includes('+'))
  //   const timeZones = moment.tz
  //     .names()
  //     .map((timezone: string) => ({
  //       timezone: timezone,
  //       abbr: moment.tz(timezone).format("z"),
  //     }));
  //   setAllTimeZones(timeZones);
  // }, []);

  const [params, setParams] = useState({
    page: 0,
    pageSize: 20,
    startDateFilter: "",
    endDateFilter: "",
    sortingColumn: "datetime",
    sortingOrder: "desc",
  });

  const {
    data: historyData,
    isLoading,
    refetch,
  } = useQuery(["open-availability-history", params], () =>
    request(GET_OPEN_AVAILABILITY_HISTORY, "get", params),
    {
      enabled: (value === index)
    }
  );
 
  // const{data:timezones, refetch: timezoneRefetch}=useQuery("timezones",()=>request(GET_TIMEZONES),{
  //   enabled:(value === index)
  // })

  useEffect(() => {
    if (historyData?.data) {
      const DATA = historyData?.data?.map((item: any) => ({
        ...item,
        [`date`]: dayjs(item.datetime)
          .tz(default_timeZone)
          .format("DD-MM-YYYY"),
        [`starttime`]: dayjs(item.datetime)
          .tz(default_timeZone)
          .format("h:mm A"),
        [`endtime`]: dayjs(item.endtime)
        .tz(default_timeZone)
        .format("h:mm A"),
        // [`date_${selectedTimeZone.abbreviation}`]: dayjs(item.datetime)
        //   .tz(selectedTimeZone.value)
        //   .format("DD-MM-YYYY"),
        // [`starttime_${selectedTimeZone.abbreviation}`]: dayjs(item.datetime)
        //   .tz(selectedTimeZone.value)
        //   .format("h:mm A"),
        // [`endtime_${selectedTimeZone.abbreviation}`]: dayjs(item.endtime)
        // .tz(selectedTimeZone.value)
        // .format("h:mm A"),
      }));
      setData({ data: DATA, totalCount: historyData.totalCount });
    }
  }, [historyData]);

  const handleApplyFilter = () => {
      const startDateTime = startTime ? dayjs.tz(`${startDateFilter?.format("YYYY-MM-DD")} ${startTime?.format('HH:mm')}`, default_timeZone).toISOString() : startDateFilter ? dayjs(startDateFilter).toISOString() : ''
      const endDateTime = endTime ? dayjs.tz(`${endDateFilter?.format("YYYY-MM-DD")} ${endTime?.format('HH:mm')}`, default_timeZone).toISOString() : endDateFilter ? dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').toISOString() : ''
      setParams((prev) => ({ ...prev, startDateFilter: startDateTime, endDateFilter: endDateTime }))
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

  const handleInputChange = (value: any) => {
    setParams((prev) => ({
      ...prev,
      ...(value?.id === 1
        ? { bookedFilter: true }
        : value?.id === 2
        ? { bookedFilter: false }
        : value?.id === 3
        ? { bookedFilter: null }
        : value?.id === 4
        ? { bookedFilter: 'cancelled' }
        : {}),
    }));
    setBookedFilter(value)
  };

  const { mutate:deleteBookedOpenAvailability} = useMutation((body: object) => request(DELETE_BOOKED_OPEN_AVAILABILITY, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('open-availability-history');
      showToast(ToastActionTypes.SUCCESS, data.message)
      setOpenDialog(false)
    },
  })

  const handleConfirmDelete = () => {
    deleteOpenAvailability({ ids: rowSelectionModel });
    // deleteOpenAvailability({ids: singleDeleteId});
    setDeleteDialogState({ open: false, type: 'multiple' });
  };
  const handleConfirmSingleDelete = () => {
    if(singleDeleteState?.booked){
      deleteBookedOpenAvailability({ id: singleDeleteState.id });
    }else{
      deleteOpenAvailability({ ids: singleDeleteState?.id });
    }
    setDeleteDialogState({ open: false, type: 'single' })
  }
  const handleClearFilter = () => {
    setStartDateFilter(null);
    setEndDateFilter(null);
    setStartTime(null);
    setEndTime(null)
    setParams((prev) => ({ ...prev, startDateFilter: "", endDateFilter: "" }))
  };

  const getRowClassName = (params: any) => {
    if (params.row?.isCancelled) {
      return classes.strikethrough;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Actions",
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const handleEditClick = () => {
          setFormData(params.row);
          if(params.row.booked){
            setUrl(UPDATE_BOOKED_OPEN_SLOT)
          }else{
            setUrl(UPDATE_OPEN_SLOT)
          }
 
          setOpenDialog(true);
        };

        const handleDeleteClick = () => {
          setDeleteDialogState({ open: true, type: 'single' });
          setSingleDeleteState({
            id: params.row.id,
            booked: params.row.booked,
          });
        };
        const isPastSlot = dayjs() > dayjs(params.row.datetime)
        return (
          <>
            {(!isPastSlot && !params.row.isCancelled) &&
              <>
                <EditOutlinedIcon className="pointer" onClick={handleEditClick} />
                {params.row.booked ? (
                  ''
                  // <CancelOutlinedIcon className="pointer" onClick={handleDeleteClick} />
                ) : (
                  <DeleteOutlineOutlinedIcon className="pointer" onClick={handleDeleteClick} />
                )}
              </>
             }
          </>
        );
      },
    },
    // {
    //   field: "id",
    //   headerName: "S No.",
    //   width: 110,
    //   sortable: false,
    // },
    {
      field: `date`,
      headerName: `Date_${default_timeZone_abbr}`,
      width: 200,
    },
    {
      field: `starttime`,
      headerName: `StartTime_${default_timeZone_abbr}`,
      width: 160,
      sortable: false,
    },
    {
      field: `endtime`,
      headerName: `EndTime_${default_timeZone_abbr}`,
      width: 160,
      sortable: false,
    },
    // {
    //   field: `date_${selectedTimeZone.abbreviation}`,
    //   headerName: `Date_${selectedTimeZone.abbreviation}`,
    //   width: 200,
    //   sortable: false,
    // },
    // {
    //   field: `starttime_${selectedTimeZone.abbreviation}`,
    //   headerName: `StartTime_${selectedTimeZone.abbreviation}`,
    //   width: 160,
    //   sortable: false,
    // },
    // {
    //   field: `endtime_${selectedTimeZone.abbreviation}`,
    //   headerName: `EndTime_${selectedTimeZone.abbreviation}`,
    //   width: 160,
    //   sortable: false,
    // },
    {
      field: `timezone`,
      headerName: `Guest Timezone`,
      width: 160,
      sortable: false,
      renderCell: (params) => {
        if (!params.row.booked) return null;
        const datetime = params.row.datetime
        const timezone = params.row.guestTimezone
        return timezone ? `${dayjs(datetime).tz(timezone).format('DD-MM-YYYY')} - ${dayjs(datetime).tz(timezone).format('h:mm A')} (${timezone})` : ''
      }
    },
    {
      field: "",
      headerName: "Meeting Type",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const {booked, meetType, meetingLink, houseNo, houseName, street, area, stateDetail, cityDetail, pincode, landmark, mapLink} = params.row
        if (!booked) return null;
    
        const meetTypeLabel = meetTypes?.data?.find((i: any) => i.id === meetType)?.value || "";
    
        return (
          <span>
            {meetTypeLabel} -{" "}
            {meetingLink ? (
              <a target="_blank" href={meetingLink} rel="noopener noreferrer">
                Join
              </a>
            ) : (
              <>
                {houseNo && `${houseNo}, `}
                {houseName && `${houseName}, `}
                {street && `${street}, `}
                {area && `${area}, `}
                {cityDetail?.name && `${cityDetail.name}, `}
                {stateDetail?.name && `${stateDetail.name}, `}
                {pincode && `${pincode}, `}
                {landmark && `${landmark}, `}
                {mapLink && (
                  <span>
                    <a target="_blank" href={mapLink} rel="noopener noreferrer">
                      Map Link
                    </a>
                  </span>
                )}
              </>
            )}
          </span>
        );
      }
    },
    {
      field: 'rescheduleReason',
      headerName: 'Reschedule Reason',
      width: 200,
      sortable: false,
    },
  ];

  const CustomToolbar = () => {
    return (
      <div className="table_filter filter-toolbar" style={{backgroundColor:"#f1f2f6",height:60,display:"flex",alignItems:"center"}}>
        {/* <>
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
        </> */}
        <>
          <CustomAutocomplete
            label="Booked Filter"
            options={[
              { id: 1, value: "Booked" },
              { id: 2, value: "Not Booked" },
              { id: 4, value: "Cancelled" },
              { id: 3, value: "All" },
            ]}
            getOptionLabel={(item) => item.value}
            value={bookedFilter || { id: 3, value: "All" }}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, value) => handleInputChange(value)}
            size="small"
            sx={{ width: 150 }}
            disableClearable={true}
          />
          { (state.userType === 1 || state.userType === 2) && 
          <CustomAutocomplete
            label="History View"
            options={[{ id: 1, name: 'History' }, { id: 2, name: 'Open Availability History' }, { id:3, name:'Event Hub History'}]}
            getOptionLabel={(item) => item.name}
            value={historyView}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, value) => {setOpenDrawer(false); setHistoryView(value)}}
            size="small"
            sx={{ width: 250, mx: 1 }}
            disableClearable={true}

          />}
          {(state.userType == 4)&&
            <CustomAutocomplete
              label="History View"
              options={[
                ...(state.appAccess.includes(Applications.SLOT_BROADCAST) ? [{id:2 , name: 'Open Availability History'}] : []), 
                ...(state.appAccess.includes(Applications.EVENT_HUB) ? [{id:3, name:'Event Hub History'}] : [])
              ]}
              getOptionLabel={(item) => item.name}
              value={historyView}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              onChange={(event, value) => setHistoryView(value)}
              size="small"
              sx={{ width: 250, mx: 1 }}
              disableClearable={true}
            />
          }
          <CustomButton
            label="More Filter"
            color="inherit"
            size="small"
            className="more-filter-btn"
            onClick={() => setOpenDrawer((prev) => !prev)}
            startIcon={<TuneIcon />}
            sx={{ mx: 2 }}
          />
          {/* <CustomButton
            label="Apply"
            className="apply-btn"
            onClick={handleInputChange}
            color="inherit"
            size="small"
          /> */}
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
    <>
      {historyView?.name === "Open Availability History" ? 
      <>
      <div className="history-table-wrapper">
        {CustomToolbar()}
        <CustomDataGrid
          // rows={rows}
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
          loading={isLoading}
          onPaginationModelChange={handlePagination}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          sortModel={[{ field: `date`, sort: params.sortingOrder as GridSortDirection }]}
          sortingOrder={["desc", "asc"]}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          slots={{ pagination: CustomPagination }}
          getRowClassName={getRowClassName as any}
        />
      </div>
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
        {formData?.booked ? (
          <EditAvailabilityRespondInvite formData={{...formData, time: dayjs(formData.datetime).tz(default_timeZone).format("h:mm A"), title: formData?.tagData?.title}} URL={url} setOpenDialog={setOpenDialog} setDeleteDialogState={setDeleteDialogState} setSingleDeleteState={setSingleDeleteState} />
        ):(
          <EditAvailability formData={formData} URL={url} refetch={refetch} setOpenDialog={setOpenDialog} />
        )}
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
          <h3 className="text-center">Are you sure you want to delete the selected slot(s)?</h3> 
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
      </>: <>{state.userType === 1 ? (historyView.id == 1 ? <TpHistory value={value} index={index}/> : <EventHubHistory value={value} index={index}/>) : state.userType === 2 ? ( historyView.id == 1 ? <RecruiterHistory value={value} index={index}/> : <EventHubHistory value={value} index={index}/> ) : state.userType === 4 ? <EventHubHistory value={value} index={index} /> : null}</>  }
    </>
  );
};

export default OpenAvailabilityHistory;
