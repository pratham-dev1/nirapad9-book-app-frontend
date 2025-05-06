import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FrequentlyUsedEvents from "./FrequentlyUsedEvents";
import UpcomingEvents from "./UpcomingEvents";
import CustomButton from "../../components/CustomButton";

import ClockIcon from "../../styles/icons/ClockIcon";
import CalendarIcon from "../../styles/icons/CalendarIcon";
import CopyIcon from "../../styles/icons/CopyIcon";
import SettingIcon from "../../styles/icons/SettingIcon";
import AddIcon from "../../styles/icons/AddIcon";
import PredefinedEvents from "../PredefinedEvents";
import { AuthContext } from "../../context/auth/AuthContext";
import { Dialog, DialogActions, DialogContent } from "@mui/material";
import UpgradePopup from "../UpgradePopup";
import CloseIcon from "@mui/icons-material/Close";
import { Applications, SubscriptionTypes } from "../../utils/Enums";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import FrequentlyMetPeople from "./FrequentlyMetPeople";

type CompProps = {
    setUIMode: any;
    setEventValue: any;
}

const EventTypeView: React.FC<CompProps> = ({setUIMode, setEventValue}) => {
    const {state} = useContext(AuthContext)
    const hasSlotBroadcastAppAccess = state.appAccess?.includes(Applications.SLOT_BROADCAST)
    const hasEventHubAppAccess = state.appAccess?.includes(Applications.EVENT_HUB)
    const navigate = useNavigate()
    const [value, setValue] = React.useState(hasEventHubAppAccess ? '1' : hasSlotBroadcastAppAccess ? '2' : '1');
    const [openUpgradePopup, setOpenUpgradePopup] = useState(false)
    const {IS_BASIC} = useSubscriptions()
    const location = useLocation()
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const handleClick = (value: any) => {
        const eventTypeId = value.eventType.id
        if(IS_BASIC && (eventTypeId === 2 || eventTypeId === 3 || eventTypeId === 4)) {
            setOpenUpgradePopup(true)
        }
        else {
        setEventValue(value)
        setUIMode(3)
        }
    }
 
    return (
        
        <div className="w-100 evnt-hub-sec d-flex justify-between flex-row">
            
            <div className="w-100 d-flex flex-row justify-between align-start">
                <div className="w-100 d-flex flex-row justify-between mb-30">
                    <PredefinedEvents setUIMode={setUIMode} setEventValue={setEventValue} />
                    {/* Create Event Type */}
                    {hasEventHubAppAccess && <div className="create-events-options">
                        <div className="create-event-box-option">
                            <h4 className="text-center">One to One Event</h4>
                            <ul className="create-event-time-options">
                                <li onClick={()=>handleClick({eventType: {id: 1, value: "One to one"}, minutes: 15})}><ClockIcon /><span>15</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 1, value: "One to one"}, minutes: 30})}><ClockIcon /><span>30</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 1, value: "One to one"}, minutes: 45})}><ClockIcon /><span>45</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 1, value: "One to one"}, minutes: 60})}><ClockIcon /><span>60</span></li>  
                            </ul>
                        </div>
                        <div className={`create-event-box-option ${IS_BASIC ? "upgrade_col" : ""}`} 
                            onClick={IS_BASIC ? () => setOpenUpgradePopup(true) : () => ""}
                        >
                            <img className="upgrade-icon" src="/pro-icon-1.svg" width="30" />
                            {/* <UpgradePopup content={content}> */}
                            <h4 className="text-center">One to Many Event</h4>
                            <ul className="create-event-time-options">
                                <li onClick={()=>handleClick({eventType: {id: 2, value: "One to many"}, minutes: 15})}><ClockIcon /><span>15</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 2, value: "One to many"}, minutes: 30})}><ClockIcon /><span>30</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 2, value: "One to many"}, minutes: 45})}><ClockIcon /><span>45</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 2, value: "One to many"}, minutes: 60})}><ClockIcon /><span>60</span></li>  
                            </ul>
                        {/* </UpgradePopup> */}
                        </div>
                        <div className={`create-event-box-option mb-zero ${IS_BASIC ? "upgrade_col" : ""}`}
                        onClick={IS_BASIC ? () => setOpenUpgradePopup(true) : () => ""}
                        >
                            <img className="upgrade-icon" src="/pro-icon-1.svg" width="30" />
                            <h4 className="text-center">Group Event</h4>
                            <ul className="create-event-time-options">
                                <li onClick={()=>handleClick({eventType: {id: 4, value: 'Group'}, minutes: 15})}><ClockIcon /><span>15</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 4, value: 'Group'}, minutes: 30})}><ClockIcon /><span>30</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 4, value: 'Group'}, minutes: 45})}><ClockIcon /><span>45</span></li>  
                                <li onClick={()=>handleClick({eventType: {id: 4, value: 'Group'}, minutes: 60})}><ClockIcon /><span>60</span></li>
                            </ul>
                        </div>
                        <div className={`cstm-crt-evnt-opt mb-zero w-49 ${IS_BASIC ? "upgrade_col" : ""}`}
                         onClick={IS_BASIC ? () => setOpenUpgradePopup(true) : () => ""}>
                            <img className="upgrade-icon" src="/pro-icon-1.svg" width="30" />
                            <p onClick={() => handleClick({eventType: {id: 3, value: 'Custom'}})}>
                                <span className="add-icon mb-10"><AddIcon /></span> 
                                Create Custom Event
                            </p>
                        </div>
                    </div>}
                </div>

                <div className="w-100 d-flex flex-row justify-between">
                    {/* Frequently Events col */}
                    <div className="frequently-events-box d-flex flex-row justify-between">
                        <div className="frequently-events-col">
                            <TabContext value={value}>
                                <TabList onChange={handleChange} >
                                    { hasEventHubAppAccess && <Tab className="simple-tab" label="Frequently Used Events" value="1" />}
                                    <Tab className="simple-tab" label="Frequently Met People" value="2" />
                                </TabList>
                                <TabPanel value="1">
                                    <FrequentlyUsedEvents setUIMode={setUIMode} setEventValue={setEventValue} />
                                </TabPanel>
                                <TabPanel value="2">
                                    <FrequentlyMetPeople setUIMode={setUIMode} setEventValue={setEventValue} />
                                </TabPanel>
                            </TabContext>
                        </div>
                        <div className="upcoming-events-col">
                            <h4 className="text-center">Upcoming Events</h4>
                            <UpcomingEvents />
                        </div>
                    </div>

                    {/* Advance Features col for General User */}
                    {hasEventHubAppAccess && <div className={`adv_ftr_gnrl_usr ${IS_BASIC ? "upgrade_col" : ""}`}
                        onClick={IS_BASIC ? () => setOpenUpgradePopup(true) : () => ""}
                    >
                        <img className="upgrade-icon" src="/pro-icon-1.svg" width="30" />
                        <div className="w-100 d-flex flex-column">
                            <CustomButton
                                label="Advance Events"
                                className="submit-btn mb-20"
                                onClick={() => navigate('/create-event-buffers',{state:{from: location.pathname}})}
                            />
                            <CustomButton
                                label="Group Creation"
                                className="submit-btn mb-20"
                                onClick={() => navigate('/group-creation',{state:{from: location.pathname}})}
                            />
                            <CustomButton
                                label="Invite on email"
                                className="submit-btn mb-20"
                                onClick={()=> handleClick({eventType: {id: 2, value: "One to many"}, minutes: 30, type: 'email'})}
                            />
                        </div>
                    </div>}
                </div>

            </div>
            {openUpgradePopup && <UpgradePopup setOpenUpgradePopup={setOpenUpgradePopup} />}
        </div>
    );
}

export default EventTypeView;