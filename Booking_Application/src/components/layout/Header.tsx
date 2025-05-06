import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Avatar, Badge, Dialog, DialogActions, DialogContent, Menu, MenuItem, TextField } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import CustomButton from "../CustomButton";
import { useLogout } from "../../hooks/useLogout";
import { AuthContext } from "../../context/auth/AuthContext";
import { Settings } from "@mui/icons-material";
import { CLIENT_URL, SERVER_URL } from "../../services/axios";
import { socket } from "../../utils/Socket";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import request from "../../services/http";
import { DELETE_BOOKED_OPEN_AVAILABILITY, GET_DASHBOARD_SEARCH_OPTIONS, GET_EVENT_DETAILS, GET_NOTIFICATIONS, READ_NOTIFICATION, UPDATE_BOOKED_OPEN_SLOT, UPDATE_THEME } from "../../constants/Urls";
import { useRef } from 'react';
import moment from 'moment-timezone';
import EvntCrtIcon from "../../styles/icons/EvntCrtIcon";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import CancelEvntIcon from "../../styles/icons/CancelEvntIcon";
import CancelRequestIcon from "../../styles/icons/CancelRequestIcon";
import SearchIcon from "../../styles/icons/SearchIcon";

// Theme Update
import { ThemeContext } from "../../context/theme/ThemeContext";
import { ThemeActionTypes } from "../../context/theme/ThemeContextTypes";
import { queryClient } from "../../config/RQconfig";
import CustomCheckBox from "../CustomCheckbox";
import { getThemesInHeader } from "../../utils/PlanFeatures";
import CloseIcon from "@mui/icons-material/Close";
import EditEvent from "../../pages/EditEvent";
import RespondInvite from "../../pages/RespondInvite";
import EditAvailabilityRespondInvite from "../../pages/talentpartner/EditAvailabilityRespondInvite";
import WarningIcon from "../../styles/icons/WarningIcon";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import CustomAutocomplete from "../CustomAutocomplete";
import { Alarm } from '@mui/icons-material';


interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const drawerWidth = 240;
const navItems = ["Home", "About", "Contact"];

interface SearchOptionType {
  id:number; 
  category:string;
  name:string;
  path: string;
}


const removeDuplicatesObject = (data: any[]) => {
  return Array.from(
    new Map(                                                     
      data?.map((obj: any) => {
        // Create a key ignoring `id` and `createdAt`
        const { id, createdAt, ...rest } = obj;
        return [JSON.stringify(rest), obj];
      })
    ).values()
  )
}

