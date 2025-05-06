import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { useContext } from "react";

import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Margin, RadioButtonChecked, RadioButtonCheckedOutlined, RadioButtonCheckedRounded, RadioButtonUnchecked } from "@mui/icons-material";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

import HeadsetIcon from '@mui/icons-material/Headset';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomTextField from "../components/CustomTextField";
import { Button } from "@mui/material";

import Switch from '@mui/material/Switch';
import EditUserType from "./admin/EditUserType";
import SkillManagement from "./admin/SkillManagement";
import { AuthContext } from "../context/auth/AuthContext";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import request from "../services/http";
import { EDIT_TAB_NAME, EDIT_USER_DETAILS, GET_ALL_TABS, GET_TIMEZONES, GET_USER_DETAILS, NOTIFICATION_SETTING, SAVE_OPEN_AVAILABILITY_TEXT, UPDATE_TAG_LOGO_SETTING } from "../constants/Urls";
import { useMutation, useQuery } from "react-query";
import CustomButton from "../components/CustomButton";

import ChangePassword from "./ChangePassword";
import EditUserDetails from "./EditUserDetails";
import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import '../styles/Setting.css';
import { useEffect, useState } from "react";
import { GET_NOTIFICATIONS, UPDATE_THEME } from "../constants/Urls";
import { ThemeContext } from "../context/theme/ThemeContext";
import dayjs from "dayjs";
import Loader from "../components/Loader";
import { queryClient } from "../config/RQconfig";
import { SERVER_URL } from "../services/axios";
import showToast from "../utils/toast";
import { Applications, SubscriptionTypes, ToastActionTypes } from "../utils/Enums";
import { ThemeActionTypes } from "../context/theme/ThemeContextTypes";
import PlansInfo from "./PlansInfo";
import { getThemesInSettings } from "../utils/PlanFeatures";
import Clock from "../components/Clock";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import UpgradePopup from "./UpgradePopup";
import { useSubscriptions } from "../hooks/useSubscriptions";
import MFAComponent from "./MultiFactorAuthentication/MFAComponent";
import { EventsContext } from "../context/event/EventsContext";


const Settings: React.FC = () => {
  const { dispatch, state } = useContext(AuthContext);
  const {emailData} = useContext(EventsContext)
  const isEmailSynced = emailData?.filter(i => i.emailServiceProvider)?.length >= 1
  const {IS_BASIC} = useSubscriptions();
  const [searchParams] = useSearchParams()
  const [timezone, setTimezone] = useState({id:state?.timezone?.id,timezone: state?.timezone?.timezone});
  const [openUpgradePopup, setOpenUpgradePopup] = useState(false)
  const [tpPlanner, setTpPlanner] = useState<any>();
  const [recruiterMatch, setRecruiterMatch] = useState<any>()
  const navigate = useNavigate();
  const { state: stateTheme } = useContext(ThemeContext);
  const { dispatch: dispatchTheme } = useContext(ThemeContext);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element && element.scrollIntoView({ behavior: "smooth", inline: "nearest" });
  };
  const location = useLocation()
  const themes = getThemesInSettings(state.subscription as number)

  useEffect(() => {
    if(searchParams?.get('payment')) {
      showToast(ToastActionTypes.SUCCESS, "Payment successful",{toastId: 'non-duplicate-toast',})
    }
    navigate(window.location.pathname, { replace: true });
  },[])

  const [theme, setTheme] = useState(stateTheme?.theme || 'thm-blue');
  const [disableNotification, setDisableNotification] = useState<boolean>()
  const [disableTagLogo, setDisableTagLogo] = useState<boolean>(false)
  const { mutate: updateTheme } = useMutation((body: object) => request(UPDATE_THEME, "post", body),{
    onSuccess: (data) => {
      dispatchTheme({
        type: ThemeActionTypes.SET_THEME_CONTEXT,
        payload: { theme: data?.theme }
      })
      queryClient.invalidateQueries('events')
    },
  })
  const { data: tabs } = useQuery("all-tabs", () => request(GET_ALL_TABS),{
    enabled: state.userType === 3
  })
  const { data: timezones } = useQuery("timezones", () => request(GET_TIMEZONES))
  const { mutate: editUserDetails } = useMutation((body: object) => request(EDIT_USER_DETAILS, "post", body),{
    onSuccess:(data) => {
      dispatch({
        type: AuthActionTypes.SET_USER_INFO,
        payload: {...state, timezone: data?.timezone }
      })
    },
  });
  const { mutate: updateNotification, isLoading: isLoadingNotificationSetting} = useMutation((body: object) => request(NOTIFICATION_SETTING, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user-details-data');
    }
  })

  const { mutate: updateTagLogoSetting, isLoading: isLoadingTagLogoSetting} = useMutation((body: object) => request(UPDATE_TAG_LOGO_SETTING, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user-details-data');
    }
  })

  const { data, isRefetching } = useQuery("user-details-data", () => request(GET_USER_DETAILS),{
    onSuccess: (data) => {
      setDisableNotification(data?.userData?.isNotificationDisabled)
      setDisableTagLogo(data?.userData?.baOrgData?.isOrgDisabledTagLogo)
    }
  });
  const { mutate: mutateTabName, isLoading: isLoading} = useMutation((body: object) => request(EDIT_TAB_NAME, "post", body))

  useEffect(() => {
    if(tabs?.data) {
      setTpPlanner(tabs?.data?.filter((item: any) => item.tabId === 3 )[0])
      setRecruiterMatch(tabs?.data?.filter((item: any) => item.tabId === 8 )[0])
    }
  },[tabs])
