import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from "react-query";
import request from "../services/http";
import { UPLOAD_PROFILE_PICTURE, GET_USER_DETAILS, GET_SKILLS, GET_SECONDARY_SKILLS, ADD_GENERAL_SKILLS, GET_GENERAL_SKILLS, DELETE_GENERAL_SKILLS, EDIT_USER_DETAILS, GET_SECONDARY_SKILLS_ALL, DELETE_PROFILE_PICTURE, GET_TIMEZONES, UPDATE_PERSONALITY_TRAITS, GET_ORGANIZATION, GET_DESIGNATION, Add_ABOUT_ME_TEXT, GET_COUNTRIES, GET_STATES, GET_CITIES } from "../constants/Urls";
import EditIcon from '@mui/icons-material/Edit';
import { SERVER_URL } from "../services/axios";
import dayjs from "dayjs";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomButton from "../components/CustomButton";
import { GridAddIcon, GridCloseIcon, GridDeleteIcon } from "@mui/x-data-grid";
import moment from "moment-timezone";
import CustomTextField from "../components/CustomTextField";
import "../styles/UserPageStyle.css"
import { Upload } from "@mui/icons-material";
import Slider from '@mui/material/Slider';
import EmojiPicker from 'emoji-picker-react';
import EducationDetails from "./EducationDetails";
import ExperienceDetails from "./ExperienceDetails";
import CloseIcon from "@mui/icons-material/Close";
import ImageCropper from "./ImageCropper";


interface SkillsProps {
  id: number;
  skillName: string;
  userAssociated: boolean;
}
interface CountryProps{
  id: number;
  name: string 
}
interface StateProps {
  id: number;
  name: string 
}
interface CityProps extends CountryProps {}

interface SecondarySkillsProps {
  id: number;
  secondarySkillName: string;
  userAssociated: boolean;
}

interface TimeZoneProps {
  id: number;
  timezone: string;
  value: string;
  abbreviation: string;
}

interface FormInputUserDetailsProps {
  fullname: string;
  email: string;
  designation: any;
  organization: any;
  country: CountryProps;
  state: StateProps | null;
  city: CityProps | null;
  timezone: TimeZoneProps;
}

interface SliderValues {
  collaboration: number;
  communication: number;
  criticalThinking: number;
  resilience: number;
  empathy: number;
}

const debounce = <F extends (...args: any[]) => void>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>) {
    const later = function () {
      func.apply(null, args);
    };

    clearTimeout(timeoutId!);
    timeoutId = setTimeout(later, delay);
  };
};

