import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../components/CustomButton";
import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import AddIcon from "../styles/icons/AddIcon";
import CopyIcon from "../styles/icons/CopyIcon";
import OptionIcon from "../styles/icons/OptionIcon";
import TextField from '@mui/material/TextField';
import ImportIcon from "../styles/icons/ImportIcon";
import AddContact from "./AddContact";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { ADD_BULK_CONTACT, DELETE_CONTACT, GET_CONTACTS, GET_OPEN_AVAILABILITY_TAG, GET_TAG_LINK_TYPES, SHARE_OPEN_AVAILABILITY_LINK_VIA_EMAIL } from "../constants/Urls";
import Loader from "../components/Loader";
import { queryClient } from "../config/RQconfig";
import showToast from "../utils/toast";
import { Applications, ToastActionTypes } from "../utils/Enums";
import DropdownIcon from "../styles/icons/DropdownIcon";
import PersonIcon from "../styles/icons/PersonIcon";
import PersonSolidIcon from "../styles/icons/PersonSolidIcon";
import CallIcon from "../styles/icons/CallIcon";
import TelephoneIcon from "../styles/icons/TelephoneIcon";
import MailIcon from "../styles/icons/MailIcon";
import { AuthContext } from "../context/auth/AuthContext";
import { Controller, useForm } from "react-hook-form";
import CustomAutocomplete from "../components/CustomAutocomplete";
import { CLIENT_URL } from "../services/axios";
import CustomTextField from "../components/CustomTextField";
import CustomRichTextEditor from "../components/CustomRichTextEditor";

interface FormInputProps {
    from: any;
    to: string;
    subject: string;
    emailBody: string;
    tag: any;
}

const ContactList: React.FC = () => {
    const { state } = useContext(AuthContext);
    const hasSlotBroadcastAppAccess = state?.appAccess?.includes(Applications.SLOT_BROADCAST)
    const navigate = useNavigate();
    const [failedRecords, setFailedRecords] = useState([]);
    const [openFailedContactDialog, setOpenFailedContactDialog] = useState(false);
    const [contacts, setContacts] = useState<any[]>([])
    const [open, setOpen] = useState<boolean>(false)
    const { data, isLoading } = useQuery('contacts', () => request(GET_CONTACTS))
    const { handleSubmit, control, formState: { errors }, reset, setValue} = useForm<FormInputProps>();

    const { data: tagLinkTypes } = useQuery('tag-link-types', () => request(GET_TAG_LINK_TYPES), {
        enabled: hasSlotBroadcastAppAccess
    })
    const TAG_LINK_TYPES = tagLinkTypes?.data || []
    const { data: openAvailabilityTags } = useQuery('openAvailabilityTags', () => request(GET_OPEN_AVAILABILITY_TAG), {
        enabled: hasSlotBroadcastAppAccess
    })

    useEffect(() => {
    if(data?.data) {
        setContacts(data?.data || [])
    }
    },[data])
    const { mutate: mutateDelete, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_CONTACT, "delete", body),{
    onSuccess: (data) => {
        queryClient.invalidateQueries('contacts')
        showToast(ToastActionTypes.SUCCESS, data?.message)
    }
  })
  const { mutate: mutateBulkUser , isLoading: isBulkLoading } = useMutation((body: object) => request(ADD_BULK_CONTACT, "post", body),{
    onSuccess: (data) => {
        if (data?.success){
            showToast(ToastActionTypes.SUCCESS, data?.message)
        }
        if(data?.warning && data?.failedRecords) {
            setFailedRecords(data.failedRecords)
            setOpenFailedContactDialog(true)
        }
        queryClient.invalidateQueries('contacts')
    }
  })

  const { mutate, isLoading: isLoading2 } = useMutation((body: object) => request(SHARE_OPEN_AVAILABILITY_LINK_VIA_EMAIL, "post", body),{
    onSuccess: (data) => {
        reset({})
        showToast(ToastActionTypes.SUCCESS, data.message)
        setOpen(false)
    }
})

const onSubmit = (formdata: FormInputProps) => {
    mutate(formdata)
};

  const handleAddBulkContact = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const fileData = reader.result as string
        const base64Data = fileData?.split(',')[1]
        mutateBulkUser({csvFileBase64Data: base64Data})
        };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      e.target.value = '';
  }

  const handleContactSearch = (e: any) => {
    const value = e.target.value.toLowerCase().trim(); // Convert search term to lowercase
    setContacts(() =>
        value.length > 0
            ? data?.data?.filter((item: any) =>
                item.firstname?.toLowerCase()?.includes(value) ||
                item.email?.toLowerCase()?.includes(value)
            )
            : data?.data as []
    );
};

