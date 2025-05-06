import { useEffect, useState, useCallback, useContext } from "react";
import Box from "@mui/material/Box";
import { useMutation, useQuery, useQueryClient } from "react-query";
import request from "../services/http";
import { DELETE_BOOKED_OPEN_AVAILABILITY, DELETE_EVENT_HUB_EVENT, DELETE_OPEN_AVAILABILITY, GET_ALL_UPCOMING_EVENTS, GET_EVENT_HUB_HISTORY, GET_PERSONAL_BOOKINGS, GET_PREDEFINED_MEETS_TYPES, GET_TALENT_PARTNER_HISTORY, GET_TIMEZONES, UPDATE_BOOKED_OPEN_SLOT, UPDATE_OPEN_SLOT } from "../constants/Urls";
import dayjs, { Dayjs } from "dayjs";
import { Dialog, DialogActions, DialogContent, Drawer } from "@mui/material";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomButton from "../components/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import CustomAutocomplete from "../components/CustomAutocomplete";
import TuneIcon from "@mui/icons-material/Tune";
import CustomDataGrid from "../components/CustomDataGrid";
import moment from "moment-timezone";
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
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

const PersonalBookings: React.FC<{ value: number, index: number }> = ({ value, index })=> {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(dayjs().tz(default_timeZone).startOf('day'));
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>()
  const [endTime, setEndTime] = useState<Dayjs | null>()
  const [data, setData] = useState({ data: [], totalCount: 0 });
  const [appliedFilter, setApplyFilter] = useState<any>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>();
  const [singleDeleteState, setSingleDeleteState] = useState<{id: number, userId: any }>()
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean, type: 'single' | 'multiple' }>({ open: false, type: 'single' });


  const [params, setParams] = useState({
    page: 0,
    pageSize: 20,
    startDateFilter: dayjs().tz(default_timeZone).toISOString(),
    endDateFilter: "",
    sortingColumn: "datetime",
    sortingOrder: "asc",
    appliedFilter: 'Bookings'
  });

  const {
    data: personalBooking,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery(["PERSONAL-BOOKING", params], () =>
    request(GET_PERSONAL_BOOKINGS, "get", params),
    {
      enabled: (value === index)
    }
  );

  const {data: meetTypes} = useQuery('predefined-meet-types', () => request(GET_PREDEFINED_MEETS_TYPES))
  
  useEffect(() => {
    if (personalBooking?.data) {
      const DATA = personalBooking?.data?.map((item: any) => ({
        ...item,
        [`startTime`]: dayjs(item.datetime)
          .tz(default_timeZone)
          .format("D MMMM YYYY, h:mm A"),
        [`endTime`]: dayjs(item.endtime)
        .tz(default_timeZone)
        .format("D MMMM YYYY, h:mm A"),
      }));
      setData({ data: DATA, totalCount: personalBooking.totalCount });
    }
  }, [personalBooking]);
  const handleApplyFilter = () => {
      const startDateTime = startTime ? dayjs.tz(`${startDateFilter?.format("YYYY-MM-DD")} ${startTime?.format('HH:mm')}`, default_timeZone).toISOString() : startDateFilter ? dayjs(startDateFilter).toISOString() : ''
      const endDateTime = endTime ? dayjs.tz(`${endDateFilter?.format("YYYY-MM-DD")} ${endTime?.format('HH:mm')}`, default_timeZone).toISOString() : endDateFilter ? dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').toISOString() : ''
      setParams((prev) => ({ ...prev, startDateFilter: startDateTime, endDateFilter: endDateTime}))
  };

  const handlePagination = (pageInfo: GridPaginationModel) => {
    setParams((prev) => ({ ...prev, ...pageInfo }));
  };

  const handleSortModelChange = (sortInfo: GridSortModel) => {
    setParams((prev) => ({
      ...prev,
      sortingOrder: sortInfo[0].sort as string,
    }));
  };

  const handleInputChange = (value: any) => {
    setApplyFilter(value)
    setParams(prev => ({ ...prev, ...(value?.id === 1 ? { appliedFilter: 'bookings' } : value?.id === 2 ? { appliedFilter: 'cancelled' } : {})}));
  };

  const { mutate:deleteBookedOpenAvailability, isLoading: isDeleteLoading} = useMutation((body: object) => request(DELETE_BOOKED_OPEN_AVAILABILITY, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('PERSONAL-BOOKING');
      showToast(ToastActionTypes.SUCCESS, data.message)
      setOpenDialog(false)
    },
  })

  const handleConfirmSingleDelete = () => {
    deleteBookedOpenAvailability(singleDeleteState as Object)
    setDeleteDialogState({ open: false, type: 'single' })
  }
  const handleClearFilter = () => {
    setStartDateFilter(dayjs().tz(default_timeZone));
    setEndDateFilter(null);
    setStartTime(null);
    setEndTime(null);
    setParams((prev) => ({ ...prev, startDateFilter: dayjs().tz(default_timeZone).toISOString(), endDateFilter: "" }))
  };

  const handleReschedule = (row: any) => {
    let url = `/book-your-appointment/${row.tagData.tagName}-${row.tagData.eventDuration}mins/${row.userId}/${row.tagId}/${row.tagTypeId}/${row.id}`
    window.open(url, '_blank');
  }

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Actions",
      width: 350,
      renderCell: (params: GridRenderCellParams) => {
        const handleDeleteClick = () => {
          setDeleteDialogState({ open: true, type: 'single' });
          setSingleDeleteState({
            id: params.row.id,
            userId: params.row.userId
          });
        };
        const isLessThan24HoursLeft = dayjs().add(24, 'hour').tz(default_timeZone) > dayjs(params.row.datetime).tz(default_timeZone)
        return (
          <>
            {(!isLessThan24HoursLeft && !params.row.isCancelled) && <>
            <CustomButton label='Reschedule' onClick={() => handleReschedule(params.row)}/> &nbsp;&nbsp;&nbsp;
              {/* <EventRepeatIcon className="pointer" onClick={() => handleReschedule(params.row)}/> &nbsp;&nbsp;&nbsp; */}
              {/* <CancelOutlinedIcon className="pointer" onClick={handleDeleteClick} /> */}
              <CustomButton label='Cancel' onClick={handleDeleteClick}/>
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
      field: "--",
      headerName: "Title",
      width: 250,
      sortable: false,
      renderCell: (params) => {
        return params.row.tagData.tagName
      }
    },
    {
      field: "senderEmail",
      headerName: "Owner",
      width: 250,
      sortable: false,
    },
    {
      field: 'startTime',
      headerName: `Start Time_${default_timeZone_abbr}`,
      width: 220,
    },
    {
        field: 'endTime',
        headerName: `End Time_${default_timeZone_abbr}`,
        width: 220,
        sortable: false,
    },
    {
        field: "",
        headerName: "Meeting Type",
        width: 300,
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
      }
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
            label="Booked Filter"
            options={[
              { id: 1, value: "Bookings" },
              { id: 2, value: 'Cancelled' },
            ]}
            getOptionLabel={(item) => item.value}
            value={appliedFilter || { id: 1, value: "Bookings" }}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, value) => handleInputChange(value)}
            size="small"
            sx={{ width: 150 }}
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
          disableRowSelectionOnClick={true}
          isRowSelectable={(params: GridRowParams) => dayjs() < dayjs(params.row.datetime) && !params.row.booked}
          disableColumnMenu={true}
          rowCount={data?.totalCount || 0}
          paginationModel={{ page: params.page, pageSize: params.pageSize }}
          paginationMode="server"
          pageSizeOptions={[20, 50, 100]}
          loading={isLoading || isRefetching}
          onPaginationModelChange={handlePagination}
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

export default PersonalBookings;