const UserPage = () => {
  const queryClient = useQueryClient();
  const { dispatch, state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState<boolean>(false);
  const [openAboutMeDialog, setOpenAboutMeDialog] = useState(false)
  // const [skillFreeText, setSkillFreeText] = useState<string>();
  // const [secondarySkillFreeText, setSecondarySkillFreeText] = useState<string>();
  const [combinedSkills, setCombinedSkills] = useState<SkillsProps[]>([]);
  const [combinedSecondarySkills, setCombinedSecondarySkills] = useState<SecondarySkillsProps[]>([]);
  // const [allTimeZones, setAllTimeZones] = useState<unknown[]>([])
  const [filteredSkillData, setFilteredSkillsData] = useState<SkillsProps[]>([]);
  const [filteredSecondarySkillData, setFilteredSecondarySkillsData] = useState<SecondarySkillsProps[]>([]);
  const [skillFreeTextCount, setSkillFreeTextCount] = useState<number>(0);
  const [secondarySkillFreeTextCount, setSecondarySkillFreeTextCount] = useState<number>(0);
  const [aboutMeText, setAboutMeText] = useState('')
  const [openEmoji, setOpenEmoji] = useState(false)
  const [readMore, setReadMore] = useState(false)
  const [openDialog2, setOpenDialog2] = useState(false);
  const inputRef = useRef<any>(null)
  const { handleSubmit: handleSubmitUserDetails,resetField: resetUserDetailValues , setValue, watch, control: controlUser, formState: { errors: errorsUser }, reset: resetUser } = useForm<FormInputUserDetailsProps>();

  const { data: countriesData, isLoading: countriesLoading, isError: countriesError } = useQuery('countries', () => request(GET_COUNTRIES));

  const selectedCountry = watch('country'); // Watch for country selection

  const { data: statesData, isLoading: statesLoading, isError: statesError } = useQuery(['states',selectedCountry], () => request(GET_STATES, 'get', {selectedCountry}),{
    enabled: !!selectedCountry
  });
  const selectedState = watch('state'); // Watch for state selection

  const { data: citiesData, isLoading: citiesLoading, isError: citiesError } = useQuery(['cities', selectedState], () => request(GET_CITIES, 'get', {selectedState}),{
    enabled: !!selectedState
  });

  const [sliderValues, setSliderValues] = useState<SliderValues>({
    collaboration: 60,
    communication: 60,
    criticalThinking: 60,
    resilience: 60,
    empathy: 60,
  });

  const debouncedUpdateSliderValues = useCallback(
    debounce((updatedValues: SliderValues) => {
      updateSliderValues(updatedValues);
    }, 1000),
    []
  );

  const handleSliderChange = (name: keyof SliderValues) => (
    event: Event,
    newValue: number | number[]
  ) => {
    const updatedValues = {
      ...sliderValues,
      [name]: newValue as number,
    };

    setSliderValues(updatedValues);
    debouncedUpdateSliderValues(updatedValues);

  };

  const { mutate: updateSliderValues } = useMutation((body: object) => request(UPDATE_PERSONALITY_TRAITS, "post", body))

  // useEffect(() => {
  //   //  const timeZones = moment.tz.names().map((timezone:any) => moment.tz(timezone).format('z')).filter((item:string) => !item.includes('-') && !item.includes('+'))
  //   const timeZones = moment.tz.names().map((timezone: string) => ({ timezone: timezone, abbr: moment.tz(timezone).format('z'), offset: moment.tz(timezone).format('Z') }))
  //   setAllTimeZones(timeZones)
  // }, [])

  const { reset, getValues,setError, clearErrors, handleSubmit, control, trigger, resetField, formState: { errors } } = useForm<any>({});

  const { data: skillsData, isLoading: skillsLoading, isError: skillsError } = useQuery('skills', () => request(GET_SKILLS));
  const { data: secondarySkillsData, isLoading: secondarySkillsLoading, isError: secondarySkillsError } = useQuery(['secondarySkills'], () => request(GET_SECONDARY_SKILLS_ALL, 'get', {}));

  const { data: generalSkillsData, isLoading: generalSkillsLoading, isError: generalSkillsError } = useQuery('generalSkills', () => request(GET_GENERAL_SKILLS), {
    enabled: !!skillsData,
  });

  const { data: timezones } = useQuery("timezones", () => request(GET_TIMEZONES))

  const { data: organizationData, isLoading: organizationLoading, isError: organizationError } = useQuery('organization', () => request(GET_ORGANIZATION));
  const { data: designationData, isLoading: designationLoading, isError: designationError } = useQuery('designation', () => request(GET_DESIGNATION));


  const { mutate: addGeneralSkills } = useMutation((body: object) => request(ADD_GENERAL_SKILLS, "post", body),
    {
      onSuccess: () => {
        // showToast(ToastActionTypes.SUCCESS, data.message)
        reset()
        queryClient.invalidateQueries('generalSkills');
      },
    })
  const { mutate: deleteGeneralSkills } = useMutation((body: object) => request(DELETE_GENERAL_SKILLS, "post", body),
    {
      onSuccess: () => {
        // showToast(ToastActionTypes.SUCCESS, data.message)
        queryClient.invalidateQueries('generalSkills');
      },
    })

  const { mutate: mutateAboutMeText } = useMutation((body: object) => request(Add_ABOUT_ME_TEXT, 'post', body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('user-details');
        showToast(ToastActionTypes.SUCCESS, data?.message)
        setOpenAboutMeDialog(false)
      }
    })
  useEffect(() => {
    if (skillsData && generalSkillsData?.data?.generalSkills) {
      const idsToRemove: number[] = generalSkillsData?.data?.generalSkills.map((skill: SkillsProps) => skill.id);
      const filteredArray: SkillsProps[] = skillsData?.data?.filter((skill: SkillsProps) => !idsToRemove.includes(skill.id));
      setFilteredSkillsData(filteredArray)
      setSkillFreeTextCount(skillsData?.data.length)
    }
    if (secondarySkillsData && generalSkillsData?.data?.generalSecondarySkills) {
      const idsToRemove: number[] = generalSkillsData?.data?.generalSecondarySkills.map((skill: SecondarySkillsProps) => skill.id);
      const filteredSecondarySkillsData: SecondarySkillsProps[] = secondarySkillsData?.data?.filter((skill: SecondarySkillsProps) => !idsToRemove.includes(skill.id));
      setFilteredSecondarySkillsData(filteredSecondarySkillsData)
      setSecondarySkillFreeTextCount(secondarySkillsData?.data.length)
    }
  }, [skillsData, secondarySkillsData, generalSkillsData]);

  const { data } = useQuery('user-details', () => request(GET_USER_DETAILS), {
    onSuccess: (data) => {
      if (data?.userData?.userPersonalityTrait) {
        setSliderValues(data?.userData?.userPersonalityTrait)
      }
      // dispatch({
      //   type: AuthActionTypes.SET_USER_PROFILE_PIC,
      //   payload: { profilePicture: data?.userData?.profilePicture }
      // })
      dispatch({
        type: AuthActionTypes.SET_USER_INFO,
        payload: { ...state, timezone: data?.userData?.timezone, profilePicture: data?.userData?.profilePicture }
      })
      const { timezone, fullname, email, organization, designation } = data?.userData
      const { city } = data?.userCurrentLocation || {}
      // let timezoneData: string | object = ''
      // if (timezone) {
      //   const abbr = moment.tz(timezone).format('z');
      //   const offset = moment.tz(timezone).format('Z');
      //   timezoneData = { timezone, abbr, offset };
      // };

      setOpenUserDialog(false)
      resetUser({ timezone, fullname, email, organization, designation, city , state: city?.state || null, country: city?.state?.country || null});
    }
  });

  useEffect(() => {
    if (data?.userData) {
      setAboutMeText(data?.userData?.aboutMeText ?? '')
    }
  }, [data?.userData])
  const { mutate } = useMutation((body: object) => request(UPLOAD_PROFILE_PICTURE, "post", body, { headers: { 'Content-Type': 'multipart/form-data' } }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('user-details');
        showToast(ToastActionTypes.SUCCESS, data?.message)
      }
    }
  );

  const { mutate: deleteProfilePicture } = useMutation((body: object) => request(DELETE_PROFILE_PICTURE, "delete", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-details');
      },
    })

  const handleDeleteProfilePicture = () => {
    deleteProfilePicture({})
  };

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

  const handleImageChange = async (file: any) => {
    const filedata = await convertBlobUrlToFile(file)
    mutate({ image: filedata });
  };

  const handleEditClick = () => {
    setOpenDialog(true);
    // setFormData(params.row);
    // setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  // const handleInputTextChange = (_: React.ChangeEvent<{}>, newInputValue: string) => {
  //   console.log(newInputValue);
  // };
  const handleDeleteSkill = (id: any, userAssociated: any) => {
    // Handle deletion logic here
    deleteGeneralSkills({ id: id, userAssociated: userAssociated, primarySkill: true })
    // console.log(id)
    // console.log(userAssociated)
  };
  const handleDeleteSecondarySkill = (id: any, userAssociated: any) => {
    // Handle deletion logic here
    deleteGeneralSkills({ id: id, userAssociated: userAssociated, primarySkill: false })
    // console.log(id)
    // console.log(userAssociated)
  };

  useEffect(() => {
    // Combine general skills and user associated general skills
    const combined = [
      ...(generalSkillsData?.data?.generalSkills || []),
      ...(generalSkillsData?.userAssociatedGeneralSkills || []).map((skill: SkillsProps) => ({
        ...skill,
        userAssociated: true
      }))
    ];
    setCombinedSkills(combined);
    const combinedSecondarySkills = [...(generalSkillsData?.data?.generalSecondarySkills || []),
    ...(generalSkillsData?.userAssociatedGeneralSecondarySkills || []).map((secondarySkill: SecondarySkillsProps) => ({
      ...secondarySkill,
      userAssociated: true
    }))]
    setCombinedSecondarySkills(combinedSecondarySkills)
  }, [generalSkillsData, generalSkillsData?.userAssociatedGeneralSkills, generalSkillsData?.userAssociatedGeneralSecondarySkills]);

  const onSubmit: SubmitHandler<any> = (data) => {
    if ((!data.skills && !data.secondarySkills) || (data?.skills?.length === 0 && !data.secondarySkills) || (!data.skills && data?.secondarySkills?.length === 0) || (data?.skills?.length === 0 && data?.secondarySkills?.length === 0)) {
      return showToast(ToastActionTypes.ERROR, "No Skills Found!!!")
    }
    const filteredSkills = data?.skills?.filter((value: SkillsProps) => value.id <= skillsData.data.length)
    const filteredSkillsText = data?.skills?.filter((value: SkillsProps) => value.id > skillsData.data.length)
    const filteredSecondarySkills = data?.secondarySkills?.filter((value: SecondarySkillsProps) => value.id <= secondarySkillsData.data.length)
    const filteredSecondarySkillsText = data?.secondarySkills?.filter((value: SecondarySkillsProps) => value.id > secondarySkillsData.data.length)

    addGeneralSkills({
      ...data, skills: filteredSkills?.map((item: SkillsProps) => item.id),
      secondarySkills: filteredSecondarySkills?.map((item: SecondarySkillsProps) => item.id),
      skillFreeText: filteredSkillsText?.map((item: SkillsProps) => item.skillName), secondarySkillFreeText: filteredSecondarySkillsText?.map((item: SecondarySkillsProps) => item.secondarySkillName)
    })
    reset();
    // setSkillFreeText("");
    // setSecondarySkillFreeText("");
    setOpenDialog(false)
    // console.log('submit clicked')
  }
  const { mutate: editUserDetails, isLoading: isEditUserDetailsLoading } = useMutation((body: object) => request(EDIT_USER_DETAILS, "post", body), {
    onSuccess: () => {
      queryClient.invalidateQueries('user-details');
      dispatch({
        type: AuthActionTypes.SET_USER_INFO,
        payload: {...state, timezone: data?.timezone }
      })
    }
  });
  const onSubmitUserDetails: SubmitHandler<FormInputUserDetailsProps> = (data) => {
    editUserDetails({
      ...data,
      timezone: data.timezone?.id ?? null,
      city: data.city?.id ?? null,
      organization: data.organization?.id ?? null,
      designation: data.designation?.id ?? null,
    })
  }

  const handleEmojiClick = async (emojiObject: any) => {
    const cursor = inputRef.current.selectionStart;
    setAboutMeText((prevText) => prevText.length < 999 ? prevText.slice(0, cursor) + emojiObject.emoji + prevText.slice(cursor) : prevText)
    const newCursor = cursor + emojiObject.emoji.length
    setTimeout(() => inputRef.current.setSelectionRange(newCursor, newCursor), 10)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Reset Add Skills form when dialog closes
  useEffect(() => {
    if (!openDialog) {
      reset();
    }
  }, [openDialog, reset]);

  return (
    <div className="user-main-page" >
      <div className="user-page-main-container d-flex align-center justify-between card-box">
        <div className="about-me w-30">
          <div className="about-main">
            <div className="user-profile">
              <div className="profile-icons">
                <img
                  src="/edit-icon.png"
                  height="25"
                  width="25"
                  className="user-edit dark-thm-white-icon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setOpenUserDialog(true)}
                />
                {/* <Avatar src={`${SERVER_URL}/public/images/profilePictures/${data?.userData?.profilePicture}`} sx={{ width: 120, height: 120 }} /> */}
                <Dialog
        open={openDialog2}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header" onClick={() => setOpenDialog2(false)}>
          <CloseIcon  />
        </div>
        <DialogContent>
          <ImageCropper closeDialog={()=> setOpenDialog2(false)} isProfilePic={true} handleProfilePicChange={handleImageChange}/>
        </DialogContent>
      </Dialog>


      {<Avatar src={`${SERVER_URL}/public/images/profilePictures/${data?.userData?.profilePicture}`} sx={{ width: 120, height: 120, objectFit:"contain", marginBottom:"8px" }} className="uploaded-image-preview"/>}
                {/* <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  id="profilePictureInput"
                /> */}
                <div className="d-flex justify-center align-center mb-50">
                  {/* <label className="mr-25" htmlFor="profilePictureInput"> */}
                    {/* <IconButton
                      aria-label="edit"
                      size="large"
                      component="span"
                    >
                      <Upload />
                    </IconButton> */}
                    {/* <b className="upload">Upload Profile</b> */}
                  {/* </label> */}
                  <label className="mr-25" onClick={()=>setOpenDialog2(true)}>
                  <b className="upload">Upload Profile</b>
                  </label>
                  <span onClick={handleDeleteProfilePicture}><b className="delete">Delete Profile</b></span>
                </div>

                {/* <IconButton
                  aria-label="delete"
                  onClick={handleDeleteProfilePicture} // Add the function to handle delete action
                  size="large"
                  component="span"
                >
                  <GridDeleteIcon />
                </IconButton> */}
              </div>
            </div>

            <div className="user-details">
              <strong className="user-name">{data?.userData?.fullname || 'NA'}</strong>
              <span className="user-email">{data?.userData?.email || 'NA'}</span>

              <div className="d-flex justify-center align-center">
                <strong className="details-heading mr-10">Job Info:</strong>
                <span>{data?.userData?.designation?.designation || 'NA'}</span>
              </div>

              <div className="d-flex justify-center align-center">
                <strong className="details-heading mr-10">Organization:</strong>
                <span>{data?.userData?.organization?.organization || 'NA'}</span>
              </div>

              <div className="d-flex justify-center align-center">
                <strong className="details-heading mr-10">Location:</strong>
                <span className="mr-10">   
                  {/* {data?.userCurrentLocation ? (
                  `${data.userCurrentLocation.city?.name || 'NA'}, 
                  ${data.userCurrentLocation.city?.state?.name || 'NA'}, 
                  ${data.userCurrentLocation.city?.state?.country?.name || 'NA'},`
                  ) : 'NA,'} */}
                  {data?.userCurrentLocation ? (
                  `${data.userCurrentLocation.city?.name},`) : 'NA,'}
                </span>
                <span>{default_timeZone || 'NA'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="skills w-30">
          <span className="skills-header">
            <header>Skills</header>
            {/* <EditIcon style={{ cursor: 'pointer' }} onClick={handleEditClick} /> */}
            <img src="/edit-icon.png" height="25" width="25" className="dark-thm-white-icon" style={{ cursor: 'pointer' }} onClick={handleEditClick} />
          </span>
          <div className="skills-details">
            <Stack direction="row" sx={{ display: "flex", flexWrap: "wrap" }}>
              {combinedSkills?.map((primarySkills, index) => (
                <Chip
                  key={index}
                  label={primarySkills.skillName}
                  size="small"
                  className="primary-skills primary-skills-tag"
                  sx={{ minWidth: 80, marginRight: 1, marginBottom: 2 }}
                  onDelete={() => handleDeleteSkill(primarySkills.id, primarySkills?.userAssociated)}
                  deleteIcon={<GridCloseIcon />}
                />
              ))}
            </Stack>

            <Stack direction="row" sx={{ display: "flex", flexWrap: "wrap" }}>
              {combinedSecondarySkills?.map((secondarySkills: SecondarySkillsProps, index) => (
                <Chip
                  key={index}
                  label={secondarySkills.secondarySkillName}
                  size="small"
                  className="secondary-skills secondary-skills-tag"
                  sx={{ minWidth: 80, marginRight: 1, marginBottom: 2 }}
                  onDelete={() => handleDeleteSecondarySkill(secondarySkills.id, secondarySkills?.userAssociated)}
                  deleteIcon={<GridCloseIcon />}
                />
              ))}
            </Stack>
          </div>

        </div>

        <div className="personality w-30">
          <div className="d-flex">
            <header>Personality Traits</header>
          </div>

          <div className="personality-main-content">
            <div className="personality-item collaboration-progress">
              <label htmlFor="Collaboration">Collaboration</label>
              <Slider
                value={sliderValues.collaboration}
                onChange={handleSliderChange('collaboration')}
                aria-label="Collaboration"
                valueLabelDisplay="auto"
              />
            </div>
            <div className="personality-item communication-progress">
              <label htmlFor="Communication">Communication</label>
              <Slider
                value={sliderValues.communication}
                onChange={handleSliderChange('communication')}
                aria-label="Communication"
                valueLabelDisplay="auto"
              />
            </div>
            <div className="personality-item critical-progress">
              <label htmlFor="Critical Thinking">Critical Thinking</label>
              <Slider
                value={sliderValues.criticalThinking}
                onChange={handleSliderChange('criticalThinking')}
                aria-label="Critical Thinking"
                valueLabelDisplay="auto"
              />
            </div>
            <div className="personality-item resilience-progress">
              <label htmlFor="Resilience">Resilience</label>
              <Slider
                value={sliderValues.resilience}
                onChange={handleSliderChange('resilience')}
                aria-label="Resilience"
                valueLabelDisplay="auto"
              />
            </div>
            <div className="personality-item empathy-progress">
              <label htmlFor="Empathy">Empathy</label>
              <Slider
                value={sliderValues.empathy}
                onChange={handleSliderChange('empathy')}
                aria-label="Empathy"
                valueLabelDisplay="auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="user-page-main-container card-box">
        <div>
          <div className="d-flex justify-between items-center mb-20">
            <h2 className="sec-title">About me</h2>
            <img
              src="/edit-icon.png"
              height="25"
              width="25"
              className="user-edit dark-thm-white-icon"
              style={{ cursor: 'pointer' }}
              onClick={() => { setOpenAboutMeDialog(true); setOpenEmoji(false); }}
            />
          </div>


          <div className="about-content">
            {readMore ? data?.userData?.aboutMeText : data?.userData?.aboutMeText?.slice(0, 150)}
            {data?.userData?.aboutMeText?.length > 150 && <small onClick={() => setReadMore(prev => !prev)}>...Read {readMore ? 'less' : 'more'}</small>}
          </div>
        </div>
      </div>

      <div className="user-page-main-container card-box">
        <EducationDetails />
      </div>

      <div className="user-page-main-container card-box">
        <ExperienceDetails />
      </div>

      {/* Popup form */}
      <Dialog className="skills popup" open={openDialog} onClose={handleCloseDialog}>
        <div className="popup-header">
          <h2>Add Skills</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
          {/* Your form content */}
          {/* Example: */}
          <form onSubmit={handleSubmit(onSubmit)} className="add-skill-form">
            
            <Controller
              name="skills"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                  options={filteredSkillData || []}
                  getOptionLabel={(skillOptions: SkillsProps) =>
                    skillOptions?.skillName
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={value || []}
                  label="Primary Skills"
                  sx={{ width: 300 }}
                  multiple={true}
                  freeSolo
                  onChange={(_, selectedValue) => {
                    value = selectedValue.slice(selectedValue.length - 1)[0]
                    let totalSkillsCount = generalSkillsData.userAssociatedGeneralSkills.length + generalSkillsData.data.generalSkills.length
                    if(selectedValue){
                      totalSkillsCount = (generalSkillsData.userAssociatedGeneralSkills.length + generalSkillsData.data.generalSkills.length + selectedValue.length)
                    }
                    if(totalSkillsCount <= 5 ){
                      if (errors.skills) {
                        clearErrors("skills");
                      }
                    if (typeof value !== "string") {
                      onChange(selectedValue)
                    }
                    else if (typeof value === "string" && value.trim() !== "") {
                      const trimmedValue = value.trim();
                      const filterSelectedValue = selectedValue?.filter((value: SkillsProps) => typeof value !== "string")
                         // Check if the skill already exists
                      const isDuplicate = filterSelectedValue.some((skill: SkillsProps) => skill.skillName.toLowerCase() === trimmedValue.toLowerCase());
                      const isSkillAlreadyExists = generalSkillsData?.data?.generalSkills?.some(
                        (skill: { id: number; skillName: string }) => skill.skillName.toLowerCase() === trimmedValue.toLowerCase()
                      );
                      const isUserSuggestedSkillAlreadyExists = generalSkillsData?.userAssociatedGeneralSkills?.some(
                        (skill: { id: number; skillName: string }) => skill.skillName.toLowerCase() === trimmedValue.toLowerCase()
                      );
                      if (!isDuplicate && !isSkillAlreadyExists && !isUserSuggestedSkillAlreadyExists) {
                        // Add the new skill if it's not a duplicate
                        onChange([...filterSelectedValue, { id: skillFreeTextCount + 1, skillName: trimmedValue }]);
                        setSkillFreeTextCount(skillFreeTextCount + 1);
                    } else {
                      setError("skills", {
                        type: "manual",
                        message: "Skill already exists",
                      });
                    }
                      // onChange([...filterSelectedValue, { id: skillFreeTextCount + 1, skillName: value.trim() }])
                      // setSkillFreeTextCount(skillFreeTextCount + 1)
                    }
                    }else {
                      setError("skills", {
                        type: "manual",
                        message: "You can select a maximum of five skills.",
                      });
                    }
                  }}
                  error={!!errors?.skills}
                  helperText={errors?.skills?.message as string} 
                  disabled={generalSkillsData && (generalSkillsData.userAssociatedGeneralSkills.length + generalSkillsData.data.generalSkills.length >=5) }
              
                />
              )}
            />
            <div className="mb-20">
              <Controller
                name="secondarySkills"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                    options={filteredSecondarySkillData || []}
                    getOptionLabel={(skillOptions: SecondarySkillsProps) =>
                      skillOptions?.secondarySkillName
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={value || []}
                    label="Secondary Skills"
                    multiple={true}
                    sx={{ width: 300 }}
                    freeSolo
                    onChange={(_, selectedValue) => {
                      value = selectedValue.slice(selectedValue.length - 1)[0]
                      let totalSecondarySkillsCount = generalSkillsData.userAssociatedGeneralSecondarySkills.length + generalSkillsData.data.generalSecondarySkills.length
                      if(selectedValue){
                        totalSecondarySkillsCount = (generalSkillsData.userAssociatedGeneralSecondarySkills.length + generalSkillsData.data.generalSecondarySkills.length + selectedValue.length)
                      }
                      if(totalSecondarySkillsCount <= 5){
                        if (errors.secondarySkills) {
                          clearErrors("secondarySkills");
                        }
                      if (typeof value !== "string") {
                        onChange(selectedValue)
                      }
                      else if (typeof value === "string") {
                        const trimmedValue = value.trim();
                        const filterSelectedValue = selectedValue?.filter((value: SecondarySkillsProps) => typeof value !== "string")
                          // Check if the skill already exists
                        const isDuplicate = filterSelectedValue.some((skill: SecondarySkillsProps) => skill.secondarySkillName.toLowerCase() === trimmedValue.toLowerCase());
                        const isSkillAlreadyExists = generalSkillsData?.data?.generalSecondarySkills?.some(
                          (skill: { id: number; secondarySkillName: string }) => skill.secondarySkillName.toLowerCase() === trimmedValue.toLowerCase()
                        );
                        const isUserSuggestedSkillAlreadyExists = generalSkillsData?.userAssociatedGeneralSecondarySkills?.some(
                          (skill: { id: number; secondarySkillName: string }) => skill.secondarySkillName.toLowerCase() === trimmedValue.toLowerCase()
                        );
                        if (!isDuplicate && !isSkillAlreadyExists && !isUserSuggestedSkillAlreadyExists) {
                          // Add the new skill if it's not a duplicate
                          onChange([...filterSelectedValue, { id: secondarySkillFreeTextCount + 1, secondarySkillName: selectedValue.slice(selectedValue.length - 1)[0] }])
                          setSecondarySkillFreeTextCount(secondarySkillFreeTextCount + 1)
                      } else {
                        setError("secondarySkills", {
                          type: "manual",
                          message: "Secondary Skill already exists",
                        });
                      }
                        // onChange([...filterSelectedValue, { id: secondarySkillFreeTextCount + 1, secondarySkillName: selectedValue.slice(selectedValue.length - 1)[0] }])
                        // setSecondarySkillFreeTextCount(secondarySkillFreeTextCount + 1)
                      } 
                    }else {
                      setError("secondarySkills", {
                        type: "manual",
                        message: "You can select a maximum of five secondary skills.",
                      });
                    }
                    }}
                    error={!!errors?.secondarySkills}
                    helperText={errors?.secondarySkills?.message as string}   
                    disabled={generalSkillsData && (generalSkillsData.userAssociatedGeneralSecondarySkills.length + generalSkillsData.data.generalSecondarySkills.length >=5)} 
                
                    />
                )}
              />
            </div>
            <div className="d-flex align-center">
              <Button onClick={handleCloseDialog} className="cancel-btn mr-25">Cancel</Button>
              <CustomButton
                type="submit"
                label="Add Skills"
                className="submit-btn mr-0"
              />
            </div>

          </form>
        </DialogContent>
      </Dialog>

      <Dialog className="about popup" open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <div className="popup-header">
          <h2>Add About Me</h2>
          <CloseIcon onClick={() => setOpenUserDialog(false)} />
        </div>
        <DialogContent className="noscroll_popup pl-0 pr-0">
          {/* Your form content */}
          {/* Example: */}
          <form onSubmit={handleSubmitUserDetails(onSubmitUserDetails)} onKeyDown={handleKeyDown}>
            
            <div className="popup-inner-content d-flex justify-between flex-row popup-content-scroll">
              <Controller
                name="fullname"
                control={controlUser}
                rules={{ 
                  required: "This field is required",
                  minLength: {
                    value: 6,
                    message: "Username must be at least 6 characters long",
                  },
                 }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextField
                    label="Fullname"
                    sx={{ width: 300 }}
                    onChange={onChange}
                    value={value || ""}
                    error={!!errorsUser.fullname}
                    inputProps={{ maxLength: 40 }}
                    helperText={errorsUser.fullname?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={controlUser}
                rules={{
                  // required: "This field is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextField
                    label="Email"
                    sx={{ width: 300 }}
                    onChange={onChange}
                    value={value || ""}
                    error={!!errorsUser.email}
                    disabled
                  // helperText={errorsUser.email?.message}
                  />
                )}
              />
              <Controller
                name="designation"
                control={controlUser}
                // rules={{ required: "This field is required" }}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                    label="Designation"
                    options={designationData?.data || []}
                    getOptionLabel={(options: { id: number, designation: string }) =>
                      options.designation
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={value || null}
                    onChange={(_, selectedValue) => {
                      onChange(selectedValue);
                    }}
                    size="small"
                    fullWidth
                    className="red-bg"
               
                  />
                )}
              />
              <Controller
                name="organization"
                control={controlUser}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                    label="Organization"
                    options={organizationData?.data || []}
                    getOptionLabel={(options: { id: number, organization: string }) =>
                      options.organization
                    }
                    isOptionEqualToValue={(option, value) => option.id == value.id}
                    value={value || null}
                    onChange={(_, selectedValue) => {
                      onChange(selectedValue);
                    }}
                    size="small"
                    fullWidth
                    className="red-bg"
                  />
                )}
              />
              {/* <Controller
                name="location"
                control={controlUser}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                    label="Location"
                    options={locationData?.data || []}
                    getOptionLabel={(options: { id: number, location: string }) =>
                      options.location
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={value || null}
                    onChange={(_, selectedValue) => {
                      onChange(selectedValue);
                    }}
                    size="small"
                    fullWidth
                    className="red-bg"
                  />
                )}
              /> */}
              <Controller
                name="country"
                control={controlUser}
                key = "country"
                // rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                options={countriesData?.data}
                getOptionLabel={(countryOptions: CountryProps) =>
                  countryOptions?.name
                }
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  // value={country || undefined  }
                  value={value || null}
                  label="Country"
                  onChange={(_, selectedValue) => {
                    onChange(selectedValue)
                    // resetUserDetailValues('state');
                    // resetUserDetailValues('city');
                    setValue('state', null);
                    setValue('city', null);
                  }}
        
                />
                )}
              />
                  <Controller
                    name="state"
                    control={controlUser}
                    key = "state"
                    rules={{ required: selectedCountry ? true : false }}
                    render={({ field: { onChange, value } }) => (
                    <CustomAutocomplete
                      options={statesData?.data}
                      getOptionLabel={(stateOptions: StateProps) =>
                        stateOptions.name
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      // value={selectedState || undefined }
                      value={value || null}
                      label="State/ Province/ Region"
                      onChange={(_, selectedValue) => {
                        // setSelectedState(selectedValue);
                        // resetUserDetailValues('city');
                        setValue('city', null);
                        onChange(selectedValue)
                      }}
                      error={!!errorsUser.state}
                      disabled={!selectedCountry}
                   />
                  )}
                  />
                  <Controller
                    name="city"
                    control={controlUser}
                    key = "city"
                    rules={{ required: selectedState ? true : false }}
                    render={({ field: { onChange, value } }) => (
                    <CustomAutocomplete
                      options={citiesData?.data}
                      getOptionLabel={(cityOptions: CityProps) =>
                        cityOptions?.name
                      }
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      // value={city || undefined }
                      value={value || null}
                      label="City/Town"
                      onChange={(_, selectedValue) => {
                        // setCity(selectedValue);
                        onChange(selectedValue)
                      }}
                      error={!!errorsUser.city}
                      disabled={!selectedState || !selectedCountry}

                    />
                  )}
                  />
              <Controller
                name="timezone"
                // rules={{ required: "This field is required" }}
                control={controlUser}
                render={({ field: { onChange, value } }) => (
                  <CustomAutocomplete
                    options={timezones?.data || []}
                    disableClearable={true}
                    getOptionLabel={(option) => option.timezone || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={value || null}
                    label="Timezones"
                    size="small"
                    sx={{ width: 300 }}
                    onChange={(_, selectedValue) => {
                      onChange(selectedValue);
                    }}
                    error={!!errorsUser.timezone}
                    // helperText={errorsUser.timezone?.message}
                  />
                )}
              />
            </div>
            <div className="form-act-fixed">
              <Button onClick={() => setOpenUserDialog(false)} className="cancel-btn mr-25">Cancel</Button>
              <CustomButton
                type="submit"
                label="Save"
                className="submit-btn mr-0"
                disabled={isEditUserDetailsLoading}
              />
              
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openAboutMeDialog} className="add-about-popup">
        <div className="popup-header">
          <h2>About Me</h2>
          <CloseIcon onClick={() => {setOpenAboutMeDialog(false); setAboutMeText(data?.userData?.aboutMeText || '')}} />
        </div>
        <DialogContent>
          <h3 className="mb-zero">About me</h3>
          <div className="d-flex justify-between items-center mb-15">
            <small>{`${aboutMeText?.length || 0}/1000`} Characters</small>
            <div className="position-relative">
              <div className="cursur-pointer" onClick={() => setOpenEmoji(!openEmoji)}>
                {String.fromCodePoint(parseInt('0x1f603', 16))}
              </div>
              <EmojiPicker open={openEmoji} onEmojiClick={handleEmojiClick} />
            </div>
          </div>
          <textarea maxLength={1000} ref={inputRef} onChange={(e) => setAboutMeText(e.target.value)} value={aboutMeText}></textarea>

          <div className="mt-20 d-flex justify-center">
            <CustomButton
              label="Cancel"
              className="cancel-btn mr-25"
              variant="outlined"
              onClick={() => {setOpenAboutMeDialog(false); setAboutMeText(data?.userData?.aboutMeText || '')}}
            />
            <CustomButton
              label="Save"
              className="submit-btn mr-0"
              onClick={() => mutateAboutMeText({ aboutMeText })}
      
            />
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}

export default UserPage