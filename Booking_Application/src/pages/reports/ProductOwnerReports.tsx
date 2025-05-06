import { useEffect, useState,  useContext } from "react";
import {  useQuery } from "react-query";
import request from "../../services/http";
import dayjs, { Dayjs } from "dayjs";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomButton from "../../components/CustomButton";
import CustomDataGrid from "../../components/CustomDataGrid";
import moment from "moment-timezone";
import {
  GET_PRODUCT_OWNER_REPORTS,
} from "../../constants/Urls";
import {
  GridColDef,
  GridSortModel,
  GridRowSelectionModel,
  GridPaginationModel,
  GridSortDirection,
  GridPagination,
} from "@mui/x-data-grid";
import { TextField } from "@mui/material";

import { AuthContext } from "../../context/auth/AuthContext";
import CustomTimePicker from "../../components/CustomTimePicker";
import CustomAutocomplete from "../../components/CustomAutocomplete";



const ProductOwnerReports: React.FC<{ value: number, index: number }> = ({ value, index }) => {
  const { state, dispatch } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess() //Need to access application timezone 
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone 
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>()
  const [endTime, setEndTime] = useState<Dayjs | null>()
  const [data, setData] = useState({ data: [], totalCount: 0 });
  const [bookedFilter, setBookedFilter] = useState<any>();
  const [eventId, setEventId] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  
  const [params, setParams] = useState({
    page: 0,
    pageSize: 20,
    startDateFilter: "",
    endDateFilter: "",
    sortingColumn: "datetime",
    sortingOrder: "desc",
  });

  const {
    data: productOwnersData,
    isLoading,
    refetch,
  } = useQuery(["product-owner-reports", params], () =>
    request(GET_PRODUCT_OWNER_REPORTS, "get", params),
    {
      enabled: (value === index)
    }
  );

 
  const getAttendeesCount=(item:any):number=>{

    const eventParticipationData=item['events'][0]

    if(eventParticipationData){
        return eventParticipationData.attendees.split(",").length
    }

    return 0
  }

  useEffect(() => {
    if (productOwnersData?.data) {
      const DATA = productOwnersData?.data?.map((item: any) => ({
        ...item,
        [`date`]: dayjs(item['datetime'])
          .tz(default_timeZone)
          .format("DD-MM-YYYY"),
        [`Start Time`]: dayjs(item['datetime'])
          .tz(default_timeZone)
          .format("h:mm A"),
        [`End Time`]: dayjs(item['datetime'])
          .tz(default_timeZone)
          .add(30, 'minute') 
          .format("h:mm A"),
        [`Time Zone`]:default_timeZone_abbr,
        ['tagName']:item.tagData?.["tagName"] ?? null,
        ['attendees']:getAttendeesCount(item),
        ['organizationId']:item.user.organizationId,
        ['organization']:item.user.organization.organization,
        ['status']:item.booked ?"Booked":"Not Booked"

    }));
      setData({ data: DATA, totalCount: productOwnersData.totalCount });
    }
  }, [productOwnersData]);

  const getBookedFilterStatus=()=> (bookedFilter?.id === 1
    ? { bookedFilter: true }
    : bookedFilter?.id === 2
    ? { bookedFilter: false }
    : bookedFilter?.id === 3
    ? { bookedFilter: null }
    : {})

  const handleApplyFilter = () => {
      const startDateTime = startTime ? dayjs.tz(`${startDateFilter?.format("YYYY-MM-DD")} ${startTime?.format('HH:mm')}`, default_timeZone).toISOString() : startDateFilter ? dayjs(startDateFilter).toISOString() : ''
      const endDateTime = endTime ? dayjs.tz(`${endDateFilter?.format("YYYY-MM-DD")} ${endTime?.format('HH:mm')}`, default_timeZone).toISOString() : endDateFilter ? dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').toISOString() : ''
      setParams((prev) => ({ ...prev, startDateFilter: startDateTime, endDateFilter: endDateTime,eventId,organizationId,...getBookedFilterStatus() }))
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


 
  const handleClearFilter = () => {
    setStartDateFilter(null);
    setEndDateFilter(null);
    setStartTime(null);
    setEndTime(null)
    setBookedFilter({ id: 3, value: "All" })
    setEventId(null)
    setOrganizationId(null)
    setParams((prev) => ({ ...prev, startDateFilter: "", endDateFilter: ""}))
  };

  const columns: GridColDef[] = [
    {
        field: `eventId`,
        headerName: `Event Id`,
        width: 200,
        sortable: false

    },
    {
      field: `organizationId`,
      headerName: `Organization Id`,
      width: 200,
      sortable: false

    },
    {
        field: `organization`,
        headerName: `Organization Name`,
        width: 200,
        sortable: false

      },
      {
        field: `tagId`,
        headerName: `Tag ID`,
        width: 200,
        sortable: false

    },
    {
      field: `tagName`,
      headerName: `Tag Name`,
      width: 200,
      sortable: false

    },
      {
        field: `date`,
        headerName: `Event Date`,
        width: 200,
      },
      {
        field: `Start Time`,
        headerName: `Start Time`,
        width: 160,
        sortable: false
      },
      {
        field: `End Time`,
        headerName: `End Time`,
        width: 160,
        sortable: false
      },
      {
        field: `Time Zone`,
        headerName: `Time Zone`,
        width: 160,
        sortable: false,
      },
      {
        field: `attendees`,
        headerName: `Count Of Event Participants`,
        width: 250,
        sortable: false
      },
      {
        field: `status`,
        headerName: `Status Of Event`,
        width: 160,
        sortable: false

      }
    
  ];



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

  const handleEventIdSearch = (e: any) => {
    setEventId(e.target.value.trim())   
  };

  const handleOrganizationIdSearch = (e: any) => {
    const value = e.target.value.trim(); 
    setOrganizationId(value)   
  };


  return (
      <>
        <div className="page-wrapper srch_rpt_page">
          <h1 className="mb-30">Search result for Product Owner Reports</h1>
          <div className="history-filter-panel table_filter d-flex">
                            <TextField
                                label="Event Id"
                                placeholder="Search"
                                onChange={handleEventIdSearch}
                                value={eventId || ''}
                            />

                            <TextField
                                label="Organization Id"
                                placeholder="Search"
                                onChange={handleOrganizationIdSearch}
                                value={organizationId || ''}
                            />
            <CustomDatePicker
              label="Start Date"
              className="placeholder-label"
              value={startDateFilter || null}
              size="small"
              sx={{ width: 100, paddingRight: 2 }}
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
              sx={{ width: 100 }}
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

            <CustomAutocomplete
              label="Booked Filter"
              options={[
                { id: 1, value: "Booked" },
                { id: 2, value: "Not Booked" },
                { id: 3, value: "All" },
              ]}
              getOptionLabel={(item) => item.value}
              value={bookedFilter || { id: 3, value: "All" }}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              onChange={(event, value) => setBookedFilter(value)}
              size="small"
              sx={{ width: 150 }}
              disableClearable={true}
            />

            <div className="w-24 d-flex items-center flex-row justify-end pt-30">
              <CustomButton
                label="Apply"
                size="small"
                className="primary_btns mr-10"
                onClick={handleApplyFilter}
              />
              <CustomButton
                label="Clear"
                size="small"
                variant="outlined"
                className="secondary_btns"
                onClick={handleClearFilter}
              />    
            </div>

          </div>
          <div className="card-box">
            <div className="history-table-wrapper">
              <CustomDataGrid
               rows={data?.data || []}
                pagination
                columns={columns}
                isRowSelectable={()=>false}
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
              />
            </div>
          </div>
        </div>
    

    </>
  );
};

export default ProductOwnerReports;
