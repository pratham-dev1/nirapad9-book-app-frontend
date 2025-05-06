import { useEffect, useState,  useContext, useMemo } from "react";
import Box from "@mui/material/Box";
import {  useQuery } from "react-query";
import request from "../../services/http";
import {  GET_OPEN_AVAILABILITY_REPORTS, GET_OPEN_AVAILABILITY_REPORTS_SCHEMA, GET_OPEN_AVAILABILITY_TAG,} from "../../constants/Urls";
import dayjs, { Dayjs } from "dayjs";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomButton from "../../components/CustomButton";
import CustomDataGrid from "../../components/CustomDataGrid";
import moment from "moment-timezone";
import {
  GridColDef,
  GridSortModel,
  GridRowSelectionModel,
  GridPaginationModel,
  GridSortDirection,
  GridPagination,
} from "@mui/x-data-grid";

import { AuthContext } from "../../context/auth/AuthContext";


import CustomTimePicker from "../../components/CustomTimePicker";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import TempIcon from "../../styles/icons/TempIcon";
import DropdownIcon from "../../styles/icons/DropdownIcon";
import { Controller, useForm } from "react-hook-form";


interface OpenAvailabilityTagOptionProps {
    userId: number;
    tagName: string;
    defaultEmail?: string;
    isDeleted?: boolean;
    openAvailabilityText?: string;
  }

  interface ColumnType{
    id:number
    columnName:string 
    tableName:string
  }

  interface ModelType{
    attributes:string[]
    filter:{
      [key:string]:any
    }
  }

  interface TableData{
    [key: string] : ModelType
  }

  interface OpenAvailabilityParamsType{
    page: number;
    pageSize: number;
    tableData:TableData
  }

  type CustomGridColDef= GridColDef & {
    tableName?: string; // Your custom property
  };

