

// const CreateTag = (props:CreateUserProps ) => {
// };

// export default CreateTag;
import React, { FC, SyntheticEvent, useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DELETE_OPEN_AVAILABILITY_TAG, EDIT_OPEN_AVAILABILITY_TAG, GET_CITIES, GET_COUNTRIES, GET_GENERAL_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS, GET_OPEN_AVAILABILITY_TAG, GET_PREDEFINED_MEETS_TYPES, GET_QUESTIONS, GET_STATES, GET_USER_EMAILS, SAVE_OPEN_AVAILABILITY_TAG } from "../constants/Urls";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import CustomButton from "../components/CustomButton";
import request from "../services/http";
import CustomAutocomplete from "../components/CustomAutocomplete";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { useEventTypes } from "../hooks/useEventTypes";
import CustomCheckBox from "../components/CustomCheckbox";
import UpgradePopup from "./UpgradePopup";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import AddIcon from "../styles/icons/AddIcon";
import CustomRichTextEditor from "../components/CustomRichTextEditor";
import EditIcon from '@mui/icons-material/Edit';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { Avatar, Dialog, DialogContent } from "@mui/material";
import { SERVER_URL } from "../services/axios";
import ImageCropper from "./ImageCropper";
import CloseIcon from "@mui/icons-material/Close";
import AddQuestion from "./AddQuestion";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface TagFormInputProps {
  tagName: string;
  openAvailabilityText: string;
  defaultEmail: string;
  template: any;
  membersAddedByAdmin: any;
  isAllowedToAddAttendees: boolean;
  groups: any[];
  newTemplate: string;
  questions: any[];
  image: any;
  title: any;
  showCommentBox: boolean;
  duration: any;
  customDuration: any;
  meetType: any;
  address: string;
  emailVisibility: boolean
  isPrimaryEmailTag: boolean;
  houseNo: string;
  houseName: string;
  street: string;
  area: string;
  country: any;
  state: any;
  city: any;
  pincode: string;
  landmark: string;
  mapLink: string;
}

const Durations = [{label: '15 Mins', value: 15}, {label: '30 Mins', value: 30}, {label: '45 Mins', value: 45}, {label: 'Custom', value: 'custom'}]
const CustomDurations = [{label: '1 hr', value: 60},{label: '1.5 hrs', value: 90},{label: '2 hrs', value: 120},{label: '2.5 hrs', value: 150},{label: '3 hrs', value: 180},{label: '3.5 hrs', value: 210},{label: '4 hrs', value: 240},]

