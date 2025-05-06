import { useMutation, useQuery } from 'react-query';
import { ADD_EDUCATION_DETAILS, DELETE_EDUCATION_DETAILS, EDIT_EDUCATION_DETAILS, GET_CITIES, GET_COUNTRIES, GET_COURSE, GET_EDUCATION_DETAILS, GET_FIELD_OF_STUDY, GET_INSTITUTION, GET_EDUCATION_LEVEL, GET_STATES } from '../constants/Urls';
import request from '../services/http';
import AddIcon from '@mui/icons-material/Add';
import { Controller, get, SubmitHandler, useForm } from "react-hook-form";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomCheckBox from "../components/CustomCheckbox";
import { useContext, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CustomButton from '../components/CustomButton';
import dayjs from 'dayjs';
import CustomTextField from '../components/CustomTextField';
import { queryClient } from '../config/RQconfig';
import showToast from '../utils/toast';
import { ToastActionTypes } from '../utils/Enums';
import Loader from '../components/Loader';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from '../context/auth/AuthContext';

interface CourseProps {
  id: number
  courseName: string
}

interface InstitutionProps {
  id: number
  institutionName: string
  isUserSuggested: boolean
}

interface CountryProps{
  id: number;
  name: string 
}

interface StateProps{
  id: number;
  name: string 
}

interface CityProps{
  id: number;
  name: string;
}
interface FieldOfStudyProps{
  id: number;
  name: string;
  isUserSuggested: boolean;
}

interface CityProps{
  id: number;
  name: string;
}

interface LevelProps{
  id: number;
  name: string 
}
interface FormInputEducationDetailsProps {
  id: number,
  // suggestInstituteName: string;
  // suggestCourse: string;
  institutionId: InstitutionProps;
  courseId: CourseProps;
  startDate: any;
  endDate: any;
  isCurrentlyPursuing: boolean;
  educationLevel:LevelProps;
  fieldOfStudy: FieldOfStudyProps;
}

interface FormInputSuggestInstituteProps {
  institutionName: string;
  city: CityProps;
  state: StateProps;
  zipcode: number;
  country: CountryProps;
  website: string;
}

interface FormInputSuggestCourseProps {
  level: LevelProps;
  degree: CourseProps;
  studyField: string;
}

const EducationDetails = () => {
  const { state } = useContext(AuthContext);
 
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone

  const [openEducationDetailsDialog, setOpenEducationDetailsDialog] = useState(false);
  const [openSuggestInstituteDialog, setOpenSuggestInstituteDialog] = useState(false);
  const [openSuggestCourse, setOpenSuggestCourse] = useState(false);
  const [editEducationDetailsIndex, setEditEducationDetailsIndex] = useState(null);
  const [isPursuing, setIsPursuing] = useState(false);
  const initialFormDataRef = useRef<FormInputEducationDetailsProps | null>(null);
  const [sortData, setSortData] = useState([])
  const [showInstitutionInReview ,setShowInstitutionInReview ] = useState<any>()
  const [showCourseInReview ,setShowCourseInReview ] = useState<any>()
  const { handleSubmit: handleSubmitEducationDetails,setValue, getValues, control: controlEducation, formState: { errors: errorsEducation }, reset: resetEducation, setError } = useForm<FormInputEducationDetailsProps>();
  const { handleSubmit: handleSubmitSuggestInstitute, control: controlSuggestInstitute,resetField: resetSuggestInstituteValues, formState: { errors: errorsSuggestInstitute },reset: resetSuggestInstituteForm,setError: setSuggestInstituteError, watch } = useForm<FormInputSuggestInstituteProps>();
  const { handleSubmit: handleSubmitSuggestCourse, control: controlSuggestCourse, formState: { errors: errorsSuggestCourse }, reset: resetSuggestCourseForm, setError: setSuggestCourseError} = useForm<FormInputSuggestCourseProps>();
  const [suggestInstituteFormData, setSuggestInstituteFormData] = useState<FormInputSuggestInstituteProps>();
  const [suggestCourseFormData, setSuggestCourseFormData] = useState<FormInputSuggestCourseProps>();

  const { data: courseData, isLoading: courseLoading, isError: courseError } = useQuery('course', () => request(GET_COURSE));
  const { data: institutionData, isLoading: institutionLoading, isError: institutionError } = useQuery('institution', () => request(GET_INSTITUTION));
  
  const { data: countriesData, isLoading: countriesLoading, isError: countriesError } = useQuery('countries', () => request(GET_COUNTRIES));
  
  const selectedCountry = watch('country'); // Watch for country selection

  const { data: statesData, isLoading: statesLoading, isError: statesError } = useQuery(['states',selectedCountry], () => request(GET_STATES, 'get', {selectedCountry}),{
    enabled: !!selectedCountry
  });
  const selectedState = watch('state'); // Watch for state selection

  const { data: citiesData, isLoading: citiesLoading, isError: citiesError } = useQuery(['cities', selectedState], () => request(GET_CITIES, 'get', {selectedState}),{
    enabled: !!selectedState
  });

  const { data: fieldOfStudyData, isLoading: fieldOfStudyLoading, isError: fieldOfStudyError } = useQuery('fieldOfStudy', () => request(GET_FIELD_OF_STUDY));
  const { data: levelData, isLoading: levelLoading, isError: levelError } = useQuery('level', () => request(GET_EDUCATION_LEVEL));
  const { mutate: addEducationDetails, isLoading: isAddLoading } = useMutation((body: object) => request(ADD_EDUCATION_DETAILS, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('education-details');
      queryClient.invalidateQueries('institution');
      queryClient.invalidateQueries('course');
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setOpenEducationDetailsDialog(false)
      setSuggestInstituteFormData(undefined);
      resetSuggestInstituteForm();
      setSuggestCourseFormData(undefined);
      resetSuggestCourseForm();
      // resetEducation()
    }
  });
  const { mutate: editEducationDetails, isLoading: isEditLoading } = useMutation((body: object) => request(EDIT_EDUCATION_DETAILS, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('education-details');
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setOpenEducationDetailsDialog(false)
      // resetEducation()
    }
  });

  const { data: educationDetailsData } = useQuery('education-details', () => request(GET_EDUCATION_DETAILS));
  const { mutate: deleteEducationDetails } = useMutation((body: object) => request(DELETE_EDUCATION_DETAILS, "post", body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('education-details');
        showToast(ToastActionTypes.SUCCESS, data?.message)
      },
    })

  const handleDeleteEducationDetails = (item: FormInputEducationDetailsProps) => {
    // console.log(item);
    deleteEducationDetails({ id: item })
  }

  const handleEditEducationDetails = (item: any) => {
    // console.log(item, isPursuing);
    setEditEducationDetailsIndex(item.id);
    if(item.education_detailsUserSuggestedInsitution){
      setShowInstitutionInReview(item.education_detailsUserSuggestedInsitution)
    }else{
      setShowInstitutionInReview(undefined)
    }
    if(item.education_detailsUserSuggestedCourse){
      setShowCourseInReview(item.education_detailsUserSuggestedCourse)
    }else{
      setShowCourseInReview(undefined)
    }
    setOpenEducationDetailsDialog(true);
    setIsPursuing(item.isCurrentlyPursuing)

    const formattedItem = {
      ...item,
      startDate: item.startDate ? dayjs(item.startDate) : null,
      endDate: item.endDate ? dayjs(item.endDate) : null,
      institutionId: {id: item?.education_detailsInstitution?.id, institutionName: item?.education_detailsInstitution?.institutionName, isUserSuggested: false},
      courseId: {id: item?.education_detailsCourse?.id, courseName: item?.education_detailsCourse?.courseName, isUserSuggested: false },
      educationLevel: {id: item?.education_detailsEducationLevel?.id, name: item?.education_detailsEducationLevel?.name, isUserSuggested: false },
      fieldOfStudy: {id: item?.education_detailsFieldOfStudy?.id, name: item?.education_detailsFieldOfStudy?.name, isUserSuggested: false }
      // suggestInstituteName: item?.education_detailsUserSuggestedInsitution?.institutionName,
      // suggestCourse: item?.education_detailsUserSuggestedCourse?.course
    };
    initialFormDataRef.current = formattedItem;
    resetEducation(formattedItem);
  };

  const handleAddEducationDetails = () => {
    setSuggestInstituteFormData(undefined);
    resetSuggestInstituteForm({
      institutionName: "",
      city: undefined,
      state: undefined,
      zipcode: undefined,
      country: undefined,
      website: "",
    });
    setSuggestCourseFormData(undefined);
    resetSuggestCourseForm({

    });
    setIsPursuing(false)
    resetEducation({
      // suggestInstituteName: '',
      // suggestCourse: '',
      institutionId: undefined,
      courseId: undefined,
      startDate: null,
      endDate: null,
      isCurrentlyPursuing: false,
      educationLevel: undefined,
      fieldOfStudy: undefined
    });
    setEditEducationDetailsIndex(null);
    setOpenEducationDetailsDialog(true);
  };

  const onSubmitEducationDetails: SubmitHandler<FormInputEducationDetailsProps> = (data) => {
    // console.log(data, isPursuing);

    if (JSON.stringify(data) === JSON.stringify(initialFormDataRef.current)) {
      showToast(ToastActionTypes.ERROR, "No Changes Found!!!")
      return;
    }

    if (editEducationDetailsIndex !== null) {
      editEducationDetails({ ...data, id: data.id, 
        startDate: data.startDate?.format("YYYY-MM-DD"),
        endDate: data.endDate?.format("YYYY-MM-DD") || null, 
        institutionId: data.institutionId?.isUserSuggested == false ? data?.institutionId?.id : null, 
        courseId: data.fieldOfStudy?.isUserSuggested == false ? data?.courseId?.id : null,
        educationLevel: data.fieldOfStudy?.isUserSuggested == false ? data?.educationLevel?.id : null,
        fieldOfStudy: data.fieldOfStudy?.isUserSuggested == false ? data?.fieldOfStudy.id : null,
        suggestInstitute: data.institutionId?.isUserSuggested == true ? data?.institutionId.id: null,  
        suggestCourse: data.fieldOfStudy?.isUserSuggested == true ? data?.fieldOfStudy.id : null
      });
    } else {
      addEducationDetails({ ...data, 
        startDate: data.startDate?.format("YYYY-MM-DD"), 
        endDate: data.endDate?.format("YYYY-MM-DD"), 
        institutionId: data?.institutionId?.id == 0 || data?.institutionId?.isUserSuggested == true ? null: data?.institutionId?.id , 
        courseId: data?.fieldOfStudy?.id == 0 || data?.fieldOfStudy?.isUserSuggested == true ? null : data?.courseId?.id,
        fieldOfStudy: data?.fieldOfStudy?.id == 0 || data?.fieldOfStudy?.isUserSuggested == true ? null : data?.fieldOfStudy.id,
        educationLevel: data?.fieldOfStudy?.id == 0 || data?.fieldOfStudy?.isUserSuggested == true ? null : data?.educationLevel?.id ,
        suggestInstitute: data?.institutionId?.id == 0 &&  data?.institutionId?.isUserSuggested == true ? suggestInstituteFormData : data?.institutionId?.isUserSuggested == false ? null :  data?.institutionId,
        suggestCourse: data?.fieldOfStudy?.id == 0 && data?.fieldOfStudy?.isUserSuggested == true ? suggestCourseFormData : data?.fieldOfStudy?.isUserSuggested == false ? null : data?.fieldOfStudy
      });
    }
  }

  const onSubmitSuggestInstitute: SubmitHandler<FormInputSuggestInstituteProps> = (data) => {
    console.log(data)
    setSuggestInstituteFormData(data)
    const existingInstitution = institutionData?.data.find(
      (institution: InstitutionProps) => institution.institutionName.toLowerCase() === data.institutionName.toLowerCase()
    );
    if (existingInstitution) {
      setSuggestInstituteError('institutionName', {
        type: 'manual',
        message: 'The institution name already exists.'
      });
    } else {
      const newInstitution = { id: 0, institutionName: data.institutionName, isUserSuggested: true };
      setValue('institutionId', newInstitution);
      setOpenSuggestInstituteDialog(false)
    }
  }
  const onSubmitSuggestCourse: SubmitHandler<FormInputSuggestCourseProps> = (data) => {
    console.log(data)
    setSuggestCourseFormData(data)
    const existingFieldOfStudy = fieldOfStudyData?.data.find(
      (fieldOfStudy: FieldOfStudyProps) => fieldOfStudy.name.toLowerCase() === data.studyField.toLowerCase()
    ); 
    if (existingFieldOfStudy) {
      setSuggestCourseError('studyField', {
        type: 'manual',
        message: 'This Field Of Study already exists.'
      });
    } else {
      const newFieldOfStudy = { id: 0, name: data.studyField, isUserSuggested: true };
      setValue('fieldOfStudy', newFieldOfStudy);
      setValue('educationLevel', data.level);
      setValue('courseId', data.degree);
      setOpenSuggestCourse(false)
    }
  }

  useEffect(() => {
    const sortedEducationDetails = educationDetailsData?.data?.slice().sort((a: any, b: any) => b.id - a.id);
    setSortData(sortedEducationDetails)
  }, [educationDetailsData?.data])

  const handleEducationDetailsClose = () => {
    setOpenEducationDetailsDialog(false);  
    setSuggestInstituteFormData(undefined);
    resetSuggestInstituteForm();
    setSuggestCourseFormData(undefined);
    resetSuggestCourseForm();
  };

  return (
    <>
      <div>
        <div className="d-flex justify-between items-center mb-20">
          <h2 className="sec-title">Education Details</h2>
          <button className='cursur-pointer' onClick={handleAddEducationDetails}>
            <AddIcon className='cursur-pointer' />
          </button>
        </div>
        {
          sortData?.map((item: any, index: number) => (
            <div key={index} className="education-item mb-50">
              <h3 className='mb-10'>Institute Name: {item?.education_detailsInstitution?.institutionName || item?.education_detailsUserSuggestedInsitution?.institutionName }</h3>
              <p className='mt-0'>Course: {item?.education_detailsCourse?.courseName || item?.education_detailsUserSuggestedCourse?.fieldOfStudy}</p>
              <p>Start Date: {dayjs(item.startDate).format('DD/MM/YYYY')}</p>
              <p>End Date: {item.endDate ? dayjs(item.endDate).format('DD/MM/YYYY') : 'Present'}</p>

              <div className='mt-20'>
                <CustomButton
                  label="Delete"
                  className='secondary_btns mr-25'
                  onClick={() => handleDeleteEducationDetails(item.id)}
                />
                <CustomButton
                  label="Edit"
                  className='primary_btns mr-0'
                  sx={{ marginRight: 2 }}
                  onClick={() => handleEditEducationDetails(item)}
                />
                
              </div>
            </div>
          ))
        }
      </div>
      <Dialog open={openEducationDetailsDialog} >
        {(isAddLoading || isEditLoading) && <Loader />}
        <div className='popup-header'>
          <h2>{editEducationDetailsIndex !== null ? 'Edit' : 'Add'} Education Details</h2>
          <CloseIcon onClick={handleEducationDetailsClose} />
        </div>
        <DialogContent>
          <form onSubmit={handleSubmitEducationDetails(onSubmitEducationDetails)} className="add-education-details">
            <div className='form-colm m-zero'>
            {!!editEducationDetailsIndex && showCourseInReview ?
              <p className='review_col'>
                Field of study "{showCourseInReview?.fieldOfStudy}" is in 
                <span className='status-tag'>Review</span>
              </p>:
              <div className='w-100 d-flex flex-row justify-between'>
                <div className='w-49 mb-15'>
                  <Controller
                    name="educationLevel"
                    control={controlEducation}
                    key = "educationLevel"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        options={levelData?.data}
                        getOptionLabel={(levelOptions: LevelProps) =>
                          levelOptions.name
                        }
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={value || null }
                        label="Level of Education"
                        onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                        }}
                        error={!!errorsEducation.educationLevel}         
                      />
                    )}
                  />
                </div>
                
                <div className='w-49 mb-15'>
                  <Controller
                    name="courseId"
                    control={controlEducation}
                    key = "course"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        options={courseData?.data}
                        getOptionLabel={(courseOptions: CourseProps) =>
                          courseOptions.courseName
                        }
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={value || null}
                        label="Degree"
                        onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                        }}
                        error={!!errorsEducation.courseId}
                      />
                    )}
                  />
                </div>
                <div className='w-100 mb-15'>
                  <Controller
                    name="fieldOfStudy"
                    control={controlEducation}
                    key= "fieldOfStudy"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                      options={fieldOfStudyData?.data}
                      getOptionLabel={(fieldOfStudyOption: FieldOfStudyProps) =>
                        fieldOfStudyOption.name
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={value || null }
                      label="Field of Study"
                      onChange={(_, selectedValue) => {
                        onChange(selectedValue);
                      }}
                      error={!!errorsEducation.fieldOfStudy}
                     />
                    )}
                  />
                </div>
                 
              </div>
              }
              <div className='w-100 mb-15'>
                {!!editEducationDetailsIndex && showInstitutionInReview ?
                <p className='review_col'>
                  Instituion "{showInstitutionInReview?.institutionName}" is in
                  <span className="status-tag">Review</span>
                </p> :
                <>  
                    <Controller
                      name="institutionId"
                      control={controlEducation}
                      key = "institute"
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <CustomAutocomplete
                          options={institutionData?.data}
                          getOptionLabel={(institutionOptions: InstitutionProps) =>
                            institutionOptions.institutionName
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={value || null }
                          label="Institute Name"
                          onChange={(_, selectedValue) => {
                            onChange(selectedValue);
                          }}
                          error={!!errorsEducation.institutionId}
                        />
                      )}
                  />
                  </>
                }
                  {institutionData?.institutionSuggestedCount >=3 || editEducationDetailsIndex !== null ? "" :
                   <p className='open-dialog-link' onClick={() => {resetSuggestInstituteForm(suggestInstituteFormData); setOpenSuggestInstituteDialog(true)}} >
                    <span className='add-icon'>+</span> Suggest Institution
                  </p>} 
              </div>

              <div className='w-100 mb-15'>
                {fieldOfStudyData?.courseSuggestedCount >=3 || editEducationDetailsIndex !== null ? "" :<p className='open-dialog-link' onClick={() => { resetSuggestCourseForm(suggestCourseFormData); setOpenSuggestCourse(true);}} >
                  <span className='add-icon'>+</span> Suggest Course
                </p>}
              </div>

            </div>
            
            <div className='form-colm m-zero'>
              <div className='w-100 d-flex justify-between'>
                <div className='w-49'>
                  <Controller
                    name="startDate"
                    control={controlEducation}
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
                        error={!!errorsEducation.startDate}
                      />
                    )}
                  />
                </div>
                <div className='w-49'>
                  <Controller
                    name="endDate"
                    control={controlEducation}
                    // rules={isPursuing ? { required: false } : { required: true }}
                    rules={{
                      required: !isPursuing,
                      validate: (value) => {
                        const startDate = getValues('startDate');
                        if (startDate && value) {
                          if (dayjs(value).isBefore(dayjs(startDate))) {
                            return "End date cannot be less than start date";
                          }
                          if (dayjs(value).isAfter(dayjs()) && !isPursuing) {
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
                        // maxDate={isPursuing? null : dayjs().tz(default_timeZone).tz(system_timeZone, true)}
                        // minDate={isPursuing? dayjs().tz(default_timeZone).tz(system_timeZone, true) : null}
                        size="medium"
                        // disabled={isPursuing}
                        disableFuture={isPursuing? false: true }
                        disablePast={isPursuing? true : false}
                        error={isPursuing ? false : !!errorsEducation.endDate}
                        helperText={errorsEducation.endDate?.message as string}
                      />
                    )
                    }
                  />
                </div>

              </div>
            </div>
            
            <Controller
              name="isCurrentlyPursuing"
              control={controlEducation}
              render={({ field: { onChange, value } }) => (
                <CustomCheckBox
                  label="Is Currently Pursuing"
                  onChange={(e: any) => {
                    setIsPursuing(e.target.checked)
                    onChange(e.target.checked)
                    setValue('endDate', null)
                    setError('endDate', {message: ''})
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
                onClick={handleEducationDetailsClose}
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
      
      <Dialog className='suggest-ins-popup' open={openSuggestInstituteDialog}>
        <div className='popup-header'>
          <h2>Suggest Institute</h2>
          <CloseIcon onClick={() => {setOpenSuggestInstituteDialog(false) }} />
        </div>
        <DialogContent>
                <form onSubmit={handleSubmitSuggestInstitute(onSubmitSuggestInstitute)}  className='suggest-inst-form' >
                  <div className='d-flex flex-row justify-between'>
                    <div className='w-100 mb-15'>
                      <Controller
                        name="institutionName"
                        control={controlSuggestInstitute}
                        key= "institutionName"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomTextField
                            label="Institution Name"
                            onChange={onChange}
                            value={value || ""}
                            error={!!errorsSuggestInstitute.institutionName}
                            helperText={errorsSuggestInstitute.institutionName?.message}
                          />
                        )}
                      />
                    </div>
                    <div className='w-49 mb-15'>
                      <Controller
                        name="country"
                        control={controlSuggestInstitute}
                        key = "country"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomAutocomplete
                          options={countriesData?.data}
                          getOptionLabel={(countryOptions: CountryProps) =>
                            countryOptions.name
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={value || null  }
                            label="Country"
                            onChange={(_, selectedValue) => {
                              onChange(selectedValue);
                              resetSuggestInstituteValues('state');
                              resetSuggestInstituteValues('city');
                            }}
                            error={!!errorsSuggestInstitute.country}
                          />
                        )}
                      />
                    </div>
                   
                    <div className='w-49 mb-15'>
                      <Controller
                        name="state"
                        control={controlSuggestInstitute}
                        key = "state"
                        rules={{ required: true }}
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
                              resetSuggestInstituteValues('city');
                            }}
                            error={!!errorsSuggestInstitute.state}
                            disabled={!selectedCountry}
                          />
                        )}
                      />
                    </div>

                    <div className='w-49 mb-15'>
                      <Controller
                        name="zipcode"
                        control={controlSuggestInstitute}
                        key= "zipcode"
                        rules={{
                          required: true,
                          minLength: 5,
                        }}
                        render={({ field: { onChange, value } }) => (
                          <CustomTextField
                            label="Zipcode"
                            onChange={onChange}
                            // type='tel'
                            value={value || ""}
                            error={!!errorsSuggestInstitute.zipcode}
                            helperText={
                              errorsSuggestInstitute.zipcode
                                ? 'Minimum length is 5 characters': ''
                            }
                            inputProps={{ maxLength: 11 }}
                          />
                        )}
                      />
                    </div>
                    
                    <div className='w-49 mb-15'>
                       <Controller
                        name="city"
                        control={controlSuggestInstitute}
                        key = "city"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomAutocomplete
                            options={citiesData?.data}
                            getOptionLabel={(cityOptions: CityProps) =>
                              cityOptions.name
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={value || null }
                            label="City/Town"
                            onChange={(_, selectedValue) => {
                              onChange(selectedValue);
                            }}
                            error={!!errorsSuggestInstitute.city}
                            disabled={!selectedState}
                          />
                        )}
                      />
                    </div>
                    <div className='w-100 mb-30'>
                      <Controller
                        name="website"
                        control={controlSuggestInstitute}
                        key= "website"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomTextField
                            label="Website Url"
                            onChange={onChange}
                            value={value || ""}
                            error={!!errorsSuggestInstitute.website}
                          />
                        )}
                      />
                    </div>

                    <div className="w-100 d-flex justify-center mt-20">
                      <CustomButton
                        type="submit"
                        label="Suggest"
                        className="submit-btn"
                        // onClick={() => setOpenSuggestInstituteDialog(false)}
                      />

                    </div>
                  </div>
                </form>
        </DialogContent>
      </Dialog>

      <Dialog className='suggest-course-popup' open={openSuggestCourse}>
        <div className='popup-header'>
          <h2>Suggest Course</h2>
          <CloseIcon onClick={() => setOpenSuggestCourse(false)} />
        </div>
        <DialogContent>
                <form onSubmit={handleSubmitSuggestCourse(onSubmitSuggestCourse)} className='suggest-course-form'>
                  <div className='d-flex flex-row justify-between mt-20'>
                    <div className='w-32 mb-15'>
                      <Controller
                        name="level"
                        control={controlSuggestCourse}
                        key= "level"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomAutocomplete
                            options={levelData?.data}
                            getOptionLabel={(levelOptions: LevelProps) =>
                              levelOptions.name
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={value || null }
                            label="Level"
                            onChange={(_, selectedValue) => {
                              onChange(selectedValue);
                            }}
                            error={!!errorsSuggestCourse.level}
                          />
                        )}
                      />
                    </div>
                    <div className='w-66 mb-15'>
                      <Controller
                        name="degree"
                        control={controlSuggestCourse}
                        key= "degree"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                              options={courseData?.data}
                              getOptionLabel={(courseOptions: CourseProps) =>
                                courseOptions.courseName
                              }
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              value={value || null}
                              label="Degree"
                              onChange={(_, selectedValue) => {
                                onChange(selectedValue);
                              }}
                              error={!!errorsSuggestCourse.degree}
                            />
                        )}
                      />
                    </div>
                    <div className='w-100 mb-30'>
                      <Controller
                        name="studyField"
                        control={controlSuggestCourse}
                        key= "studyField"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <CustomTextField
                            label="Field of Study"
                            onChange={onChange}
                            value={value || ""}
                            error={!!errorsSuggestCourse.studyField}
                            helperText={errorsSuggestCourse.studyField?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="w-100 d-flex justify-center mt-20 mb-30">
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
    </>
  );
}

export default EducationDetails;