const exportToCSV = () => {
    const csvContent = convertToCSV(contacts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to convert array of objects to CSV format
  const convertToCSV = (data:any[]) => {
    const newData = data?.map((item) => {
        delete item.id;
        delete item.userId;
        return item
    })
    const header = Object.keys(newData[0]).join(',') + '\n';
    const rows = newData.map(row => Object.values(row).join(',')).join('\n');
    return header + rows;
  };

    return (
        <div className="page-wrapper top_algn-clr-mode">
        {(isLoading || isDeleteLoading || isBulkLoading || isLoading2) && <Loader />}
            <div className="d-flex  mb-20">
                <h1 className="mt-0 mb-zero">
                    <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/settings')} ><BackArrowIcon /></span>
                    Contact List
                </h1>
            </div>
            <div className="w-100 contact-list-wrapper">
                <div className="d-flex justify-between items-center tbl_srch_optns_col mb-20">
                    <div className="w-20">
                        <TextField
                            label=""
                            className="w-100 input-text"
                            placeholder="Search with name or email"
                            onChange={handleContactSearch}
                        />
                    </div>
                    <div className="list-act-optns d-flex items-center">
                        <AddContact button={true} text="Create New" />
                        <div className="optn_itm d-flex items-center mr-20">
                            <Button component="label" className="secondary_btns" >
                            Imports
                            <input type="file" accept=".csv" onChange={handleAddBulkContact} hidden />
                            </Button>
                        </div>
                        <div className="btn_wth_opts">
                            <span className="MuiButton-root secondary_btns"><span className="mr-20">Download</span><DropdownIcon /></span>
                            <ul className="opnts">
                            <li onClick={() => exportToCSV()}>Download All</li>
                            <li>
                              <a href="/CreateBulkContact.csv" download="CreateBulkContact.csv">
                                  Download Sample File
                              </a>
                            </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="w-100 d-flex flex-row list-view-template all-contact-list">
                
                    <div className="w-100 tmplt_lst d-flex flex-row mb-70">
                        {contacts.map((item: any) => {
                            return <div className="w-100 d-flex tmplt_list_item items-center">
                            <div className="tmplt_nme d-flex items-center prsn_nme">
                                {item.firstname && (
                                    <span className="mr-5"><PersonSolidIcon /></span>
                                )}
                                <span className="text">{item.firstname}</span>
                            </div>
                            <div className="tmplt_nme prsn_cmpny">
                                <span className="text">{item.company}</span>
                            </div>
                            <div className="tmplt_nme d-flex items-center prsn_eml">
                                {item.email && (
                                    <span className="mr-5"><MailIcon /></span>
                                )}
                                <span className="text">{item.email}</span>
                            </div>
                            <div className="tmplt_nme d-flex items-center prsn_phn">
                            {item.phone && (
                                <span className="mr-5"><TelephoneIcon /></span>
                            )}
                                <span className="text">{item.phone}</span>
                            </div>
                            
                            <div className="tmplt_act">
                                
                                <div className="tmplt_opt">
                                    <div className="tmplt_opt_icon">
                                        <OptionIcon />
                                        <ul className="opt_item">
                                            <AddContact text="Edit" formData={item} />
                                            <li onClick={() => mutateDelete({id: item.id})}>Delete</li>
                                            {state.appAccess?.includes(Applications.SLOT_BROADCAST) && <li onClick={() => {setOpen(!open); setValue('to', item.email);}}>Share Tag</li> }
                                        </ul>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        })}
                    </div>
                </div>
            </div>
            

            
            <Dialog
                open={openFailedContactDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                <b>These users could not save ({failedRecords.length})</b> 
                {failedRecords.map((item: any, index: number)=>{
                    return (
                    <li key={index}>
                    <div>{JSON.stringify(item.contactData)} - <span style={{color:"red"}}>{item.message}</span></div>
                    </li>
                    )
                })}
                </DialogContent>
                <DialogActions>
                <CustomButton onClick={() => setOpenFailedContactDialog(false)} className="primary_btns" label="ok" />
                </DialogActions>
            </Dialog>

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
            name="tag"
            control={control}
            rules={{ required: "This Field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomAutocomplete
                label="Select Tag"
                className="w-100"
                options={openAvailabilityTags?.data || []}
                sx={{ marginBottom: 2 }}
                getOptionLabel={option => option.tagName}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_,v) => {
                  onChange(v);
                  setValue('emailBody', `${CLIENT_URL}/book-your-appointment/${v.tagName}-${v.eventDuration}mins/${state.userId}/${v.id}/${TAG_LINK_TYPES[0]?.typeId}`)
                  setValue('from', v.defaultEmail)
                }}
                value={value || null}
                error={!!errors?.tag}
                helperText={errors?.tag?.message as string}
              />
            )}
          />    
          </div>
          <div className="w-100">
              <Controller
            name="from"
            control={control}
            rules={{ required: "This Field is required" }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label="From"
                className="w-100"
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                value={value || ''}
                disabled
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
                <CustomTextField
                label="To"
                className="w-100"
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                value={value || ''}
                disabled
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
        </div>
    )
}
export default ContactList;
