import React, { useContext, useState  } from 'react'
import ClockIcon from '../styles/icons/ClockIcon'
import CalendarIcon from '../styles/icons/CalendarIcon'
import CopyIcon from '../styles/icons/CopyIcon'
import SettingIcon from '../styles/icons/SettingIcon'
import { useMutation, useQuery } from 'react-query'
import request from '../services/http'
import { DELETE_OPEN_AVAILABILITY_TAG, GET_OPEN_AVAILABILITY_TAG, GET_TAG_LINK_TYPES, SHARE_OPEN_AVAILABILITY_LINK_VIA_EMAIL } from '../constants/Urls'
import OptionIcon from '../styles/icons/OptionIcon'
import { ToastActionTypes } from '../utils/Enums'
import showToast from '../utils/toast'
import { queryClient } from '../config/RQconfig'
import { useEventTypes } from '../hooks/useEventTypes'
import { CLIENT_URL } from '../services/axios'
import { AuthContext } from '../context/auth/AuthContext'
import QrCode2SharpIcon from '@mui/icons-material/QrCode2Sharp';
import ShareSharpIcon from '@mui/icons-material/ShareSharp';
import { Dialog, DialogContent, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from '../components/CustomButton';
import CustomTextField from '../components/CustomTextField';
import TextField from '@mui/material/TextField';
import CustomRichTextEditor from "../components/CustomRichTextEditor";
import { useLocation, useNavigate } from 'react-router-dom'
import CopyIcon2 from '@mui/icons-material/ContentCopy';
import Loader from '../components/Loader'
import { Controller, useForm } from 'react-hook-form'
import CustomAutocomplete from '../components/CustomAutocomplete'
import { EventsContext } from '../context/event/EventsContext'
import QRCode from '../components/QrCode'

type FormState   = {
    sender: string;
    receiver: string;
    subject: string;
    message: string;
}

interface FormInputProps {
    from: any;
    to: string[];
    subject: string;
    emailBody: string;
}

const PredefinedTags: React.FC = () => {
    const {data: eventTypes} = useEventTypes()
    const [open, setOpen] = React.useState(false);
    const {state} = useContext(AuthContext)
    const { emailData } = useContext(EventsContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { data } = useQuery('openAvailabilityTags', () => request(GET_OPEN_AVAILABILITY_TAG))
    const { data: tagLinkTypes } = useQuery('tag-link-types', () => request(GET_TAG_LINK_TYPES))
    const TAG_LINK_TYPES = tagLinkTypes?.data || []
    const { handleSubmit, control, formState: { errors }, reset, setValue} = useForm<FormInputProps>();

    const { mutate, isLoading } = useMutation((body: object) => request(SHARE_OPEN_AVAILABILITY_LINK_VIA_EMAIL, "post", body),{
        onSuccess: (data) => {
            showToast(ToastActionTypes.SUCCESS, data.message)
            setOpen(false)
        }
    })
    
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onSubmit = (formdata: FormInputProps) => {
        console.log(formdata);
        mutate({...formdata, from: formdata.from?.defaultEmail})
        // Handle form submission logic here
    };
    const handleNavigation = (item: any) => {
        navigate('/edit-tag', { state: { formdata: item, from: location.pathname } });
      };

    return (
        <>
        {isLoading && <Loader />}
            <div className="col-head d-flex">
                <span className="w-30 text-center evnt_nme">Tag Name</span>
                <span className="w-15 text-center evnt_tme"><ClockIcon /></span>
                <span className="w-15 text-center evnt_typ">
                    <img src="/person-group-icon.svg" />
                </span>
                <span className="w-20 text-center evnt_tg"><CalendarIcon /></span>
                <span className="w-8 text-center"><QrCode2SharpIcon /></span>
                <span className="w-8 text-center"><SettingIcon /></span>
            </div>
            {data?.data.filter((item: any) => !item.isDeleted).length === 0 ? (
                <div className="no-tbl_data_msg">
                    <span>Currently, There's no any Predefined Tags.</span>
                </div>
            ) : (
                data?.data.filter((item: any) => !item.isDeleted).map((item: any) => (
                    <div className="col-body d-flex items-center" key={item.id} >
                      
                        <span className="w-30 text-center evnt_nme cursur-pointer" onClick={() => handleNavigation(item)}>{item.tagName}</span>
                        <span className="w-15 text-center evnt_tme cursur-pointer" onClick={() => handleNavigation(item)}>{item.eventDuration + ' Min'}</span>
                        <span className="w-15 text-center evnt_typ cursur-pointer" onClick={() => handleNavigation(item)}>{eventTypes?.data.filter((i:any) => i.id === item.eventTypeId)[0]?.value }</span>
                        <span className="w-20 text-center evnt_tg cursur-pointer" onClick={() => handleNavigation(item)}>{item.defaultEmail}</span>
                        <span className="w-8 text-center cursur-pointer"><QRCode link={`${CLIENT_URL}/book-your-appointment/${item.tagName}-${item.eventDuration}mins/${state.userId}/${item.id}/${TAG_LINK_TYPES[0]?.typeId}`} /></span>
                        <span className="w-8 text-center">
                            <span className='tbl_opt_act'>
                                <ShareSharpIcon />
                                <ul className="tbl_act_drp">
                                    <li onClick={handleClickOpen}>Email</li>
                                    <li>Social Media</li>
                                    <li 
                                    onClick={() => {
                                        showToast(ToastActionTypes.INFO, 'Link Copied', {autoClose: 1000})
                                        navigator.clipboard.writeText(`${CLIENT_URL}/book-your-appointment/${item.tagName}-${item.eventDuration}mins/${state.userId}/${item.id}/${TAG_LINK_TYPES[0]?.typeId}`)
                                    }}>Copy General</li>
                                    <li 
                                    onClick={() => {
                                        showToast(ToastActionTypes.INFO, 'Link Copied', {autoClose: 1000})
                                        navigator.clipboard.writeText(`${CLIENT_URL}/book-your-appointment/${item.tagName}-${item.eventDuration}mins/${state.userId}/${item.id}/${TAG_LINK_TYPES[1]?.typeId}`)
                                    }}>Copy Linkedin</li>
                                    <li 
                                    onClick={() => {
                                        showToast(ToastActionTypes.INFO, 'Link Copied', {autoClose: 1000})
                                        navigator.clipboard.writeText(`${CLIENT_URL}/book-your-appointment/${item.tagName}-${item.eventDuration}mins/${state.userId}/${item.id}/${TAG_LINK_TYPES[2]?.typeId}`)
                                    }}>Copy Facebook</li>
                                    <li 
                                    onClick={() => {
                                        showToast(ToastActionTypes.INFO, 'Link Copied', {autoClose: 1000})
                                        navigator.clipboard.writeText(`${CLIENT_URL}/book-your-appointment/${item.tagName}-${item.eventDuration}mins/${state.userId}/${item.id}/${TAG_LINK_TYPES[3]?.typeId}`)
                                    }}>Copy Instagram</li>
                                </ul>
                            </span>
                        </span>
                    </div>
                )))}

            <Dialog
                open={open}
                // onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className="popup-header">
                    <h2>Sharing Tag</h2>
                    <CloseIcon onClick={() => {setOpen(false); reset();}} />
                </div>
                {/* {(isDeleteLoading) && <Loader />} */}
                <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-100 mw-700">
              <div className="w-100 mb-20">
              <Controller
            name="from"
            control={control}
            rules={{ required: "This Field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                label="From"
                className="w-100"
                options={data?.data || []}
                sx={{ marginBottom: 2 }}
                getOptionLabel={option => option.defaultEmail}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_,v) => {
                  onChange(v);
                  setValue('emailBody', `${CLIENT_URL}/book-your-appointment/${v.tagName}-${v.eventDuration}mins/${state.userId}/${v.id}/${TAG_LINK_TYPES[0]?.typeId}`)
                }}
                value={value || null}
                error={!!errors?.from}
                helperText={errors?.from?.message as string}
              />
            )}
          />    
          </div>
          <div className="w-100 mb-20">
            <Controller
            name="to"
            control={control}
            rules={{ required: "This Field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                label="To"
                options={[]}
                className="w-100"
                sx={{ marginBottom: 2 }}
                onChange={(e, v) => onChange(v)}
                value={value || []}
                multiple
                freeSolo
                error={!!errors?.to}
                helperText={errors?.to?.message}
              />
            )}
          />
          </div>
              <div className="w-100 mb-50">
              <Controller
            name="subject"
            control={control}
            rules={{ required: "This Field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label="Subject"
                className="w-100"
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                value={value || ''}
                error={!!errors?.subject}
                helperText={errors?.subject?.message}
              />
            )}
            />
              </div>
              <div className="w-100 mb-90">
              <Controller
            name="emailBody"
            control={control}
            rules={{ required: "This Field is required" }}
            render={({ field: { onChange, value } }) => (
                <CustomRichTextEditor
                    value={value}
                    onChange={onChange}
                />
            )}
            />
              </div>
            {errors.emailBody && <small style={{color:'red', fontSize:14}}>This is required Field</small>}

            </div>
          <div className="d-flex justify-center">
            <CustomButton label="Send" className="primary_btns mr-25" type='submit' />
            <CustomButton label="Cancel" className="secondary_btns" onClick={() => {setOpen(false); reset();}} />
          </div>
          </form>
        </DialogContent>
            </Dialog>
        </>
    )
}

export default PredefinedTags