console.log(tpPlanner)
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleThemeChange = (newTheme:string) => { 
    setTheme(newTheme);
    updateTheme({newTheme});
  };

  const handleUpdateNotification = (e:any, value: boolean) => {
    setDisableNotification(value)
    updateNotification({isDisabled: value})
  }
  const handleUpdateTagLogoSetting = (e:any, value: boolean) => {
    setDisableTagLogo(value)
    updateTagLogoSetting({isDisabled: value, orgId: state.orgId})
  }

  return (
    <>
      {(isLoadingNotificationSetting || isRefetching || isLoading) && <Loader />}
      <Box className="settings-page-container">
        <header className="icon-text w-100 mb-20 pt-0">
          <SettingsOutlinedIcon className="settings-icon-style" fontSize="large" />
          <h1 className="m-zero">Settings</h1>
        </header>
        <div className="setting-inner-wrapper d-flex align-start justify-between">
          <div className="settings-sidebar" >
            <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('accountPrefrences')}>
              <AccountCircleOutlinedIcon className="side-icons" />
              <p className="m-zero">Account Preferences</p>
            </div>

            <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('loginSecurity')}>
              <LockOutlinedIcon className="side-icons" />
              <p className="m-zero">Login & Security</p>
            </div>

            <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('appsetting')}>
              <AppSettingsAltIcon className="side-icons" />
              <p className="m-zero">App Setting</p>
            </div>

            <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('notifications')}>
              <NotificationsOutlinedIcon className="side-icons" />
              <p className="m-zero">Notifications</p>
            </div>

            <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('paymentSubscribtions')}>
              <PaymentOutlinedIcon className="side-icons" />
              <p className="m-zero">Payments & <br /> Subscribtions</p>
            </div>

            <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('customerSupport')}>
              <HeadsetIcon className="side-icons" />
              <p className="m-zero">Customer Support</p>
            </div>
            {state.userType === 3 &&
              <>
                <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('userTypeChange')}>
                  <p className="m-zero">UserType Change</p>
                </div>
                <div className="icon-text  hover-icon-text" onClick={() => scrollToSection('skillForms')}>
                  <p className="m-zero">Skill Forms</p>
                </div>
              </>
            }
          </div>

          <div className="settings-options">
            <div className="settings-inner-options" id="accountPrefrences" >
              <h3>Account Preferences</h3>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">User Profile</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/user')} />
              </div>
              <div className="settings-display-p-style d-flex align-center">
                <p className="mr-25"> Display Mode:</p>
                <div className="settings-color-mode">
                  {themes.map((themeItem) => (
                    <div
                      key={themeItem.name}
                      className={`${themeItem.box.replace('thm-', '')}-color color-box ${theme === themeItem.name ? 'active' : ''}`}
                      onClick={() => handleThemeChange(themeItem.name)}
                    >
                    </div>
                  ))}
                </div>
              </div>


              <div className="settings-cus-p-style d-flex align-center">
                <p className="mr-25">Time Zone:</p>
                <CustomAutocomplete
                    options={timezones?.data || []}
                    disableClearable={true}
                    getOptionLabel={(option) => option.timezone || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={timezone || null}
                    label="Timezones"
                    size="small"
                    sx={{ width: 300 }}
                    onChange={(_, selectedValue) => {
                      setTimezone(selectedValue)
                      editUserDetails({timezone: selectedValue?.id })
                    }}
                  />
              </div>


              <div className="settings-cus-p-style d-flex align-center">
                <p className="mr-25">Current Time:</p>
                <Clock />
              </div>
            </div>

            <div className="settings-inner-options" id="loginSecurity">
              <h3>Login & Security</h3>
              <EditUserDetails />
              <ChangePassword />
              {state?.userType===3? <MFAComponent/> : null}
             
            </div>

            <div className="settings-inner-options" id="appsetting">
              <h3>App Setting</h3>
              
              {state.appAccess?.includes(Applications.SLOT_BROADCAST) && 
              <>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Add New Tag</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => {
                  isEmailSynced ? navigate('/add-new-tag',{state:{from: location.pathname}}) : showToast(ToastActionTypes.ERROR, 'Sync your calendar to get started')
                }} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
              <p className="mr-25 user-label">Question List</p>
              <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/sample-questions')} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Blocked Email for booking slot</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/blocked-email-for-booking-slot')} />
              </div>
              </>
              }

              {state.appAccess?.includes(Applications.EVENT_HUB) &&  <>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Predefined Event Template</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/event-templates', {state:{from: location.pathname}})} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Predefined Audio/Video Config</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/predefined-meeting-list',{state:{from: location.pathname}})} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Group Creation { state.subscription === SubscriptionTypes.BASIC && <img src="/pro-icon-1.svg" width="30" /> }</p>
                <ArrowForwardIcon className="cursur-pointer" 
                onClick={ IS_BASIC ? () => setOpenUpgradePopup(true) : () => navigate('/group-creation',{state:{from: location.pathname}})} 
                />
              </div>
              </>
              }
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Contact List </p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/contact-list')} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Predefined Email Template</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/email-templates')} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Email Signature</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/create-email-signature')} />
              </div>

              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">API Key Management</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/api-key-management')} />
              </div>

              {state.userType === 3 &&
                <>
                  <div className="user-info-col d-flex items-center justify-between">
                    <p className="mr-25 user-label">Configrations</p>
                    <ArrowForwardIcon className="cursur-pointer" onClick={() => navigate('/admin-config')} />
                  </div>
                  <div className="user-info-col d-flex items-center justify-between">
                    <p className="mr-25 user-label">Disable Tag Logo</p>  
                    <Switch checked={disableTagLogo || false} onChange={handleUpdateTagLogoSetting} />
                  </div>
                </>
              }
            </div>

            <div className="settings-inner-options" id="notifications">
              <h3>Notifications</h3>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Notifications Disabled</p>  
                <Switch checked={disableNotification || false} onChange={handleUpdateNotification} />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Email Notifications</p>  
                <ArrowForwardIcon />
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Messages</p>  
                <ArrowForwardIcon />
              </div>
            </div>

            <div className="settings-inner-options" id="paymentSubscribtions">
              <h3>Payments & Subscribtions</h3>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Billing Information</p>  
                <ArrowForwardIcon onClick={() => navigate('/payment-plan')} /> 
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Payment History</p>  
                <ArrowForwardIcon /> 
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Plans & Pricing</p>  
                <ArrowForwardIcon onClick={() => navigate('/plans-and-pricing')} /> 
              </div>
              {/* <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Save Card Details</p>  
                <ArrowForwardIcon onClick={() => navigate('/save-card-details')}  /> 
              </div> */}
            </div>

            <div className="settings-inner-options" id="customerSupport">
              <h3>Customer Support</h3>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Email Support</p>  
                <ArrowForwardIcon onClick={() => navigate('/email-support')} /> 
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Faq</p>  
                <ArrowForwardIcon onClick={() => navigate('/faq')} /> 
              </div>
              <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Community</p>  
                <ArrowForwardIcon onClick={() => navigate('/community')} /> 
              </div>
            </div>

            {/* {state.userType === 3 &&
              <>
                <div className="settings-inner-options" id="userTypeChange">
                  <h3>User Type Change</h3>
                  <EditUserType />
                </div>
                <div className="settings-inner-options" id="skillForms">
                  <h3>Manage Dimensions</h3>
                  <SkillManagement />
                </div>
              </>
            } */}

          {/* {state.userType === 3 && <div className="settings-inner-options" id="customerSupport">
              <div className="mb-50">
                <h3 className="mb-30">Update tab names</h3>
                <div className="d-flex items-center mb-30">
                  <div className="w-49 mr-25">
                    <CustomTextField className="w-100" label="Tp planner" value={tpPlanner?.tabNameOrgGiven?.split(' Planner')[0]} onChange={(e) => setTpPlanner({tabId: tpPlanner?.tabId, tabNameOrgGiven: e.target.value + ' Planner'})} /> 
                  </div>
                  <CustomButton label="Save" className="mt-30" onClick={() => mutateTabName(tpPlanner)}/>
                </div>

                <div className="d-flex items-center mb-30">
                  <div className="w-49 mr-25">
                    <CustomTextField className="w-100" label="Recruiter Match" value={recruiterMatch?.tabNameOrgGiven?.split(' Match')[0]} onChange={(e) => setRecruiterMatch({tabId: recruiterMatch?.tabId, tabNameOrgGiven: e.target.value + " Match"})} />
                  </div>
                  <CustomButton label="Save" className="mt-30" onClick={() => mutateTabName(recruiterMatch)} />
                </div>
                 
              </div>
            </div>
          }  */}
          </div>
        </div>
      </Box>
      {openUpgradePopup && <UpgradePopup setOpenUpgradePopup={setOpenUpgradePopup} />}
    </>
  );
};


export default Settings