const CreateTag: FC<{view: number, formData: any}> = ({view, formData}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {data: eventTypes, isLoading} = useEventTypes()
  const [openUpgradePopup, setOpenUpgradePopup] = useState(false)
  const [textCount, setTextCount] = useState('')
  const [tagNameLength, setTagNameLength] = useState('')
  const [memberOptions, setMemberOptions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Cropped image as string | null
  const [titleCount, setTitleCount] = useState('')
  const [isDeleteImage, setIsDeleteImage] = useState(false)
  const [openAddQuestionDialog, setOpenAddQuestionDialog] = useState(false)

  const queryClient = useQueryClient()

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TagFormInputProps>({mode: 'onChange'});

  const {data: meetTypes} = useQuery('predefined-meet-types', () => request(GET_PREDEFINED_MEETS_TYPES))

  useEffect(() => {
    if (formData) {
    const duration = Durations.find(i => i.value === formData?.eventDuration) 
    setTextCount(formData?.openAvailabilityText);
    setTitleCount(formData?.title)
    setTagNameLength(formData?.tagName)
    setMemberOptions(formData?.tagMembers || [])
    setSelectedQuestion(formData?.openAvailabilityQuestions?.map((i:any) => ({...i, required: i?.open_availability_question?.required || false})))
    setValue('image', formData.image)
    console.log(meetTypes?.data?.filter((i: any) => i.id === formData.meetType)[0])
    reset({
      ...formData, 
      template: formData?.templateData, 
      membersAddedByAdmin: formData?.tagMembers || [],
      newTemplate: formData?.template,
      questions: formData?.openAvailabilityQuestions,
      duration: duration || {label: 'Custom', value: 'custom'},
      customDuration: CustomDurations.find(i => i.value === formData?.eventDuration),
      meetType: meetTypes?.data?.filter((i: any) => i.id === formData.meetType)[0],
      state: formData?.stateDetails,
      city: formData?.cityDetails,
      country: formData?.countryDetails
    })
  }
  }, [formData, meetTypes]);
  const {data: groupsData } = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"), {
    enabled: view === 1
  })
  const { data: questionsData } = useQuery('questions', () => request(GET_QUESTIONS))
  let QUESTIONS = questionsData?.data?.filter((item:any) => !item.question.includes('#Duplicate')) || []
  const { mutate } = useMutation((body: object) => request(SAVE_OPEN_AVAILABILITY_TAG, "post", body, { headers: { 'Content-Type': 'multipart/form-data' } }), {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data?.message)
      queryClient.invalidateQueries('openAvailabilityTags');
      // navigate('/add-new-tag')
      navigate('/add-new-tag', {state: {from: location.state?.from}})
    },
    onError: (error: any) => {
      const errorObject = error?.response.data
      if(errorObject?.subscriptionError) {
          setOpenUpgradePopup(true)
      }
      showToast(ToastActionTypes.ERROR, errorObject.message)
    }
  });
  const { mutate: editOpenAvailabilityTag } = useMutation((body: object) => request(EDIT_OPEN_AVAILABILITY_TAG, "post", body, { headers: { 'Content-Type': 'multipart/form-data' } }), {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data?.message)
      queryClient.invalidateQueries('openAvailabilityTags');
      navigate('/add-new-tag', {state: {from: location.state?.from}})
    }
  });

  const { data: emailData }: any = useQuery(['user-emails'], () => request(GET_USER_EMAILS), {
    select: ({ data }) => {
      const emails = []
      if (data?.email) emails.push(data?.email)
      if (data?.email2) emails.push(data?.email2)
      if (data?.email3) emails.push(data?.email3)
      return emails
    }
  })
  const { data: templatesData } = useQuery('general-templates', () => request(`${GET_GENERAL_TEMPLATES}?type=response`))
  const { data } = useQuery('openAvailabilityTags', () => request(GET_OPEN_AVAILABILITY_TAG))
  const isOptionDisabled = (option: any) => {
    return data?.data.some((item: any) => item.defaultEmail === option);
  };
  const { data: countriesData, isLoading: countriesLoading, isError: countriesError } = useQuery('countries', () => request(GET_COUNTRIES), {
    enabled: watch('meetType')?.id === 3
  });
  const selectedCountry = watch('country');
  const { data: statesData } = useQuery(['states',selectedCountry], () => request(GET_STATES, 'get', {selectedCountry}), {
    enabled: !!selectedCountry
  });
  const selectedState = watch('state'); // Watch for state selection

  const { data: citiesData } = useQuery(['cities', selectedState], () => request(GET_CITIES, 'get', {selectedState}), {
    enabled: !!selectedState
  });

  const convertBlobUrlToFile = async (blobUrl: string): Promise<File | null> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting Blob URL to File:', error);
      return null;
    }
  };

  
  const onSubmit: SubmitHandler<TagFormInputProps> = async (data) => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(formData);
  
    if (hasChanges) {
      try {
        // Convert croppedImage blob URL to File if it's not null
        const imageFile = croppedImage ? await convertBlobUrlToFile(croppedImage) : null;
  
        const payload = {
          ...data,
          template: data.newTemplate,
          eventTypeId: view === 0 ? eventTypes?.data[0].id : eventTypes?.data[3].id,
          membersAddedByAdmin: view === 0 ? [] : data.membersAddedByAdmin?.map((i: any) => i.id),
          isAllowedToAddAttendees: view === 0 ? false : data.isAllowedToAddAttendees,
          questions: selectedQuestion.map((item: any) => ({ questionId: item.id, required: item.required })),
          image: imageFile,
          meetType: data.meetType?.id,
          state: data?.state?.id,
          city: data?.city?.id,
          country: data?.country?.id
        };

        if(watch('defaultEmail') === emailData?.[0]) {
          payload.duration = data.duration.value !== 'custom' ? data.duration.value : data.customDuration.value,
          payload.isPrimaryEmailTag = true
        }
        else {
          payload.duration = 30
        }
  
        if (formData) {
          editOpenAvailabilityTag({...payload, isImageDelete: (watch('image') ? false : isDeleteImage) });
        } else {
          mutate(payload);
        }
      } catch (error) {
        console.error('Error in onSubmit:', error);
      }
    } else {
      showToast(ToastActionTypes.ERROR, "No Changes Found");
    }
  };
  

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="tag-popup-inner">
      
      {isLoading && <Loader />}
      
      <form className="add-tag-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <div className="d-flex justify-between align-center w-100 mb-30">
          <div className="w-32">
            <label className="input-label">Tag {`${tagNameLength?.length || 0}/30`} Characters</label>
            <Controller
              name="tagName"
              control={control}
              rules={{ 
                required: "This field is required",
                validate: (value) => {
                  const trimmed = value.trim();
                  if (trimmed === "") return "This field is required";
                  if (/\s/.test(trimmed)) return "Spaces are not allowed";
                  return true;
                }
              }}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  label=""
                  onChange={(e) => {
                    onChange(e);
                    setTagNameLength(e.target.value);
                  }}
                  value={value || ""}
                  error={!!errors.tagName}
                  fullWidth
                  helperText={errors.tagName?.message}
                  inputProps={{ maxLength: 30 }} 
                />
              )}
            />
          </div>

          <div className="w-32">
            <Controller
              name="defaultEmail"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                  label='Select Email'
                  options={emailData}
                  isOptionEqualToValue={(option, value) => option == value}
                  onChange={(_, selectedValue) => {
                    onChange(selectedValue);
                    setValue('duration', null)
                    setValue('customDuration', null)
                  }}
                  value={(value || null) as any}
                  error={!!errors.defaultEmail}
                  helperText={errors.defaultEmail?.message}
                  disabled={!!formData}
                  // getOptionDisabled={option => isOptionDisabled(option)}
                />
              )}
            />
          </div>
          <div className="w-32">
            <Controller
              name="template"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                  label='Select Template'
                  options={templatesData?.data || []}
                  groupBy={option => option?.group}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, selectedValue) => {
                    onChange(selectedValue);
                    setValue('newTemplate', selectedValue?.template || '')
                  }}
                  value={value || null}
                  disableClearable
                />
              )}
            />
          </div>
        </div>
        { view === 1 &&
          <div className="d-flex flex-row justify-between mb-30">
            <div className='w-49 mr-20'>
              <Controller
                name="groups"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                  options={groupsData?.data || []}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  multiple
                  onChange={(e,v) => {
                      onChange(v)
                      const members = v.flatMap((item:any) => item.groupMembers) || []
                      const removedDuplicates = members.reduce((accumulator: any, current: any) => {
                          if (!accumulator.some((item: any) => item.id === current.id)) {
                          accumulator.push(current);
                          }
                          return accumulator;
                      }, []);
                      setValue('membersAddedByAdmin', removedDuplicates)
                      setMemberOptions(removedDuplicates)
                  }}
                  value = {value || []}
                  label="Existing Groups"
                  limitTags={2}
                  />
                )}
              />
            </div>
            <div className="w-49">
              <Controller
                name="membersAddedByAdmin"
                control={control}
                rules={{required: "This field is required"}}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                    label='Members'
                    options={memberOptions}
                    getOptionLabel={option => `${option.id} - ${option.fullname}`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, val) => {
                      onChange(val)
                    }}
                    multiple
                    value={value || []}
                    error={!!errors.membersAddedByAdmin}
                    helperText={errors?.membersAddedByAdmin?.message as string}
                  />
                )}
              />
            </div>
            <div className="w-32">
              <Controller
                name="isAllowedToAddAttendees"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomCheckBox
                    label="Allow Outside user to add Attendees"
                    onChange={onChange}
                    checked={value || false}
                  />
                )}
              />
            </div>
          </div>
        }

        <div className="w-100 mb-30">
          <label className="input-label">Text {`${textCount?.length || 0}/255`} Characters</label>
          <Controller
            name="openAvailabilityText"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.openAvailabilityText}
                helperText={errors.openAvailabilityText?.message}
                inputProps={{ maxLength: 255 }}
                onInput={(e: any) => setTextCount(e.target.value)}
              />
            )}
          />
        </div>
        <div className="w-100 mb-30">
          <label className="input-label">Title {`${titleCount?.length || 0}/30`} Characters</label>
          <Controller
            name="title"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.title}
                helperText={errors.title?.message as string}
                inputProps={{ maxLength: 30 }}
                onInput={(e: any) => setTitleCount(e.target.value)}
              />
            )}
          />
        </div>
        <div className="w-100 mb-30">
            <Controller
              name="showCommentBox"
              control={control}
              render={({ field: { onChange,value } }) => (
                <CustomCheckBox
                  label="Show Comment Box"
                  onChange={onChange}
                  labelPlacement='end'
                  checked={value || false}
                />
              )}
            />
            <Controller
              name="emailVisibility"
              control={control}
              render={({ field: { onChange,value } }) => (
                <CustomCheckBox
                  label="Email visibility to the public"
                  onChange={onChange}
                  labelPlacement='end'
                  checked={value || false}
                />
              )}
            />
            <Controller
              name="meetType"
              rules={{ required: "This field is required" }}
              control={control}
              render={({ field: { onChange,value} }) => (
                  <CustomAutocomplete
                  options={meetTypes?.data || []}
                  onChange={(e,v) => onChange(v)}
                  getOptionLabel={option => option.value}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value = {value || null}
                  label="Type"
                  error={!!errors.meetType}
                  helperText={errors.meetType?.message as string}
                  disabled={view}
                  />
              )}
            /> 
        </div>
        {watch('meetType')?.id === 3 &&
        <div style={{display: 'flex', flexWrap:'wrap'}}>
        <div className="mb-30 mr-20">
          <label className="input-label">House No./Block No.</label>
          <Controller
            name="houseNo"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.houseNo}
                helperText={errors.houseNo?.message}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">House Name/Building Name</label>
          <Controller
            name="houseName"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.houseName}
                helperText={errors.houseName?.message}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">Street</label>
          <Controller
            name="street"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.street}
                helperText={errors.street?.message}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">Area</label>
          <Controller
            name="area"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.area}
                helperText={errors.area?.message}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">Country</label>
          <Controller
              name="country"
              control={control}
              key = "state"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                options={countriesData?.data || []}
                getOptionLabel={(option: any) =>
                  option.name
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
                value={value || null}
                label=""
                onChange={(_, v) => {
                  onChange(v)
                  setValue('state', null)
                  setValue('city', null)
                }}
                error={!!errors.country}
                helperText={errors.country?.message as string}
                sx={{width: 500}}
                disableClearable
              />
            )}
            />

        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">State</label>
          <Controller
              name="state"
              control={control}
              key = "state"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                options={statesData?.data || []}
                getOptionLabel={(stateOptions: any) =>
                  stateOptions.name
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
                value={value || null}
                label=""
                onChange={(_, v) => {
                  onChange(v)
                  setValue('city', null)
                }}
                error={!!errors.state}
                helperText={errors.state?.message as string}
                sx={{width: 500}}
                disableClearable
                disabled={!watch('country')}
              />
            )}
            />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">City</label>
          <Controller
              name="city"
              control={control}
              key = "city"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                label=''
                options={citiesData?.data || []}
                getOptionLabel={(cityOptions: any) =>
                  cityOptions?.name
                }
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                fullWidth
                value={value || null}
                onChange={(_, v) => {onChange(v)}}
                error={!!errors.city}
                helperText={errors.city?.message as string}
                sx={{width: 500}}
                disabled={!watch('state')}
            />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">Pincode</label>
          <Controller
            name="pincode"
            control={control}
            rules={{ 
              required: "This field is required",
              validate: (value) => value.trim() !== "" || "This field is required", 
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">Landmark</label>
          <Controller
            name="landmark"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        <div className="mb-30 mr-20">
          <label className="input-label">Map Link</label>
          <Controller
            name="mapLink"
            control={control}
            rules={{
              validate: (value) => {
                // If the field is empty, it's valid (not required)
                if (!value) return true;
                // If the field contains 'maps', it's valid
                return value.includes("maps.app.goo.gl") || "Invalid Map Link";
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label=""
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!errors.mapLink}
                helperText={errors.mapLink?.message}
                sx={{width: 500}}
              />
            )}
          />
        </div>
        </div> 
        }
        {watch('defaultEmail') === emailData?.[0] && <div className="d-flex align-center w-100 mb-30">
        <div className="w-32">
          <label className="input-label">Duration</label>
          <Controller
            name="duration"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                label=''
                options={Durations}
                isOptionEqualToValue={(option, value) => option.label === value.label}
                onChange={(_, val) => {
                  onChange(val)
                }}
                sx={{width: 150}}
                disableClearable
                value={value || null}
                error={!!errors.duration}
                helperText={errors.duration?.message as string}
                disableSearch
              />  
            )}
          /> 
        </div>
        {watch('duration')?.value === "custom" && 
        <div className="w-32">
          <label className="input-label">Custom Duration</label>
          <Controller
            name="customDuration"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                label=''
                options={CustomDurations}
                onChange={(_, val) => {
                  onChange(val)
                }}
                sx={{width: 150}}
                disableClearable
                value={value || null}
                error={!!errors.customDuration}
                helperText={errors.customDuration?.message as string}
                disableSearch
              />  
            )}
          /> 
        </div>}
        </div>}
        <div className="w-100 mb-30">
          <Controller
              name="questions"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                  label='Select Questions'
                  options={[{ id: "add_new", question: "Add New Question" }, ...QUESTIONS]}
                  getOptionLabel={option => option.question}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, selectedValue) => {

                    // If "Add New Question" is selected, prevent it from being added
                    if (selectedValue.some((item: any) => item.id === "add_new")) {
                      // Remove the button option from the selection
                      selectedValue = selectedValue.filter((item: any) => item.id !== "add_new"); 
                      // Perform a custom action (e.g., open a modal)
                      setOpenAddQuestionDialog(true)
                    }

                    selectedValue.length <= 6 && onChange(selectedValue);
                    setSelectedQuestion(prevSelected => {
                      // Combine previous selected items with new selected items
                      const updatedSelection = selectedValue.map((selected: any) => {
                        // Check if the selected item is already in the previous state
                        const existingItem = prevSelected.find(item => item.id === selected.id);
                        // If found, keep the existing item (with additional properties), otherwise use the new one
                        return existingItem ? existingItem : selected;
                      });
            
                      // Limit to 6 items
                      return updatedSelection.length > 6 ? updatedSelection.slice(0, 6) : updatedSelection;
                    });
                  }}
                  renderOption={(props: any, option: any) => {
                    if (option.id === "add_new") {
                      return (
                        <>
                          <li {...props} style={{ fontWeight: "bold", color: "#6298BB", cursor: "pointer" }}>
                            <AddCircleOutlineIcon /> {option.question}
                          </li>
                          {QUESTIONS.length > 0 && <hr />}
                        </>
                      );
                    }
                    return <li {...props}>{option.question}</li>;
                  }}
                  value={value || []}
                  disableClearable
                  multiple
                  error={!!errors.questions}
                  helperText={errors.questions?.message}
                />
              )}
            />
        </div>
        {selectedQuestion?.length > 0 && <div className="slctd_qus_itm">
          <p className="font-bold mb-10">Please Select Mandatory Questions for Booking Slot:</p>
          {selectedQuestion?.map((item) => {
            return (
              <>
              <div className="chs_qus_itm d-flex items-center mb-10">
                <CustomCheckBox 
                  label="" 
                  className="mr-10"
                  checked={item.required || false} 
                  onChange={(e:any,v:boolean) => setSelectedQuestion(prev => prev.map(i => (i.id === item.id ? {...i, required: v} : i)))} 
                />
                <span>{item.question}</span>
                
              </div>
              </> 
            )
          })}
        </div> }
        <div className="d-flex flex-row mt-50 mb-50">
            <div className="w-100 mb-70">
                <Controller
                    name="newTemplate"
                    control={control}
                    rules={{ 
                      required: "This field is required" ,
                      validate: (value) => {
                        if(value === "<p><br></p>" || value.split(' ').join('') === "<p></p>") {
                          return "This field is required"
                        }
                        return true
                      }
                    }}
                    render={({ field: { onChange, value } }) => (
                    <CustomRichTextEditor 
                        onChange={onChange}
                        value={value}
                    />
                    )}
                />
            </div>
            <small style={{color: 'red'}}>{errors?.newTemplate?.message as string}</small>
        </div>
        {/* <Avatar src={`${SERVER_URL}/public/images/profilePictures/${data?.userData?.profilePicture}`} sx={{ width: 120, height: 120 }} /> */}


        <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2>Add Image</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
          <ImageCropper  croppedImage={croppedImage} setCroppedImage={setCroppedImage} closeDialog={()=> setOpenDialog(false)}/>
        </DialogContent>
      </Dialog>


      {(croppedImage || watch('image')) && <Avatar src={croppedImage || `${SERVER_URL}/public/images/profilePictures/${watch('image')}`} sx={{ width: 120, height: 120, objectFit:"contain", marginBottom:"8px" }} className="uploaded-image-preview"/>}
      <div className="d-flex">
          <CustomButton label={`${(croppedImage || watch('image')) ? 'Update' : 'Add'} Image`}  onClick={()=>setOpenDialog(true)}  className="mt-4"/>
          {(croppedImage || watch('image')) && <CustomButton label="Delete Image"  onClick={()=>{setValue('image', null); setCroppedImage(null); setIsDeleteImage(true)}}  className="mt-4"/> }
      </div>
      
        <div className="d-flex justify-center">
          <CustomButton type="submit" label="Save" className="submit-btn" />
        </div>
      </form>
      {openUpgradePopup && <UpgradePopup setOpenUpgradePopup={setOpenUpgradePopup} />}

      <Dialog
        open={openAddQuestionDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2>Add Question</h2>
          <CloseIcon onClick={() => setOpenAddQuestionDialog(false)} />
        </div>
        <DialogContent>
          <AddQuestion popupMode={true} setOpenAddQuestionDialog={setOpenAddQuestionDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
};


const CreateTagView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const formData = location?.state?.formdata
  const [view, setView] = useState<number>((formData?.eventTypeId === 1) ? 0 : (formData?.eventTypeId === 4) ? 1 : 0);
  return (
      <div className="page-wrapper top_algn-clr-mode">
        <div className="d-flex justify-between items-center mb-20">
          {formData ? 
            <h1 className="mb-zero">
              <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
              Edit Tag Name
            </h1>
          : <h1 className="mb-zero">
              <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
              Add New Tag
            </h1>
          }
          
        </div>
        <div className='card-box add_group_frm_wpr'>
          <div className='w-100 d-flex mb-20'>
            <div className="view-toggle">
              <span 
                className={view === 0 ? 'active-frm-grp' : ''} 
                onClick={() => setView(formData?.eventTypeId === 4  ? 1 : 0)}
              >
                <span className='icon_circle'>{formData ? <EditIcon/> : <AddIcon />}</span> 
                {`${formData ? "Edit" : "Create"} Basic Tag`}
              </span>
              {/* <span 
                className={view === 1 ? 'active-frm-grp' : ''} 
                onClick={() => setView(formData?.eventTypeId === 1  ? 0 : 1)}
              >
                <span className='icon_circle'>{formData ? <EditIcon/> : <AddIcon />}</span> 
                {`${formData ? "Edit" : "Create"} Group Tag`}
              </span> */}
            </div>
          </div>
          {view === 0 ?
              <CreateTag view={view} formData={formData} />
          : 
              <CreateTag view={view} formData={formData} />
            }
          
        </div>

      </div>
  )
}

export default CreateTagView;
