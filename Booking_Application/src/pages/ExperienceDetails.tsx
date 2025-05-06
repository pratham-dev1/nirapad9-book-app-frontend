import { useMutation, useQuery } from 'react-query';
import { ADD_EXPERIENCE_DETAILS, DELETE_EXPERIENCE_DETAILS, EDIT_EXPERIENCE_DETAILS, GET_CITIES, GET_COUNTRIES, GET_DESIGNATION, GET_EXPERIENCE_DETAILS, GET_ORGANIZATION, GET_STATES } from '../constants/Urls';
import request from '../services/http';
import AddIcon from '@mui/icons-material/Add';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomCheckBox from "../components/CustomCheckbox";
import { useContext, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CustomButton from '../components/CustomButton';
import dayjs, { Dayjs } from 'dayjs';
import CustomTextField from '../components/CustomTextField';
import { queryClient } from '../config/RQconfig';
import showToast from '../utils/toast';
import { ToastActionTypes } from '../utils/Enums';
import Loader from '../components/Loader';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from '../context/auth/AuthContext';

interface OrganizationProps{
  id: number
  organization: string
  isUserSuggested: boolean
}

interface DesignationProps{
  id: number
  designation: string
  isUserSuggested: boolean
}

interface CityProps{
  id: number;
  name: string;
}
interface CountryProps{
  id: number;
  name: string 
}

interface StateProps{
  id: number;
  name: string 
}

interface FormInputSuggestCompanyProps{
  suggestCompanyName: string;
  website: string;
  linkedinUrl: string;
  city: CityProps;
  country: CountryProps;
  state: StateProps;
}

interface FormInputSuggestDesignationProps{
  suggestDesignation: string;
}
interface FormInputExperienceDetailsProps {
  id: number,
  // suggestCompanyName: string;
  // website: string;
  // linkedinUrl: string;
  // city: CityProps | null;
  // country: CountryProps | null;
  organizationId: OrganizationProps;
  // suggestDesignation: string;
  designationId: DesignationProps;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isCurrent: boolean;
}

const ExperienceDetails = () => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone

  const [openExperienceDetailsDialog, setOpenExperienceDetailsDialog] = useState(false);
  const [openSuggestDesignationDialog, setOpenSuggestDesignationDialog] = useState(false);
  const [openSuggestCompanyDialog, setOpenSuggestCompanyDialog] = useState(false);

  const [editExperienceDetailsIndex, setEditExperienceDetailsIndex] = useState(null);
  const [isCurrentCompany, setIsCurrentCompany] = useState(false);
  const initialFormDataRef = useRef<FormInputExperienceDetailsProps | null>(null);
  const [sortData, setSortData] = useState([])
  const [showCompanyNameReview ,setShowCompanyNameReview ] = useState<any>()
  const [showDesignationReview ,setShowDesignationReview ] = useState<any>()

  const { handleSubmit: handleSubmitExperienceDetails, setValue, resetField: resetExperienceDetailsField, control: controlExperience,getValues, formState: { errors: errorsExperience }, reset: resetExperience } = useForm<FormInputExperienceDetailsProps>();
  const { handleSubmit: handleSubmitSuggestCompany, control: controlSuggestCompany, resetField: resetSuggestCompanyValues, formState: { errors: errorsSuggestCompany }, reset: resetSuggestCompany, setError: setSuggestCompanyError, watch } = useForm<FormInputSuggestCompanyProps>();
  const { handleSubmit: handleSubmitSuggestDesignation, control: controlSuggestDesignation,formState: { errors: errorsSuggestDesignation }, reset: resetSuggestDesignation, setError: setSuggestDesignationError } = useForm<FormInputSuggestDesignationProps>();
  
  const [suggestCompanyFormData, setSuggestCompanyFormData] = useState<FormInputSuggestCompanyProps>();
  const [suggestDesignationFormData, setSuggestDesignationFormData] = useState<FormInputSuggestDesignationProps>();

  const { data: organizationData, isLoading: organizationLoading, isError: organizationError } = useQuery('organization', () => request(GET_ORGANIZATION));
  const { data: designationData, isLoading: designationLoading, isError: designationError } = useQuery('designation', () => request(GET_DESIGNATION));
  const { data: countriesData, isLoading: countriesLoading, isError: countriesError } = useQuery('countries', () => request(GET_COUNTRIES));
  
  const selectedCountry = watch('country'); // Watch for country selection

  const { data: statesData, isLoading: statesLoading, isError: statesError } = useQuery(['states',selectedCountry], () => request(GET_STATES, 'get', {selectedCountry}),{
    enabled: !!selectedCountry
  });
  const selectedState = watch('state'); // Watch for state selection

  const { data: citiesData, isLoading: citiesLoading, isError: citiesError } = useQuery(['cities', selectedState], () => request(GET_CITIES, 'get', {selectedState}),{
    enabled: !!selectedState
  });

  const { mutate: addExperienceDetails, isLoading: isAddLoading } = useMutation((body: object) => request(ADD_EXPERIENCE_DETAILS, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('experience-details');
      queryClient.invalidateQueries('organization');
      queryClient.invalidateQueries('designation');
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setOpenExperienceDetailsDialog(false)
      setSuggestCompanyFormData(undefined);
      resetSuggestCompany();
      setSuggestDesignationFormData(undefined);
      resetSuggestDesignation();
    }
  });
  const { mutate: editExperienceDetails, isLoading: isEditLoading } = useMutation((body: object) => request(EDIT_EXPERIENCE_DETAILS, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('experience-details');
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setOpenExperienceDetailsDialog(false)
    }
  });
  const { data: experienceDetailsData } = useQuery('experience-details', () => request(GET_EXPERIENCE_DETAILS));
  const { mutate: deleteExperienceDetails } = useMutation((body: object) => request(DELETE_EXPERIENCE_DETAILS, "post", body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('experience-details');
        showToast(ToastActionTypes.SUCCESS, data?.message)
      },
    })

  const handleDeleteExperienceDetails = (item: FormInputExperienceDetailsProps) => {
    // console.log(item);
    deleteExperienceDetails({ id: item })
  }

  const handleEditExperienceDetails = (item: any) => {
    // console.log(item);
    setEditExperienceDetailsIndex(item.id);

    if(item.experience_detailsUserSuggestedOrganization){
      setShowCompanyNameReview(item.experience_detailsUserSuggestedOrganization)
    }else{
      setShowCompanyNameReview(undefined)
    }
    if(item.experience_detailsUserSuggestedDesignation){
      setShowDesignationReview(item.experience_detailsUserSuggestedDesignation)
    }else{
      setShowDesignationReview(undefined)
    }

    setOpenExperienceDetailsDialog(true);
    setIsCurrentCompany(item.isCurrent)

    const formattedItem = {
      ...item,
      startDate: item.startDate ? dayjs(item.startDate) : null,
      endDate: (item.endDate && item.isCurrent === false) ? dayjs(item.endDate) : null,
      organizationId: {id:item?.experience_detailsOrganization?.id, organization: item?.experience_detailsOrganization?.organization, isUserSuggested: false },
      designationId: { id: item?.experience_detailsDesignation?.id, designation: item?.experience_detailsDesignation?.designation, isUserSuggested: false},
    };
    initialFormDataRef.current = formattedItem;
    resetExperience(formattedItem);
  };

  const handleAddExperienceDetails = () => {
    setIsCurrentCompany(false)
    resetExperience({
      // suggestCompanyName: '',
      // city: null,
      // country: null,
      organizationId:undefined,
      // suggestDesignation: '',
      designationId: undefined,
      startDate: null,
      endDate: null,
      isCurrent: false
    });
    setEditExperienceDetailsIndex(null);
    setOpenExperienceDetailsDialog(true);
  };

  const onSubmitExperienceDetails: SubmitHandler<FormInputExperienceDetailsProps> = (data) => {
    // console.log(data);
    if (JSON.stringify(data) === JSON.stringify(initialFormDataRef.current)) {
      showToast(ToastActionTypes.ERROR, "No Changes Found!!!")
      return;
    }

    if (editExperienceDetailsIndex !== null) {
      editExperienceDetails({ ...data, id: data.id,
        startDate: data.startDate?.format("YYYY-MM-DD"),
        endDate: (data.isCurrent === true) ? null : data.endDate?.format("YYYY-MM-DD"), 
        organizationId: data.organizationId?.isUserSuggested == false ? data?.organizationId?.id : null, 
        designationId:  data.designationId?.isUserSuggested == false ? data?.designationId?.id : null,  
        suggestCompanyName: data.organizationId?.isUserSuggested == true ? data.organizationId.id : null,
        suggestDesignation: data.designationId?.isUserSuggested == true ? data.designationId.id : null,
       });
    } else {
      addExperienceDetails({ ...data,
        startDate: data.startDate?.format("YYYY-MM-DD") ,
        endDate: data.isCurrent ? null : data.endDate?.format("YYYY-MM-DD"),
        organizationId: data?.organizationId?.id == 0 || data?.organizationId?.isUserSuggested == true ? null : data?.organizationId?.id,
        designationId: data?.designationId?.id == 0 || data?.designationId?.isUserSuggested == true  ? null : data?.designationId?.id ,
        suggestCompany: data?.organizationId?.id == 0 && data?.organizationId?.isUserSuggested == true ? suggestCompanyFormData : data?.organizationId?.isUserSuggested == false  ? null : data?.organizationId,
        suggestDesignation: data?.designationId?.id == 0 && data?.designationId?.isUserSuggested == true ? suggestDesignationFormData : data?.designationId?.isUserSuggested == false ? null : data?.designationId,
        // city: showSuggestCompanyName? data.city?.id : null,
        // country: showSuggestCompanyName? data.country?.id : null
      });
    }
  }   

  useEffect(() => {
    const sortedExperienceDetails = experienceDetailsData?.data?.slice().sort((a: any, b: any) => b.id - a.id);
    setSortData(sortedExperienceDetails)
  }, [experienceDetailsData?.data])

  const onSubmitSuggestCompany: SubmitHandler<FormInputSuggestCompanyProps> = (data) => {
    console.log(data)
    setSuggestCompanyFormData(data)
    const existingOrganization = organizationData?.data.find(
      (organization: OrganizationProps) => organization.organization.toLowerCase() === data.suggestCompanyName.toLowerCase()
    );
    if (existingOrganization) {
      setSuggestCompanyError('suggestCompanyName', {
        type: 'manual',
        message: 'This Company name already exists.'
      });
    } else {
      const newCompanyName = { id: 0, organization: data.suggestCompanyName, isUserSuggested: true };
      setValue('organizationId', newCompanyName);
      setOpenSuggestCompanyDialog(false)
    } 
  }
  const onSubmitSuggestDesignation: SubmitHandler<FormInputSuggestDesignationProps> = (data) => {
    console.log(data)
    setSuggestDesignationFormData(data)
    const existingDesignation = designationData?.data.find(
      (designation: DesignationProps) => designation.designation.toLowerCase() === data.suggestDesignation.toLowerCase()
    );
    if (existingDesignation) {
      setSuggestDesignationError('suggestDesignation', {
        type: 'manual',
        message: 'This Designation name already exists.'
      });
    } else {
      const newDesignation = { id: 0, designation: data.suggestDesignation, isUserSuggested: true };
      setValue('designationId', newDesignation);
      setOpenSuggestDesignationDialog(false)
    }
  }

  const handleExperienceDetailsClose = () => {   
    setOpenExperienceDetailsDialog(false)
    // setOpenEducationDetailsDialog(false);  
    setSuggestCompanyFormData(undefined);
    resetSuggestCompany();
    setSuggestDesignationFormData(undefined);
    resetSuggestDesignation();
  };

  return (
    <>
      <div>
        <div className="d-flex justify-between items-center mb-20">
          <h2 className="sec-title">Experience Details</h2>
          <button onClick={handleAddExperienceDetails}>
            <AddIcon className='cursur-pointer' />
          </button>
        </div>
        {
          sortData?.map((item: any, index: number) => (
            <div key={index} className="experience-item mb-50">
              <h3 className='mb-10'>Company Name: {item.experience_detailsOrganization?.organization || item?.experience_detailsUserSuggestedOrganization?.organizationName}</h3>
              <p className='mt-0'>Designation: {item.experience_detailsDesignation?.designation || item?.experience_detailsUserSuggestedDesignation?.designation}</p>
              <p>Start Date: {dayjs(item.startDate).format('DD/MM/YYYY')}</p>
              <p>End Date: {item.endDate ? dayjs(item.endDate).format('DD/MM/YYYY') : 'Present'}</p>

              <div className='mt-20'>
                
                <CustomButton
                  label="Delete"
                  className='secondary_btns mr-25'
                  onClick={() => handleDeleteExperienceDetails(item.id)}
                />
                <CustomButton
                  label="Edit"
                  className='primary_btns mr-0'
                  onClick={() => handleEditExperienceDetails(item)}
                />
              </div>
            </div>
          ))
        }
      </div>

      <Dialog open={openExperienceDetailsDialog} >
      {(isAddLoading || isEditLoading) && <Loader />}
        <div className='popup-header'>
          <h2>{editExperienceDetailsIndex !== null ? 'Edit' : 'Add'} Experience Details</h2>
          <CloseIcon onClick={handleExperienceDetailsClose} />
        </div>
        <DialogContent>
          <form onSubmit={handleSubmitExperienceDetails(onSubmitExperienceDetails)} className="add-experience-details">
            <div className='form-colm m-zero'>
              <div className='w-100 mb-15'>
              {!!editExperienceDetailsIndex && showCompanyNameReview ?
                <p className='review_col'>
                  Companny Name "{showCompanyNameReview?.organizationName}" is in 
                  <span className="status-tag">Review</span>
                </p> :
                    <Controller
                      name="organizationId"
                      control={controlExperience}
                      key = "companyName"
                      rules={{ required: true }}
                      render={({ field: { onChange,value } }) => (
                        <CustomAutocomplete
                          options={organizationData?.data}
                          getOptionLabel={(organizationOptions: OrganizationProps) =>
                            organizationOptions.organization
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value = {value || null}
                          label="Company Name"
                          onChange={(_, selectedValue) => {
                            onChange(selectedValue);
                          }}
                          error={!!errorsExperience.organizationId}
                  
                        />
                      )}
                    />
                    }      
                { organizationData?.organizationSuggestedCount >= 3 || editExperienceDetailsIndex !== null ? "" : <p className='open-dialog-link' onClick={() => setOpenSuggestCompanyDialog(true)} >
                  <span className='add-icon'>+</span> Suggest Company
                </p>}
              </div>
              
              <div className='w-100 mb-15'>
              {!!editExperienceDetailsIndex && showDesignationReview ?
                <p>Designation "{showDesignationReview?.designation}" is in review</p> :
                    <Controller
                    name="designationId"
                    control={controlExperience}
                      key = "designation"
                    rules={{ required: true }}
                    render={({ field: { onChange,value } }) => (
                      <CustomAutocomplete
                        options={designationData?.data}
                        getOptionLabel={(designationOptions: DesignationProps) =>
                          designationOptions.designation
                        }
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value = {value || null}
                        label="Designation"
                        onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                        }}
                        error={!!errorsExperience.designationId}
                     />
                    )}
                  />
                  }
                {designationData?.designationSuggestedCount >= 3 || editExperienceDetailsIndex !== null ? "" : <p className='open-dialog-link' onClick={() => setOpenSuggestDesignationDialog(true)} >
                  <span className='add-icon'>+</span> Suggest Designation
                </p>}
              </div>

            </div>
               

            <div className='form-colm m-zero'>
              <div className='mr-25'>
                <Controller
                  name="startDate"
                  control={controlExperience}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <CustomDatePicker
                      label="Start Date"
                      sx={{ width: 300 }}
                      onChange={onChange}
                      value={value ? dayjs(value) : null}
                      // maxDate={dayjs().tz(default_timeZone).tz(system_timeZone, true)}
                      disableFuture
                      size="medium"
                      error={!!errorsExperience.startDate}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="endDate"
                  control={controlExperience}
                  // rules={isCurrentCompany ? { required: false } : { required: true },
                  rules={{
                    required: !isCurrentCompany,
                    validate: (value) => {
                      const startDate = getValues('startDate'); 
                      if (startDate && value) {
                        if (dayjs(value).isBefore(dayjs(startDate))) {
                          return "End date cannot be before start date";
                        }
                        if (dayjs(value).isAfter(dayjs.tz(dayjs().format("YYYY-MM-DD"), default_timeZone))) {
                          return "End date cannot be in the future";
                        }
                      }
                      return true;
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <CustomDatePicker
                      label="End Date"
                      sx={{ width: 300 }}
                      onChange={onChange}
                      value={value ? dayjs(value) : null}
                      // maxDate={dayjs().tz(default_timeZone).tz(system_timeZone, true)}
                      disableFuture
                      size="medium"
                      disabled={isCurrentCompany}
                      error={isCurrentCompany ? false : !!errorsExperience.endDate}
                      helperText={errorsExperience.endDate?.message}
                    />
                  )
                  }
                />
              </div>
            </div>
            
            
            <Controller
              name="isCurrent"
              control={controlExperience}
              render={({ field: { onChange, value } }) => (
                <CustomCheckBox
                  label="Is Current"
                  onChange={(e: any) => {
                    resetExperienceDetailsField('endDate')
                    setIsCurrentCompany(e.target.checked)
                    onChange(e.target.checked)
                  }}
                  checked={value || false}
                />
              )}
            />
            <div className="d-flex align-center justify-center mt-20">
              <CustomButton
                label="Cancel"
                className="cancel-btn mr-25"
                variant="outlined"
                onClick={handleExperienceDetailsClose}
              />
              <CustomButton
                type="submit"
                label="Save"
                className="submit-btn mr-0"
              />
              
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog className='suggest-designation-popup' open={openSuggestDesignationDialog}>
        <div className='popup-header'>
          <h2>Suggest Designation </h2>
          <CloseIcon onClick={() => setOpenSuggestDesignationDialog(false)} />
        </div>
        <DialogContent>
          <form onSubmit={handleSubmitSuggestDesignation(onSubmitSuggestDesignation)}  className='suggest-designation-form'>
            <div className='d-flex flex-row'>
                <div className='w-100 mt-50 mb-50'>
                  <Controller
                    name="suggestDesignation"
                    key= "suggest_designation"
                    control={controlSuggestDesignation}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <CustomTextField
                        label="Designation Name"
                        onChange={onChange}
                        value={value || ""}
                        fullWidth
                        error={!!errorsSuggestDesignation.suggestDesignation}
                        helperText={errorsSuggestDesignation.suggestDesignation?.message}
                      />
                    )}
                  />
                </div>
                <div className='w-100 d-flex justify-center mb-50'>
                  <CustomButton
                    type="submit"
                    label="Suggest"
                    className="submit-btn"
                  />
                </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog className='suggest-company-popup' open={openSuggestCompanyDialog}>
        <div className='popup-header'>
          <h2> Suggest Company </h2>
          <CloseIcon onClick={() => setOpenSuggestCompanyDialog(false)} />
        </div>
        <DialogContent>
          <form onSubmit={handleSubmitSuggestCompany(onSubmitSuggestCompany)} className='suggest-compnay-form'>
            <div className='w-100 d-flex flex-row justify-between mb-30'>
              <div className='w-100 mb-15'>
                <Controller
                  name="suggestCompanyName"
                  control={controlSuggestCompany}
                  key= "suggestCompanyName"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label="Suggest Company Name"
                      onChange={onChange}
                      value={value || ""}
                      error={!!errorsSuggestCompany.suggestCompanyName}
                      helperText={errorsSuggestCompany.suggestCompanyName?.message}
                    />
                  )}
                />
              </div>
              <div className='w-49 mb-15'>
                <Controller
                  name="website"
                  control={controlSuggestCompany}
                  key= "website"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label="Company Website Link"
                      onChange={onChange}
                      value={value || ""}
                      error={!!errorsSuggestCompany.website}
                    />
                  )}
                />
              </div>

              <div className='w-49 mb-15'>
                <Controller
                  name="linkedinUrl"
                  control={controlSuggestCompany}
                  key= "linkedinUrl"
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label="Linkedin Url"
                      onChange={onChange}
                      value={value || ""}
                      error={!!errorsSuggestCompany.linkedinUrl}
                    />
                  )}
                />
              </div>

           
              <div className='w-49 mb-15'>
                <Controller
                  name="country"
                  control={controlSuggestCompany}
                  rules={{ required: true }}
                  render={({ field: { onChange,value } }) => (
                    <CustomAutocomplete
                      options={countriesData?.data}
                      getOptionLabel={(countryOptions: CountryProps) =>
                        countryOptions.name
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value = {value || null}
                        label="Country"
                      onChange={(_, selectedValue) => {
                        onChange(selectedValue);
                        resetSuggestCompanyValues('state');
                        resetSuggestCompanyValues('city');
                      }}
                      error={!!errorsSuggestCompany.country}
                    />
                  )}
                />
              </div>
              <div className='w-49 mb-15'>
                      <Controller
                        name="state"
                        control={controlSuggestCompany}
                        key = "state"
                        // rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomAutocomplete
                            options={statesData?.data}
                            getOptionLabel={(stateOptions: StateProps) =>
                              stateOptions.name
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={value || null }
                            label="State/ Province/ Region"
                            onChange={(_, selectedValue) => {
                              onChange(selectedValue);
                              resetSuggestCompanyValues('city');
                            }}
                            error={!!errorsSuggestCompany.state}
                            disabled={!selectedCountry}
                          />
                        )}
                      />
                    </div>
                    <div className='w-49 mb-15'>
                <Controller
                  name="city"
                  control={controlSuggestCompany}
                  // rules={{ required: true }}
                  render={({ field: { onChange,value } }) => (
                    <CustomAutocomplete
                      options={citiesData?.data}
                      getOptionLabel={(cityOptions: CityProps) =>
                        cityOptions.name
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value = {value || null}
                        label="City"
                      onChange={(_, selectedValue) => {
                        onChange(selectedValue);
                      }}
                      error={!!errorsSuggestCompany.city}
                      disabled={!selectedState}
                   />
                  )}
                />
              </div>
            </div>
            
            <div className='w-100 d-flex justify-center mb-20'>
              <CustomButton
                type="submit"
                label="Suggest"
                className="submit-btn"
              />
            </div>
          </form>
        </DialogContent>
        
      </Dialog>
    </>
  );
}

export default ExperienceDetails;