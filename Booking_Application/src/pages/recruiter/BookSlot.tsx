import React, { useContext, useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import CustomDatePicker from "../../components/CustomDatePicker";
import { GridColDef, GridPagination, GridPaginationModel, GridRowSelectionModel, GridSortDirection, GridSortModel } from "@mui/x-data-grid";
import request from "../../services/http";
import { GET_SKILLS, GET_SECONDARY_SKILLS, GET_ZOHO_FORMS, GET_SECONDARY_SKILLS_ALL, BOOK_CONFIRMED_SLOT } from "../../constants/Urls";
import { BOOK_SLOT } from "../../constants/Urls";
import { GET_AVAILABLE_SLOTS } from "../../constants/Urls";
import { useMutation, useQuery, useQueryClient } from "react-query";
import CustomDataGrid from "../../components/CustomDataGrid";
import CustomButton from "../../components/CustomButton";
import dayjs, { Dayjs } from "dayjs";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import CustomTextField from "../../components/CustomTextField";
import Radio from "@mui/material/Radio";
import moment from "moment-timezone";
import Loader from "../../components/Loader";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import CustomCheckBox from "../../components/CustomCheckbox";
import CustomRadioButton from "../../components/CustomRadioGroup";
import { AuthContext } from "../../context/auth/AuthContext";
import CreateNewEvent from "../CreateNewEvent";
import CreateNewEventAdvanceView from "../CreateNewEventAdvanceView";
import { SECTION_TITLES } from '../../constants/Title';


interface PrimarySkillsProps {
  id: number;
  skillName: string;
}

interface SecondarySkillsProps {
  id: number;
  secondarySkillName: string;
}

interface InterviewStatusProps {
  id: number;
  interviewStatus: string;
}

interface ZohoFormProps {
  id: number;
  formName: string;
  link: string;
}

interface FormDataProps {
  candidateEmail: string;
  interviewStatus: InterviewStatusProps;
  zohoFormLink: ZohoFormProps;
}

interface EventProps {
  startTime: string;
  endTime: string;
}

const BookSlot = () => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const queryClient = useQueryClient();
  const columns: GridColDef[] = [
    {
      field: "radiobutton",
      headerName: "",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Radio checked={rowSelectionModel[0] === params.id} value={params.id} />
      )
    },
    // {
    //   field: "id",
    //   headerName: "S No.",
    //   width: 90,
    //   sortable: false,
    // },
    {
      field: "date",
      headerName: `Date_${default_timeZone_abbr}`,
      width: 150,
    },
    {
      field: "time",
      headerName: `Time_${default_timeZone_abbr}`,
      width: 150,
      sortable: false,
    },
    {
      field: "tpId",
      headerName: "TP ID",
      width: 150,
      sortable: false,
    },
    {
      field: "skillName",
      headerName: "All Skills",
      width: 150,
      sortable: false,
    },
    {
      field: "secondarySkillName",
      headerName: "All Secondary Skills",
      width: 150,
      sortable: false,
    },
  ];
  const [file, setFile] = useState<File | null>(null);
  const [showSearchedSlots, setShowSearchedSlots] = useState<boolean>(false);
  const [primarySkills, setPrimarySkills] = useState<PrimarySkillsProps[]>();
  const [secondarySkills, setSecondarySkills] = useState<SecondarySkillsProps[]>([]);
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  // const [endDateDisabled, setEndDateDisabled] = useState<boolean>(true);
  const [searchSlotDisabled, setSearchSlotDisabled] = useState<boolean>(true);
  const [resetButtonDisabled, setResetButtonDisabled] = useState<boolean>(true);
  const [params, setParams] = useState({
    page: 0,
    pageSize: 20,
    sortingColumn: "datetime",
    sortingOrder: "asc"
  });

  const [selectedRowData, setSelectedRowData] = useState<{ datetime: string | undefined } | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newDatetime, setNewDatetime] = useState('');
  const [formData, setFormData] = useState<FormDataProps>();
  const [sendFormToTP, setSendFormToTP] = useState<boolean>(false)
  const [sendFormToCandidate, setSendFormToCandidate] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState('or');
  const [openExistingSlotDialog, setOpenExistingSlotDialog] = useState<boolean>(false)
  const [existingEvents, setExistingEvents] = useState<EventProps[]>([]);
  const [isFormSelected, setIsFormSelected] = useState<boolean>(false)

  const handleConfirmation = () => {
    setOpenDialog(false);
    if (formData) {
      handleFileAndMutate({
        datetime: newDatetime,
        formData,
        confirm: false
      });
    } else {
      console.error('FormData is null or undefined');
    }
  };

  const handleBookingConfirmation = () => {
    let datetime = selectedRowData?.datetime || ""
    setOpenExistingSlotDialog(false);
    if (formData) {
      handleFileAndMutate({
        datetime: datetime,
        formData,
        confirm: true
      });
    } else {
      console.error('FormData is null or undefined');
    }
  };

  const { data: primarySkillsData, isLoading: skillsLoading, isError: skillsError } = useQuery('skills', () => request(GET_SKILLS));

  const { data: secondarySkillsData, isLoading: secondarySkillsLoading, isError: secondarySkillsError } = useQuery(['secondarySkills'], () => request(GET_SECONDARY_SKILLS_ALL));

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  function handleFileAndMutate({
    datetime,
    formData,
    confirm
  }: {
    datetime: string;
    formData: FormDataProps;
    confirm: boolean;
  }) {
    const commonPayload = {
      id: rowSelectionModel[0],
      datetime: datetime,
      booked: true,
      interviewStatus: 'Invite Sent',
      zohoFormLink: formData?.zohoFormLink?.link,
      skills: primarySkills?.map((item) => item.id),
      secondarySkills: secondarySkills?.map((item) => item.id),
      candidateEmail: formData?.candidateEmail,
      sendFormToCandidate,
      sendFormToTP
    };
    const handleMutation = (fileObject?: { originalName: string; fileData: string }) => {
      if(dayjs(datetime).isAfter(dayjs())){
        const payload = { ...commonPayload, attachments: fileObject };
        if (confirm) {
          bookConfirmedSlot(payload);
        } else {
          mutate(payload);
        }
      }else{
        showToast(ToastActionTypes.ERROR, 'Selected datetime is in the past. Please Select another Slot');
        queryClient.invalidateQueries("availableSlots");
      }
      // const payload = { ...commonPayload, attachments: fileObject };
      // if (confirm) {
      //   bookConfirmedSlot(payload);
      // } else {
      //   mutate(payload);
      // }
    };

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const fileDataUrl = reader.result as string;

        // Extract base64 data
        const base64Data = fileDataUrl.split(',')[1];

        const fileObject = {
          originalName: file.name,
          fileData: base64Data
        };

        handleMutation(fileObject);
      };
      reader.onerror = (error) => {
        console.error('Error occurred while reading the file:', error);
      };
    } else {
      handleMutation();
    }
  }

  const { mutate: bookConfirmedSlot, isLoading: bookConfirmedSlotLoading } = useMutation((body: object) => request(BOOK_CONFIRMED_SLOT, "post", body), {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setRowSelectionModel([])
      queryClient.invalidateQueries('availableSlots')
    }
  });

  // const { mutate } = useMutation((body: object) => request(BOOK_SLOT, "post", body, {'Content-Type': 'multipart/form-data'}));
  const { mutate, isLoading: bookSlotLoading } = useMutation((body: object) => request(BOOK_SLOT, "post", body), {
    onSuccess: (data) => {
      if (data && data.datetime) {
        // const localDatetime = dayjs(data.datetime).tz(current_timeZone).format('YYYY-MM-DD HH:mm:ss');
        setNewDatetime(data.datetime);
        setOpenDialog(true)
      } else if (data && data.existingEvents) {
        setExistingEvents(data.existingEvents)
        setOpenExistingSlotDialog(true)
      } else if(data && data?.isBooked){
        showToast(ToastActionTypes.ERROR, data?.message)
        setRowSelectionModel([])
        queryClient.invalidateQueries('availableSlots')
      }else {
        showToast(ToastActionTypes.SUCCESS, data?.message)
        setRowSelectionModel([])
        queryClient.invalidateQueries('availableSlots')
      }
    },
    // onError

  });

  useEffect(() => {
    const isSearchSlotDisabled = !!primarySkills?.length
    setSearchSlotDisabled(isSearchSlotDisabled)
    // if (startDateFilter && !isSearchSlotDisabled) {
    //   setEndDateDisabled(false);
    //   setSearchSlotDisabled(!endDateFilter)
    // }
  }, [startDateFilter, endDateFilter, primarySkills]);


  const { data: availableSlotsData, isLoading, isFetching } = useQuery(["availableSlots",default_timeZone, params], () => request(GET_AVAILABLE_SLOTS, 'get', {
    primarySkillsId: primarySkills?.map((item) => item.id),
    secondarySkillsId: secondarySkills?.map((item) => item.id),
    startDateFilter: startDateFilter && dayjs.tz(startDateFilter?.format("YYYY-MM-DD"), default_timeZone).utc().toISOString(),
    endDateFilter: endDateFilter && dayjs.tz(endDateFilter?.format("YYYY-MM-DD"),default_timeZone).add(23, 'hour').add(59, 'minutes').utc().toISOString(),
    logicalOperator: selectedOption,
    timeZone: default_timeZone,
    ...params
  }),
    {
      enabled: showSearchedSlots,
      select: (data) => {
        const DATA = data.data?.map((item: any) => ({
          ...item,
          date: dayjs(item.datetime).tz(default_timeZone).format("DD-MM-YYYY"),
          time: dayjs(item.datetime).tz(default_timeZone).format("h:mm A"),
          username: item.user.username,
          skillName: item.user.skills?.map((skill: { skillName: string }) => skill.skillName).join(','),
          secondarySkillName: item.user.secondarySkills?.map((secondarySkill: { secondarySkillName: string }) => secondarySkill.secondarySkillName).join(',')
        }));
        return { availableSlotsData: DATA, totalCount: data?.totalItems };
      },
    }
  );

  const { data: zohoFormData, isLoading: zohoFormLoading } = useQuery('ZohoFormData', () => request(GET_ZOHO_FORMS, 'get', { primarySkillIds: primarySkills?.map(skill => skill.id) }), {
    enabled: showSearchedSlots,
  });

  const { handleSubmit, control, resetField, formState: { errors } } = useForm<FormDataProps>();


  const onSubmit: SubmitHandler<any> = async (data) => {
    let datetime = selectedRowData?.datetime || ""
    handleFileAndMutate({
      datetime,
      formData: data,
      confirm: false
    });
    setFormData(data)
  };

  const handlePagination = (pageInfo: GridPaginationModel) => {
    setParams((prev) => ({ ...prev, ...pageInfo }))
  }

  const handleSortModelChange = (sortInfo: GridSortModel) => {
    setParams((prev) => ({ ...prev, sortingOrder: sortInfo[0].sort as string }))
  };

  const CustomPagination = () => {
    const pageCount = Math.ceil(availableSlotsData?.totalCount / params.pageSize) || 1;
    return (
      <div style={{
        display: "flex", marginRight: 20, justifyContent: "flex-start", alignItems: "center"
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

  const handleResetButton = () => {
    setPrimarySkills([])
    setSecondarySkills([])
    setStartDateFilter(null)
    setEndDateFilter(null)
    setResetButtonDisabled(true)
  }
  useEffect(() => {
    if (primarySkills?.length || secondarySkills.length || endDateFilter || startDateFilter) {
      setResetButtonDisabled(false)
    }
  }, [startDateFilter, endDateFilter, primarySkills, secondarySkills]);

  return (
    <>
      {bookSlotLoading && <Loader />}
      <div className="bookslot_tab-panel"
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {!showSearchedSlots ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <CustomAutocomplete
              label="Select Primary Skillset"
              options={primarySkillsData?.data}
              getOptionLabel={(skillOptions: PrimarySkillsProps) =>
                skillOptions.skillName
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={primarySkills || []}
              onChange={(_, selectedValue) => {
                (selectedValue.length <= 5 && setPrimarySkills(selectedValue))
                resetField('zohoFormLink');
              }}
              multiple={true}
              size="small"
              fullWidth
              className="red-bg primary-skills-dropdown"
           />
            <div style={{ display: "flex", marginTop: 15 }}>
              <CustomRadioButton
                label="Choose Option"
                options={[
                  { value: 'or', label: 'Or' },
                  { value: 'and', label: 'And' },
                ]}
                value={selectedOption}
                onChange={(e) => {
                  setSelectedOption(e.target.value)
                }}
              />
            </div>
            <div style={{ display: "flex", marginTop: 15 }}>
              <CustomAutocomplete
                label="Select Secondary Skillset"
                options={secondarySkillsData?.data || []}
                getOptionLabel={(skillOptions: SecondarySkillsProps) =>
                  skillOptions.secondarySkillName
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={secondarySkills || []}
                onChange={(_, selectedValue) => selectedValue.length <= 5 && setSecondarySkills(selectedValue)}
                multiple={true}
                size="small"
                fullWidth
                className="red-bg"
             />
            </div>
            <div style={{ display: "flex", marginTop: 8, flexWrap: "wrap", gap: 10 }}>
              <CustomDatePicker
                label="Start Date"
                size="small"
                className="primary-border bottom-border-dropdown"
                sx={{ width: 200 }}
                value={startDateFilter || null}
                onChange={(value: Dayjs) => {
                  setStartDateFilter(value)
                  if (endDateFilter && value > endDateFilter) {
                    setEndDateFilter(null);
                  }
                }
                }
                disablePast={true}
                // minDate={dayjs().tz(default_timeZone).tz(system_timeZone, true)}
              />
              <CustomDatePicker label="End Date" size="small" sx={{ width: 200 }}
                className="primary-border bottom-border-dropdown"
                value={endDateFilter || null}
                onChange={(value: Dayjs) => {
                  setEndDateFilter(value)
                }
                }
                disablePast={true}
                // disabled={endDateDisabled}
                minDate={dayjs.tz(startDateFilter?.format("YYYY-MM-DD"), default_timeZone)}
              />
            </div>
            <div className="skills-filter-act" style={{ display: "flex", marginTop: 25, flexWrap: "wrap", justifyContent: "flex-start" }}>
              <CustomButton
                label="Apply"
                size="small"
                className="primary_btns apply-btn"
                onClick={() => {
                  if (searchSlotDisabled) {
                    setShowSearchedSlots(true);
                  }
                }}
              // disabled={searchSlotDisabled}
              />
              <CustomButton
                label="Reset"
                size="small"
                className="secondary_btns reset-btn"
                onClick={() => {
                  handleResetButton()
                }}
                disabled={resetButtonDisabled}
              />
            </div>
          </div>
        ) :
          (
            <div className="book_slot_table" style={{ display: "flex", marginTop: 15, flexWrap: "wrap" }}>
              <Stack direction="row" sx={{ display: "flex", flexWrap: "wrap" }}>
                {primarySkills?.map((primarySkills) => (
                  <Chip
                    key={primarySkills.id}
                    label={primarySkills.skillName}
                    size="small"
                    className="primary-skills-label"
                    sx={{ minWidth: 80, marginRight: 1, marginBottom: 2 }}
                  />
                ))}
                {secondarySkills?.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.secondarySkillName}
                    size="small"
                    className="secondary-skills-label"
                    sx={{ minWidth: 80, marginRight: 1, marginBottom: 2 }}
                  />
                ))}
              </Stack>

              <CustomDataGrid
                rows={availableSlotsData?.availableSlotsData || []}
                columns={columns}
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newRowSelectionModel, date) => {
                  setRowSelectionModel(newRowSelectionModel);
                  const selectedRow = availableSlotsData?.availableSlotsData.find((row: any) => row.id === newRowSelectionModel[0]);
                  setSelectedRowData(selectedRow);
                }}
                disableColumnMenu={true}
                loading={isLoading || isFetching}
                rowCount={availableSlotsData?.totalCount || 0}
                paginationModel={{ page: params.page, pageSize: params.pageSize }}
                paginationMode="server"
                pageSizeOptions={[20, 50, 100]}
                onPaginationModelChange={handlePagination}
                sortingOrder={['desc', 'asc']}
                sortingMode="server"
                onSortModelChange={handleSortModelChange}
                sortModel={[{ field: `date`, sort: params.sortingOrder as GridSortDirection }]}
                slots={{ pagination: CustomPagination }}
              />

              <form onSubmit={handleSubmit(onSubmit)} className="w-100">
                <div className="mr-25">
                  <Controller
                    name="candidateEmail"
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
                        label="Candidate Email"
                        sx={{ width: 300, my: 1 }}
                        onChange={onChange}
                        value={value || ""}
                        error={!!errors.candidateEmail}
                        helperText={errors.candidateEmail?.message}
                      />
                    )}
                  />
                </div>
                <div className="mr-25">
                  <Controller
                    name="zohoFormLink"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        options={zohoFormData?.data}
                        getOptionLabel={(zohoFormOptions: ZohoFormProps) =>
                          zohoFormOptions.formName
                        }
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={value || null}
                        label="Send Form"
                        sx={{ width: 300, my: 1 }}
                        onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                        }}
                        onInputChange={(_: any, value: string) => {        // for getting free text input value
                          onChange({ formName: value, link: value });
                          value ? setIsFormSelected(true) : setIsFormSelected(false)
                        }}
                        freeSolo={true}
                      />
                    )}
                  />
                </div>
                <div className="w-100 mr-25 mt-20 mb-20">
                  <input type="file" id="fileInput" onChange={handleFileChange}></input>
                </div>
                {isFormSelected ?
                  <>
                    <div className="mr-25">
                      <CustomCheckBox label="Zoho form send to TP" onChange={(e: any, v: boolean) => setSendFormToTP(v)} />
                    </div>
                    <CustomCheckBox label="Zoho form send to Candidate" onChange={(e: any, v: boolean) => setSendFormToCandidate(v)} />
                  </>
                  :
                  <></>
                }
                <div className="w-100" style={{ display: 'flex', marginTop: '20px' }}>
                  <CustomButton
                    label={"Back"}
                    className="secondary_btns"
                    sx={{ my: 1, marginRight: '10px' }}
                    onClick={() => setShowSearchedSlots(false)}
                  />
                  <CustomButton
                    type="submit"
                    className="primary_btns"
                    label="Book Slot"
                    sx={{ my: 1 }}
                    disabled={rowSelectionModel.length === 0}
                  />
                </div>
              </form>
            </div>
          )}
      </div>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Slot Timings Changed</DialogTitle>
        <DialogContent>
          <p>Selected Slots timings were changed. Do you want to continue with new timing?</p>
          {newDatetime && <p>New Slot timining: {dayjs(newDatetime).tz(default_timeZone).format('YYYY-MM-DD HH:mm:ss')}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmation} color="primary" autoFocus>
            Continue
          </Button>
          <Button onClick={() => setOpenDialog(false)} color="primary">
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
        <DialogTitle id="alert-dialog-title">Slot Timings Changed</DialogTitle>
        <DialogContent>
          <p>You already have an existing event at this Slot. Do you still wish to continue?</p>
          {existingEvents.map((item) => (
            <li key={`${item.startTime}`}>
              {`Start Time: ${dayjs(item.startTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')} - End Time: ${dayjs(item.endTime).tz(default_timeZone).format('DD-MM-YYYY h:mm A')}`}
            </li>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingConfirmation} color="primary" autoFocus>
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

export default BookSlot;