const OpenAvailabilitySlotBroadcast: React.FC<{ value: number, index: number }> = ({ value, index }) => {
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
  const { data: openAvailabilityTag } = useQuery('tag-list', () => request(GET_OPEN_AVAILABILITY_TAG));
  const [bookedFilter, setBookedFilter] = useState<any>();
  const [selectedColumn, setSelectedColumn] = useState<ColumnType|null>(null);
  const [selectedColumns,setSelectedColumns]=useState<ColumnType[]>([])
  const [selectedTag, setSelectedTag] = useState<any>();
  
  const [params, setParams] = useState<OpenAvailabilityParamsType>({
    page: 0,
    pageSize: 20,
    tableData:{}
  });

  const {
    data: endUsersData,
    isLoading,
    refetch,
  } = useQuery(
    ["get-open-availability-reports",params],
    () => request(GET_OPEN_AVAILABILITY_REPORTS, "get", params),
    {
      enabled: (value === index) && Object.keys(params.tableData).length > 0, // Check if tableData has keys
    }
  );

  const {
    data: openAvailabilityReportsSchema,
    isLoading:isOpenAvailabilityReportsLoading,
    refetch:refetchOpenAvailabilityReportsSchema,
  } = useQuery(["get-open-availability-reports-schema"], () =>
    request(GET_OPEN_AVAILABILITY_REPORTS_SCHEMA),
    {
      enabled: (value === index)
    }
  );
  
  const handleTagChange = (_: any, value: any) => {
    setSelectedTag(value);
  }

  useEffect(() => {
    if (endUsersData?.data) {
      const DATA = endUsersData.data.map((item: any, index: number) => {
        // used for grid table
        const id = item.id || `${index}-${item.datetime || 'no-id'}`;
        
        if (item.datetime) {
          return {
            ...item,
            id,  // Add the `id` field here
            datetime: dayjs(item.datetime)
              .tz(default_timeZone)
              .format("DD-MM-YYYY"),
            ['startTime']: dayjs(item.datetime)
              .tz(default_timeZone)
              .format("h:mm A"),
            ['endTime']: dayjs(item.datetime)
              .tz(default_timeZone)
              .add(30, 'minute')
              .format("h:mm A"),
            ['timeZone']: default_timeZone_abbr,
          };
        }
  
        return { ...item, id }; 
      });
  
      setData({ data: DATA, totalCount: endUsersData.totalCount });
    }
  }, [endUsersData]);
  
  const getBookedFilterStatus=()=> (bookedFilter?.id === 1
    ? { bookedFilter: true }
    : bookedFilter?.id === 2
    ? { bookedFilter: false }
    : bookedFilter?.id === 3
    ? { bookedFilter: null }
    : {})

  const handleDateApplyFilter = (tableName:string) => {
      const startDateTime = startDateFilter ? dayjs(startDateFilter).toISOString() : ''
      const endDateTime = endDateFilter ? dayjs(endDateFilter).add(23, 'hour').add(59, 'minutes').toISOString() : ''

      setParams((prevParams: OpenAvailabilityParamsType) => {
        const currentTableData = prevParams.tableData[`${tableName}`];
      
        // Create a new attributes array, or an empty array if currentTableData is undefined
        const newFilters = currentTableData
          ? {
            ...currentTableData.filter, 
              startDateFilter:startDateTime,
              endDateFilter:endDateTime,
            }
          : {
            startDateFilter:startDateTime,
            endDateFilter:endDateTime,
           };
      
        const modifiedResult: OpenAvailabilityParamsType = {
          ...prevParams,
          tableData: {
            ...prevParams.tableData,
            tableName: {
              ...currentTableData, // Spread existing table data
              filter: newFilters, // Use the new attributes array
            },
          },
        };
      
        return modifiedResult; // Return the modified result
      });
  };

  const handleStartTimeFilter = (tableName:string) => {
    setParams((prevParams: OpenAvailabilityParamsType) => {
      const currentTableData = prevParams.tableData[`${tableName}`];

    
      // Create a new attributes array, or an empty array if currentTableData is undefined
      const newFilters = currentTableData
        ? {
          ...currentTableData.filter, 
          startTime:dayjs.tz(`${startDateFilter?.format("YYYY-MM-DD")} ${startTime?.format('HH:mm')}`, default_timeZone).toISOString(),
         }
        : {
          startTime:dayjs.tz(`${startDateFilter?.format("YYYY-MM-DD")} ${startTime?.format('HH:mm')}`, default_timeZone).toISOString(),
         };
    
      const modifiedResult: OpenAvailabilityParamsType = {
        ...prevParams,
        tableData: {
          ...prevParams.tableData,
          [tableName]: {
            ...currentTableData, // Spread existing table data
            filter: newFilters, // Use the new attributes array
          },
        },
      };
    
      return modifiedResult; // Return the modified result
    });
};


const handleEndTimeFilter = (tableName:string) => {


  setParams((prevParams: OpenAvailabilityParamsType) => {
    const currentTableData = prevParams.tableData[`${tableName}`];

  
    // Create a new attributes array, or an empty array if currentTableData is undefined
    const newFilters = currentTableData
      ? {
        ...currentTableData.filter, 
        endTime:dayjs.tz(`${endDateFilter?.format("YYYY-MM-DD")} ${endTime?.format('HH:mm')}`, default_timeZone).toISOString()
       }
      : {
     
        endTime:dayjs.tz(`${endDateFilter?.format("YYYY-MM-DD")} ${endTime?.format('HH:mm')}`, default_timeZone).toISOString()
     
       };
  
    const modifiedResult: OpenAvailabilityParamsType = {
      ...prevParams,
      tableData: {
        ...prevParams.tableData,
        [tableName]: {
          ...currentTableData, // Spread existing table data
          filter: newFilters, // Use the new attributes array
        },
      },
    };
  
    return modifiedResult; // Return the modified result
  });
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
    setSelectedTag(undefined)
    setStartDateFilter(null);
    setEndDateFilter(null);
    setStartTime(null);
    setEndTime(null)
    setBookedFilter({ id: 3, value: "All" })
    setParams((prev) => ({ ...prev, startDateFilter: "", endDateFilter: "" }))
  };

const camelCaseToSpaceSeparated=(value:string) =>{
    return value
      .replace(/([A-Z])/g, ' $1') 
      .trim() 
      .split(' ') 
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
      .join(' ');
  }

  const getColumnConfigurations=() => {
    const tableColumns: CustomGridColDef[] =[]

     selectedColumns.forEach((selectedColumn: ColumnType) => {
      if(selectedColumn.columnName!=="datetime"){
        const newColumn= {
          field: selectedColumn.columnName,
          headerName: camelCaseToSpaceSeparated(selectedColumn.columnName),
          width: 150, 
          sortable: false,
          tableName:selectedColumn.tableName
        }
        tableColumns.push(newColumn)
      }
    }
    );
  
    if (selectedColumn?.columnName === 'datetime') {

      tableColumns.push({
        field: `dateTime`,
        headerName: `Date`,
        width: 160,
        sortable: false,
        tableName:selectedColumn.tableName,
        valueGetter: (params) => 
        params.row.datetime,
        filterOperators: [
          {
            
            label: 'Equals',
            value: 'equals',
            getApplyFilterFn: (filterItem) => {
                return null;              
            },
            InputComponent: (props) => {
              return (
                <>
                <CustomDatePicker
                label="Start Date"
                className="placeholder-label"
                
                value={startDateFilter || null}
                size="small"
                sx={{ width: 100, paddingRight: 2 }}
                onChange={(value: Dayjs) => {
                  if(value){
                  setStartDateFilter(value)
                  setEndDateFilter(null);
                 }
                  }
                }
              />
              <CustomDatePicker
                  label="End Date"
                  className="placeholder-label"
                  value={endDateFilter || null} 
                  size="small"
                  sx={{ width: 100 }}
                  onChange={(value: Dayjs) =>{
                    if(value)
                    setEndDateFilter(value)
                  }
                  }
                  minDate={startDateFilter}
                />

                <CustomButton
                      label="Apply"
                      size="small"
                      className="primary_btns mr-10"
                      onClick={()=>handleDateApplyFilter(props.tableName)}
                    />
                </>

              );
            },
          },
        ],
      });

     

      tableColumns.push({
        field: `startTime`,
        headerName: `Start Time`,
        width: 160,
        sortable: false,
        tableName:selectedColumn.tableName,
        valueGetter: (params) => params.row.startTime, // Assuming 'datetime' holds the time in "hh:mm AM/PM"
        // Define custom filter operators for Start Time
        filterOperators: [
          {
            label: 'Equals',
            value: 'equals',
            getApplyFilterFn: (filterItem) => {
                return null;              
            },
            InputComponent: (props) => {
              return (
                <>
                <CustomTimePicker
                  label="Start Time"
                  size="small"
                  className="placeholder-label"
                  style={{ width: 150 }}
                  value={startTime}
                  minutesStep={15}
                  onChange={(value: Dayjs) => {
                   
                    setStartTime(value);
                  }}
                />
                
                <CustomButton
                      label="Apply"
                      size="small"
                      className="primary_btns mr-10"
                      onClick={()=>handleStartTimeFilter(props.tableName)}
                    />
                 
                </>
              );
            },
          },
        ],
      });
  
      // End Time column
      tableColumns.push({
        field: `endTime`,
        headerName: `End Time`,
        width: 160,
        sortable: false,
        tableName:selectedColumn.tableName,
        valueGetter: (params) => params.row.startTime, 
        filterOperators: [
          {
            label: 'Equals',
            value: 'equals',
            getApplyFilterFn: (filterItem) => {
                return null;              
            },
            InputComponent: (props) => {
              return (
                <>
                <CustomTimePicker
                  label="End Time"
                  size="small"
                  value={endTime}
                  className="placeholder-label"
                  style={{ width: 150 }}
                  minutesStep={15}
                  onChange={(value: Dayjs) => {
                    setEndTime(value)
                  }}
                />
                  
                  <CustomButton
                      label="Apply"
                      size="small"
                      className="primary_btns mr-10"
                      onClick={()=>handleEndTimeFilter(props.tableName)}
                    />
                </>
              );
            },
          },
        ],
      });
  
      tableColumns.push({
        field: `timeZone`,
        headerName: `Time Zone`,
        tableName:selectedColumn.tableName,
        width: 160,
        sortable: false,
      });
    }
  
    return tableColumns.length ? tableColumns : []; 
  }
  
  const columns: CustomGridColDef[] = getColumnConfigurations()
  


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
        <div className="page-wrapper srch_rpt_page">
          <h1 className="mb-30">Search result for End User Report</h1>

          <div className="slct_evnt_tmp">
                                <div className="input-label">
                                    <TempIcon />
                                    <span className="ml-10">Add Column</span>
                                    <span className="arw_icn">
                                        <DropdownIcon />
                                    </span>
                                </div>
                               
                                    <CustomAutocomplete
                                        label=''
                                        options={openAvailabilityReportsSchema?.data || []}
                                        groupBy={option => {
                                          return option.tableName
                                        }}
                                        getOptionLabel={option => option.columnName}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, selectedValue) => {
                                          setSelectedColumn(selectedValue)
                                          setSelectedColumns((previousColumns:ColumnType[])=>[...previousColumns,selectedValue])
                                          setParams((prevParams: OpenAvailabilityParamsType) => {
                                            const currentTableData = prevParams.tableData[selectedValue.tableName];
                                          
                                            // Create a new attributes array, or an empty array if currentTableData is undefined
                                            const newAttributes = currentTableData
                                              ? [...currentTableData.attributes, selectedValue.columnName] 
                                              : [selectedValue.columnName];
                                          
                                            const modifiedResult: OpenAvailabilityParamsType = {
                                              ...prevParams,
                                              tableData: {
                                                ...prevParams.tableData,
                                                [selectedValue.tableName]: {
                                                  ...currentTableData, // Spread existing table data
                                                  attributes: newAttributes, // Use the new attributes array
                                                },
                                              },
                                            };
                                          
                                            return modifiedResult; // Return the modified result
                                          });
                                          
                                        }}
                                        disableClearable
                                    />
                            </div>

          {/* <div className="history-filter-panel table_filter d-flex">
            <CustomAutocomplete
              label="Tag Name"
              className="primary-dropdown-bg"
              options={openAvailabilityTag?.data?.filter((option: OpenAvailabilityTagOptionProps) => option.isDeleted === null) || []}
              getOptionLabel={(option: OpenAvailabilityTagOptionProps) => option?.tagName || ""}
              sx={{ width: 300, my: 1, ml: 1 }}
              disableClearable={true}
              onChange={handleTagChange}
              value={selectedTag || {}}
              
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
                onClick={()=>{
                  //
                }}
              />
              <CustomButton
                label="Clear"
                size="small"
                variant="outlined"
                className="secondary_btns"
                onClick={handleClearFilter}
              />    
            </div>

          </div> */}
          <div className="card-box">
            <div className="history-table-wrapper">
              <CustomDataGrid
               rows={data?.data || []}
                pagination
                columns={columns}
                isRowSelectable={()=>false}
                filterMode="server"
                // disableColumnMenu={true}
                rowCount={data?.totalCount || 0}
                paginationModel={{ page: params.page, pageSize: params.pageSize }}
                paginationMode="server"
                pageSizeOptions={[20, 50, 100]}
                loading={isOpenAvailabilityReportsLoading}
                onPaginationModelChange={handlePagination}
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  setRowSelectionModel(newRowSelectionModel);
                }}
                // sortModel={[{ field: `date`, sort: params?.sortingOrder as GridSortDirection }]}
                sortingOrder={["desc", "asc"]}
                sortingMode="server"
                onSortModelChange={handleSortModelChange}
                slots={{ pagination: CustomPagination }}
                onFilterModelChange={(model)=>{

                  console.log(model,"model")
                  //
                }}
              />
            </div>
          </div>
        </div>
    

    </>
  );
};

export default OpenAvailabilitySlotBroadcast;