export default function Header(props: Props) {
  const navigate = useNavigate()
  const { mutate: mutateLogout } = useLogout()
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const default_timeZone_abbr = state?.timezone ? state?.timezone.abbreviation : moment().tz(system_timeZone).format('z')
  const { state: stateTheme } = useContext(ThemeContext);
  const { dispatch: dispatchTheme } = useContext(ThemeContext);
  const [notifications, SetNotifications] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState<any>()
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteDialogState, setDeleteDialogState] = useState<boolean>(false);
  const [singleDeleteState, setSingleDeleteState] = useState<{ id: number; booked: boolean }>()
  const [searchableOption,setSearchableOption]=useState<SearchOptionType | null>(null)
  const [searchableOptions,setSearchableOptions]=useState<SearchOptionType[] | null>(null)
  const { searchId } = useParams<{ searchId: string }>(); 
  const searchableResponseDataRef=useRef<SearchOptionType[]>([])

  useEffect(() => {
    socket.on('SLOT_BOOKED_BY_RECRUITER', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });

    socket.on('USER_PASSED_MFA',(data):void=>{
      console.log(data,"data")
      // SetNotifications(data)

    });
    socket.on('EVENT_CANCELLED_BY_RECRUITER', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('EVENT_CANCEL_REQUEST_OR_WITHDRAWN_REQUEST_BY_TP', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('OPEN_SLOT_EVENT_BOOKED', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    socket.on('EVENT_NOTIFICATION', (data): void => {
      !data?.isNotificationDisabled && SetNotifications(notifications => removeDuplicatesObject([data, ...notifications]))
      queryClient.invalidateQueries('events')
      queryClient.invalidateQueries('upcomingEvents')
      queryClient.invalidateQueries('event-hub-history')
    });
    socket.on('PROPOSE_NEW_TIME', (data): void => {
      SetNotifications(notifications => [data, ...notifications])
    });
    // Cleanup function to remove event listener when component unmounts
    return () => {
      socket.off('SLOT_BOOKED_BY_RECRUITER');
      socket.off('EVENT_CANCELLED_BY_RECRUITER')
      socket.off('EVENT_CANCEL_REQUEST_OR_WITHDRAWN_REQUEST_BY_TP')
      socket.off('OPEN_SLOT_EVENT_BOOKED')
      socket.off('EVENT_NOTIFICATION')
      socket.off('PROPOSE_NEW_TIME')
      socket.off('USER_PASSED_MFA')
    };
  }, []);


  const {
    data: searchOptionsResponse
  } = useQuery("dashboard-search-options", () =>
    request(GET_DASHBOARD_SEARCH_OPTIONS),{
      onSuccess(data){
        searchableResponseDataRef.current=data?.data ?? []
      }
    }
  );


  const themes = getThemesInHeader(state.subscription as number)

  const { data: notificationsData, refetch } = useQuery('notifications', () => request(GET_NOTIFICATIONS), {
    onSuccess: (data) => {
      SetNotifications(removeDuplicatesObject(data?.data))
    }
  })
  const notificationCount = notifications.filter((item: any) => !item.isRead).length

  // useEffect(() => {
  //   if (notificationsData?.data) {
  //     SetNotifications(notificationsData?.data)
  //   }
  // }, [notificationsData])

  const { mutate: mutateReadNotification } = useMutation((body: object) => request(READ_NOTIFICATION, "put", body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('notifications');
      },
    })

  const { data: eventDetails } = useQuery(['event-details', formData?.eventId], () => request(`${GET_EVENT_DETAILS}/${formData?.eventId}`), {enabled: !!formData?.eventId})
  const event_details = eventDetails?.data || {}
    const handleReadNotification = (ids: number[], isRead: boolean, type: string, data: any) => {
      !isRead && mutateReadNotification({ids})
      if(type === "create_event" || type === "cancel_event" || type === "update_event") {
        setFormData({
         ...data,
         date: dayjs(data.datetime).tz(default_timeZone).format("DD-MM-YYYY"),
         time: dayjs(data.datetime).tz(default_timeZone).format("h:mm A"),
         booked: true,
         statusId: data?.openAvailabilityData?.statusId,
         receiverName: data?.openAvailabilityData?.receiverName,
         receiverEmail: data?.openAvailabilityData?.receiverEmail,
         id: data?.openAvailabilityId,
         comments: data?.openAvailabilityData?.comments
        })
        
        const isPastEvent = dayjs().tz(default_timeZone) > dayjs(data.datetime).tz(default_timeZone)
        if (isPastEvent) {
          return showToast(ToastActionTypes.ERROR, "You Can't Perform Actions on Past Events")
        }
        else {
          setOpenDialog(true)
          setAnchorEl(null)
        }
      }
    }

    const { mutate:deleteBookedOpenAvailability} = useMutation((body: object) => request(DELETE_BOOKED_OPEN_AVAILABILITY, "delete", body),
  {
    onSuccess: (data) => {
      queryClient.invalidateQueries('open-availability-history');
      queryClient.invalidateQueries('notifications');
      showToast(ToastActionTypes.SUCCESS, data.message)
      setOpenDialog(false)
    },
  })

    const handleConfirmDelete = () => {
        deleteBookedOpenAvailability({ id: singleDeleteState?.id });
        setDeleteDialogState(false)
    }

    const handleAllNotificationRead = () => {
      const ids = notifications.map((item) => item.id)
      mutateReadNotification({ids})
    }

  const links = [
    { link: "Analytics", route: "/analytics" },
    {
      link: "Home Page",
      route: '/dashboard'
    },
  ];
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;
  const open = Boolean(anchorEl);

  const handleOpenNotification = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseNotification = () => {
    setAnchorEl(null);
  };

  // const setTheme = (themeName: string) => {
  //   document.body.className = themeName;
  // }
  const [theme, setTheme] = useState(stateTheme?.theme || 'thm-blue');

  const { mutate: updateTheme } = useMutation((body: object) => request(UPDATE_THEME, "post", body),{
    onSuccess: (data) => {
      dispatchTheme({
        type: ThemeActionTypes.SET_THEME_CONTEXT,
        payload: { theme: data?.theme }
      })
      queryClient.invalidateQueries('events')
    },
  })
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const getStyles = () => {
    if (theme === "thm-blue") {
      return {backgroundColor: '#e6f3ff'}
    }
    else if (theme === 'thm-orange') {
      return {backgroundColor: '#F9943B'}
    }
    else if (theme === "thm-green") {
      return {backgroundColor: '#45A3AB'}
    }
    else if (theme == "thm-light") {
      return {backgroundColor: 'orange'}
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    updateTheme({ newTheme });
  };

  const [position, setPosition] = useState(0);
  const userAccountProfile = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setPosition(prevPosition => prevPosition + 62);

    setTimeout(() => {
      mutateLogout({});
    }, 900);
  }

  const formattedDatetime = (datetime: string) => {
    const newDatetime = dayjs(datetime).tz(default_timeZone);
    return `${dayjs(newDatetime).format('MMMM Do, YYYY')} at ${dayjs(newDatetime).format('h:mm A')} ${default_timeZone_abbr}`
  }

  // Function to get Event title for Notifications based on Item.type
  const getCustomEventTitle = (type: string) => {
    switch (type) {
      case "create_event":
        return "Event Created";
      case "cancel_event":
        return "Event Cancelled";
      case "cancel_request_event":
        return "Event Cancel Request";
      case "reminder":
        return "Reminder";
      default:
        return "Notification";
    }
  };

  // Function to Show Icon based on event type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "create_event":
      case "update_event":
        return <EvntCrtIcon />;
      case "cancel_event":
        return <CancelEvntIcon />;
      case "cancel_request_event":
        return <CancelRequestIcon />;
      case "reminder":
        return <Alarm />;
      case "propose_new_time":
        return <NotificationsIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Time Format
  dayjs.extend(relativeTime);
  const formatNotificationTime = (datetime: string) => {
    return dayjs(datetime).fromNow();
  };

  const handleViewAllNotifications = () => {
    // Close the notification drawer
    setAnchorEl(null);
  
    // Redirect to the "All Notifications" page
    navigate('/all-notifications');
  };


  
  const onChangeSearch = (event: React.SyntheticEvent, value: SearchOptionType | null) => {
    let matchedOptionPosition: number | null = null;
    let matchedOption = null as SearchOptionType | null;

    if (searchableOptions && value) {
        searchableOptions.forEach((option: SearchOptionType, index: number) => {
            if (option.id === value.id) {
                matchedOption = option;
                matchedOptionPosition = index;
            }
        });
    }

    setSearchableOption(value);

    if (matchedOption && matchedOptionPosition !== null) {
        if (searchableResponseDataRef.current) {
            const matchedItem = searchableResponseDataRef.current.splice(matchedOptionPosition, 1)[0];
            searchableResponseDataRef.current.unshift(matchedItem);
            console.log(searchableResponseDataRef.current)
        }

        navigate(`/search-dashboard/${matchedOption.path}`);
    }
};



  const resetSearchableField=()=>{
    if(searchableOption)
      setSearchableOption(null)
  }

  useEffect(()=>{
    if(!searchId){
      resetSearchableField()
    }
  },[searchId])

  const handleSearchInputChange=(_: any, value: string)=>{
    if(!value && searchableOptions?.length){
      setSearchableOptions([])
    }

    let inputSearchTextValue = value.toLowerCase().trim();
    const prefixMatch = inputSearchTextValue.match(/^(\w+):\s*(.*)$/);
    if (prefixMatch) {
      const categoryPrefix = prefixMatch[1].toLowerCase(); // Extract prefix (like 'rep' or 'task')
      const newSearchOptionsList=searchableResponseDataRef.current.filter((option:SearchOptionType)=>categoryPrefix === option.category.toLowerCase())
      setSearchableOptions(newSearchOptionsList)
    }else if(inputSearchTextValue){
      setSearchableOptions(searchableResponseDataRef.current ?? [])
    }

  }

  return (
    <>
    <Box className="main-header-wrapper position-relative mb-90" sx={{ display: "flex" }}>
      <CssBaseline />
      {/* //start of css by Harshit 17/04/2024 */}
      <AppBar component="nav" className="main-navbar">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: "none", sm: "block" }, marginRight: '30px' }}
          >
            <img src="/react.svg" onClick={() => navigate('/d3-analytics')} height="50" width="50" />
          </Typography>

          <div id="main-nav">
            <div id="nav-items">

              <Box sx={{ display: { xs: "none", sm: "flex" }, marginLeft: "10px", gap: 5 }} className="nav-links-items w-100">
                <div className="hdr-menu-items">
                  {links.map(({ link, route }) => (
                    <NavLink
                      to={route}
                      key={link}
                      className={({ isActive }) =>
                        isActive ? "active" : "not-active"
                      }
                      onClick={resetSearchableField}
                    >
                      {link}
                    </NavLink>
                  ))}
                </div>
                <div className="hdr-search">
                  <CustomAutocomplete
                    label=""
                    options={searchableOptions ?? []}
                    getOptionLabel={(item) => item.name}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    onChange={onChangeSearch}
                    onInputChange={handleSearchInputChange}       
                    size="small"
                    sx={{ width: 250, mx: 1 }}
                    disableClearable={true}
                    className="search-in-header"
                    value={searchableOption}
                    placeholder="Search..." 
                  />
                  <span className="srch_icn">
                    <SearchIcon />
                  </span>
                </div>
              </Box>
            </div>
            {/* <Box sx={{ flexGrow: 1 }} /> */}
            {/* <Link to={`${CLIENT_URL}/available-slots/${state.userId}`} target="_blank" style={{ color: "#fff", textDecoration: 'none', fontSize: 20 }}>Available Slots Link</Link> */}
            <div className="d-flex items-center">
              <span className="user_type" style={{ marginRight: '20px' }}>{state?.userTypeName}</span>
              <IconButton
                size="large"
                aria-label="show 17 new notifications"
                color="inherit"
                className="notifation-count-badge"
                onClick={handleOpenNotification}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <img src="/bell.png" className="light-theme-dark-icon" height="40" width="40" />
                </Badge>
              </IconButton>
              <Link to="/settings">
                <IconButton
                  size="large"
                  aria-label="show 4 new mails"
                // color="inherit"
                >
                  <img src="/setting-icon.png" className="light-theme-dark-icon" height="40" width="40" />
                </IconButton>
              </Link>
              <div
                id="user-account-profile"
                ref={userAccountProfile}
                style={{ position: 'relative', left: `${position}px`, transition: 'left 0.7s', zIndex: 2 }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  className="user-icon"
                  color="inherit"
                  onClick={() => navigate("/user")}
                >
                  <Avatar src={`${SERVER_URL}/public/images/profilePictures/${state.profilePicture}`} sx={{ width: 40, height: 40 }} />
                  {/* <img src="/user-icon.png" height="50" width="50" /> */}
                </IconButton>
              </div>
              {/* <CustomButton className="logout_btn" label="Logout" color="error" onClick={() => mutateLogout({})} /> */}
              <span className="logout_btn">
                <img src="/logout-icon.png" width="26" onClick={handleClick} />
              </span>
            </div>
          </div>
          {/* end of css  */}
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}

        </Drawer>
      </nav>
      <Box component="main">
        <Toolbar />
      </Box>
      <Menu
        id="notification-panel"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseNotification}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        slotProps={{
          paper: {
            style: {
              maxHeight: 450,
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div className="mt-0 mb-10 d-flex justify-between items-center">
            <h2 className="mt-0 pl-20 mb-zero">Notifications</h2>
            {notificationCount > 1 && <div className="pr-20 font-12">
              <CustomCheckBox label="Mark all as read" labelPlacement="end" onChange={handleAllNotificationRead} />
            </div>}
        </div>
        
        
        <ul className="notification-list">
          {notifications.length === 0 ? (
            <MenuItem className="no-notification"><span className="notification-txt">No New Notifications</span></MenuItem>
          ) : (
            notifications.map((item: any, index: number) => {
              if (item.type === "create_event" || item.type === "cancel_event" || item.type === "update_event") {
                return <div style={!item.isRead ? getStyles() : {}}> 
                <MenuItem className="d-flex flex-column" style={item.type === "cancel_event" ? {cursor: 'not-allowed', textDecoration: 'line-through'} : {}} key={index} onClick={() => item.type === "cancel_event" ? () => '' : handleReadNotification([item.id], item.isRead, item.type, item)}>
                        <span className="ntf_icn">
                          {getNotificationIcon(item.type)}
                        </span>
                        
                        <span className="w-100 d-flex justify-between items-center">
                          <span className="ntfc_tit">{item.title} {item.source === 'open_availabilities' ? '(Open Availability)' : item.source === 'event_hub_events' ? '(Event Hub)' : '(Outside)'}</span>
                          <span className="ntfc_tme">{formatNotificationTime(item.datetime)}</span>
                        </span>
                        <div className="notification-txt">
                          <div className="w-75">{item.description} {formattedDatetime(item.datetime)}.</div>
                          <div style={{float: 'right'}}>- {item.emailAccount}</div>
                        </div>
                      </MenuItem>
                    </div>
              }
              // else if (item.type === 'reminder') {
              //   return <MenuItem key={index}><span className="notification-txt" onClick={() => handleReadNotification([item.id], item.isRead, item.type, item)}>
              //     {`${item.description} at ${formattedDatetime(item.datetime)}.`}
              //   </span></MenuItem>
              // }
              else if (item.type === 'propose_new_time') {
                return <div style={!item.isRead ? getStyles() : {}}>
                <MenuItem key={index} className="d-flex flex-column" onClick={() => handleReadNotification([item.id], item.isRead, item.type, item)}>
                  <span className="ntf_icn">
                          {getNotificationIcon(item.type)}
                  </span>
                  <span className="w-100 d-flex justify-between items-center">
                          <span className="ntfc_tit">{item.title} (Proposed New Time)</span>
                  </span>
                  <div className="notification-txt">
                          <div className="w-75">{item.description} {formattedDatetime(item.datetime)}.</div>
                        </div>
                </MenuItem>
                </div>
              }
              else if (item.type === 'reminder') {
                return <div style={!item.isRead ? getStyles() : {}}>
                <MenuItem key={index}><span className="notification-txt" onClick={() => handleReadNotification([item.id], item.isRead, item.type, item)}>
                  <span className="ntf_icn">
                          {getNotificationIcon(item.type)}
                  </span>
                  {item.description} - {item.datetime ? formattedDatetime(item.datetime) : null}
                  </span></MenuItem>
                  </div>
              }
              else {
                return <div style={!item.isRead ? getStyles() : {}}>
                <MenuItem key={index}><span className="notification-txt" onClick={() => handleReadNotification([item.id], item.isRead, "", {})}>
                  {item.description} {item.datetime ? formattedDatetime(item.datetime) : null}
                  </span></MenuItem>
                  </div>
              }
              
            }))
          }
        </ul>
        <div className="all_ntfct_lnk">
          <span className="pointer" onClick={handleViewAllNotifications}>View All Notification</span>
        </div>
        
      </Menu>
      <div className="color-mode-col">
        <div className="theme-options">
          {themes.map((themeItem) => (
            <span
              key={themeItem.name}
              className={`${themeItem.name.replace('thm-', '')}-opt ${theme === themeItem.name ? 'active' : ''}`}
              onClick={() => handleThemeChange(themeItem.name)}
            >
              <img src={themeItem.imgSrc} alt={themeItem.alt} />
            </span>
          ))}
        </div>
      </div>
    </Box>

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
          {formData?.source === 'open_availabilities' ? <EditAvailabilityRespondInvite formData={{...formData, eventDurationInMinutes: event_details?.eventDurationInMinutes}} URL={UPDATE_BOOKED_OPEN_SLOT} setOpenDialog={setOpenDialog} setDeleteDialogState={setDeleteDialogState} setSingleDeleteState={setSingleDeleteState} notification={true} /> 
          : 
          <>
          {formData?.creator ? <EditEvent formData={{...formData, ...event_details, startTimeValue: event_details.startTime, endTimeValue: event_details.endTime}} setOpenDialog={setOpenDialog} /> 
          : <RespondInvite formData={{...formData, ...event_details, startTime: dayjs(event_details?.startTime).tz(default_timeZone).format("D MMMM YYYY, h:mm A")}} setOpenDialog={setOpenDialog} />
          }
          </>
}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogState}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="confirm-popup"
      >
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Delete Record?</span></h2>
          <CloseIcon onClick={() => setDeleteDialogState(false)} />
        </div>
        <DialogContent>
          <h3 className="text-center">Are you sure you want to delete the selected slot(s)?</h3> 
        </DialogContent>
        <DialogActions>
        <CustomButton
            onClick={handleConfirmDelete}
            color="primary"
            className="primary_btns"
            label="Delete"
        />
          {/* <CustomButton onClick={() => handleConfirmDelete()} color="primary" label="Confirm" /> */}
          <CustomButton
              onClick={() => {
                setDeleteDialogState(false)
              }}
              color="secondary"
              className="secondary_btns"
              label="Cancel"
          />  
        </DialogActions>
      </Dialog>
    
  </>
  );
}
