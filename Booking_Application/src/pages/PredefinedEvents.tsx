import React, { FC, useContext, useState } from 'react'
import ClockIcon from '../styles/icons/ClockIcon';
import CalendarIcon from '../styles/icons/CalendarIcon';
import CopyIcon from '../styles/icons/CopyIcon';
import SettingIcon from '../styles/icons/SettingIcon';
import { useMutation, useQuery } from 'react-query';
import { DELETE_EVENT_TEMPLATE, GET_EVENT_TEMPLATES } from '../constants/Urls';
import request from '../services/http';
import AddIcon from '../styles/icons/AddIcon';
import { useLocation, useNavigate } from "react-router-dom";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import OptionIcon from '../styles/icons/OptionIcon';
import { Applications, ToastActionTypes } from '../utils/Enums';
import showToast from '../utils/toast';
import { queryClient } from '../config/RQconfig';
import Loader from '../components/Loader';
import PredefinedTags from './PredefinedTags';
import { Dialog, DialogContent } from '@mui/material';
import CustomButton from '../components/CustomButton';
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from '../context/auth/AuthContext';
import { EventsContext } from '../context/event/EventsContext';

type CompProps = {
    setUIMode: any;
    setEventValue: any;
}

const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
const PredefinedEvents: FC<CompProps> = ({setUIMode, setEventValue}) => {
    const navigate = useNavigate();
    const location = useLocation()
    const {state} = useContext(AuthContext)
    const {emailData} = useContext(EventsContext)
    const isEmailSynced = emailData?.filter(i => i.emailServiceProvider)?.length >= 1
    const hasSlotBroadcastAppAccess = state.appAccess?.includes(Applications.SLOT_BROADCAST)
    const hasEventHubAppAccess = state.appAccess?.includes(Applications.EVENT_HUB)
    const [value, setValue] = React.useState( hasEventHubAppAccess ? '1' : hasSlotBroadcastAppAccess ? '2' : '1');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
    const [deleteId,setDeleteId] = useState<any>();

    const { mutate: deleteTemplate, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_EVENT_TEMPLATE, "delete", body),
    {
      onSuccess: () => {
        setOpenDeleteDialog(false)
        showToast(ToastActionTypes.SUCCESS, data?.message)
        queryClient.invalidateQueries('predefined-event-templates')
      },
    })
    const {data, isLoading} = useQuery(['predefined-event-templates'],() => request(GET_EVENT_TEMPLATES, "get"), {
        enabled: hasEventHubAppAccess
    })
    const handleClick = (item: any) => {
        setUIMode(3)
        setEventValue({
            ...item, 
            minutes: item.eventTime, 
            eventType: EVENT_TYPES.filter((i) => i.id === item.eventTypeId)[0],
            type: "predefined_event",
            predefinedEventId: item.id
        })
    }
    const onConfirmDelete = () => {
        deleteTemplate(deleteId)
      }


  return (
        <div className="predefind-events-col simple-table w-60">
            {(isDeleteLoading || isLoading) && <Loader />}
            <TabContext value={value}>
                <TabList onChange={handleChange} >
                    {hasEventHubAppAccess && <Tab className="simple-tab" label="Predefined Event" value="1" /> }
                    {hasSlotBroadcastAppAccess && <Tab className="simple-tab" label="Predefined Tags" value="2" /> }
                    <span className='add_icon' onClick={() => {
                        value === '1' ? navigate('/event-templates',{state:{from: location.pathname}})
                        : isEmailSynced ? navigate('/add-new-tag',{state:{from: location.pathname}}) : showToast(ToastActionTypes.ERROR, 'Sync your calendar to get started')
                        }}>
                        <AddIcon />
                    </span>
                </TabList>

                {/* Predefined Events Templates Table */}
                <TabPanel value="1" className='prdfnd_evnt_tbl_data'>
                    <div className="col-head d-flex">
                        <span className="w-30 text-center evnt_nme">Event Template</span>
                        <span className="w-15 text-center evnt_tme"><ClockIcon /></span>
                        <span className="w-15 text-center evnt_typ">
                            <img src="/person-group-icon.svg" />
                        </span>
                        <span className="w-32 text-center evnt_tg"><CalendarIcon /></span>
                        <span className="w-8 text-center"><SettingIcon /></span>
                    </div>
                    {data?.data.length === 0 ? (
                        <div className="no-tbl_data_msg">
                            <span>Currently, There's no any Predefined Template. Please create an new template.</span>
                            <span className='trgt_link mt-20' onClick={() => navigate('/add-event-templates')} > Create New Template</span>
                        </div>
                    ) : (
                    data?.data.map((item: any) => (
                        <div className="col-body d-flex items-center" key={item.id}>
                            <span className="w-30 text-center evnt_nme cursur-pointer" onClick={()=> handleClick(item)}>{item.title}</span>
                            <span className="w-15 text-center evnt_tme cursur-pointer" onClick={()=> handleClick(item)}>{item.eventTime + ' Min'}</span>
                            <span className="w-15 text-center evnt_typ cursur-pointer" onClick={()=> handleClick(item)}>{EVENT_TYPES.filter((element) => element.id === item.eventTypeId)[0]?.value}</span>
                            <span className="w-32 text-center evnt_tg cursur-pointer" onClick={()=> handleClick(item)}>{item.senderEmail}</span>
                            <span className="w-8 text-center">
                                <span className='tbl_opt_act'>
                                    <OptionIcon />
                                    <ul className="tbl_act_drp">
                                        <li onClick={() => navigate('/add-event-templates', {state:{data: item}})}>Edit</li>
                                        {/* <li onClick={() =>  deleteTemplate({eventTemplateId: [item.id]})}>Delete</li> */}
                                        <li onClick={() => { 
                                            setOpenDeleteDialog(true); 
                                            setDeleteId({ eventTemplateId: [item.id] });
                                        }}>
                                            Delete
                                        </li>

                                    
                                    </ul>
                                </span>
                            </span>
                        </div>
                    )))}
                </TabPanel>

                {/* Predefined Tags Table */}
                <TabPanel value="2" className='prdfnd_tag_tbl_data'>
                    <PredefinedTags />
                </TabPanel>

            </TabContext>
            <Dialog
                open={openDeleteDialog}
                // onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {(isDeleteLoading) && <Loader />}
                <div className='popup-header'>
                    <h2>Confirmation</h2>
                    <CloseIcon onClick={() => setOpenDeleteDialog(false)} />
                </div>
                <DialogContent>
                    <h2 className='text-center mb-50'>Are you sure want to delete this?</h2>
                    <div className='d-flex justify-center'>
                        <CustomButton label="Delete" className="primary_btns mr-25" onClick={onConfirmDelete}/>
                        <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>
            
        </div>
  )
}

export default PredefinedEvents;
