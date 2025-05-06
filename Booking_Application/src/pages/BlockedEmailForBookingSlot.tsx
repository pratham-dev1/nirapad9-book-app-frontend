import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { Dialog, DialogContent } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { DELETE_BLOCKED_EMAIL_FOR_SLOT, GET_BLOCKED_EMAILS_FOR_SLOTS, GET_OPEN_AVAILABILITY_TAG, SAVE_BLOCK_EMAIL_FOR_BOOKING_SLOT } from "../constants/Urls";
import { queryClient } from "../config/RQconfig";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";
import CustomTextField from "../components/CustomTextField";
import CustomAutocomplete from "../components/CustomAutocomplete";
import AddIcon from "../styles/icons/AddIcon";
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from "@mui/icons-material/Close";
import { DeleteOutline } from "@mui/icons-material";

interface FormInputProps {
    email: string;
    tag: any;
}

const BlockedEmailForBookingSlot = () => {
    const navigate = useNavigate();
    const [view, setView] = useState(0)
    const [openDialog, setOpenDialog] = useState(false)
    const [deleteItem, setDeleteItem] = useState({})
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormInputProps>();
    const { data: openAvailabilityTag } = useQuery('tag-list', () => request(GET_OPEN_AVAILABILITY_TAG));
    const { data: blockedEmails } = useQuery('blocked-emails-for-slots', () => request(GET_BLOCKED_EMAILS_FOR_SLOTS));
    
    const { mutate, isLoading } = useMutation((body: object) => request(SAVE_BLOCK_EMAIL_FOR_BOOKING_SLOT, "post", body),{
        onSuccess: (data) => {
            showToast(ToastActionTypes.SUCCESS, data?.message)
            queryClient.invalidateQueries('blocked-emails-for-slots')
        }
    });

    const { mutate: deleteBlockedEmail, isLoading: isLoading2 } = useMutation((body: object) => request(DELETE_BLOCKED_EMAIL_FOR_SLOT, "delete", body),{
        onSuccess: (data) => {
            showToast(ToastActionTypes.SUCCESS, data?.message)
            queryClient.invalidateQueries('blocked-emails-for-slots')
            setOpenDialog(false);
        }
    });
    const onSubmit = (formdata: FormInputProps) => {
        mutate({email: formdata.email, tagId: formdata.tag?.id})
    };

    const onConfirmDelete = () => {
        deleteBlockedEmail(deleteItem)
    }

    return (
        <>
            {isLoading && <Loader />}
            <div className="page-wrapper top_algn-clr-mode">
                <div className="d-flex justify-between items-center mb-20">
                    <h1 className="mb-zero">
                        <span
                            className="back-to mr-10 cursur-pointer"
                            onClick={() => navigate(-1)}
                        >
                            <BackArrowIcon />
                        </span>
                        Block Email
                    </h1>
                </div>
                <div className='add_group_frm_wpr'>
                <div className='w-100 d-flex'>
                    <div className="view-toggle">
                        <span 
                            className={view === 0 ? 'active-frm-grp' : ''} 
                            onClick={() => setView(0)}
                        >
                        <span className='icon_circle'><AddIcon /></span> Block New Email
                        </span>
                        <span 
                            className={view === 1 ? 'active-frm-grp' : ''} 
                            onClick={() => setView(1)}
                        >
                        <span className='icon_circle'><ViewIcon /></span> View History
                        </span>
                    </div>
                </div>
                {view === 0 ?
                <div className="card-box">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="w-100 mw-700">
                            <div className="w-100 mb-10">
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "This field is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                            message: "Invalid email address",
                                        },
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="Email"
                                            className='w-100'
                                            onChange={onChange}
                                            value={value || ""}
                                            error={!!errors.email}
                                            helperText={errors?.email?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-100 mb-10">
                                <Controller
                                    name="tag"
                                    control={control}
                                    rules={{ required: "This field is required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomAutocomplete
                                            label="TagId"
                                            className="w-100"
                                            options={openAvailabilityTag?.data?.filter((option: any) => option.isDeleted === null) || []}
                                            getOptionLabel={(option) => option?.tagName}
                                            disableClearable={true}
                                            onChange={(e,v) => onChange(v)}
                                            error={!!errors.tag}
                                            value={value || null}
                                            helperText={errors?.tag?.message as string}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-100 mt-50 d-flex justify-center">
                                <CustomButton label="Cancel" className="secondary_btns mr-25" onClick={() => navigate(-1)} />
                                <CustomButton type="submit" label="Save" className="primary_btns mr-0" />
                            </div>
                        </div>
                    </form>
                </div>
                : 
                <div className="w-100 d-flex flex-row list-view-template all-qus-list">
                <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
                <div className="w-100 d-flex tmplt_list_item items-center">
                <div className="tmplt_nme"><span>S No.</span></div>
                <div className="tmplt_nme"><span>Email</span></div>
                <div className="tmplt_nme"><span>TagName</span></div>
                <div className="tmplt_nme"><span>Action</span></div> 
                </div>
                  {blockedEmails?.data?.map((item: any, index: number) => {
                    return <div className="w-100 d-flex tmplt_list_item items-center" key={index}>
                      <div className="tmplt_nme">
                        <span>{index+1}</span>
                      </div>
                      <div className="tmplt_nme">
                        <span>{item?.email}</span>
                      </div>
                      <div className="tmplt_nme">
                        <span>{item?.tagDetails?.tagName}</span>
                      </div>
                      <div className="tmplt_nme">
                        <DeleteOutline onClick={() => {
                            setOpenDialog(true);
                            setDeleteItem({email: item.email, tagId: item.tagId })
                            }} />
                      </div>
                    </div>
                  })}
                </div>
                <Dialog
                open={openDialog}
                // onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {(isLoading2) && <Loader />}
                <div className='popup-header'>
                    <h2>Confirmation</h2>
                    <CloseIcon onClick={() => setOpenDialog(false)} />
                </div>
                <DialogContent>
                    <h2 className='text-center mb-50'>Are you sure want to delete this?</h2>
                    <div className='d-flex justify-center'>
                        <CustomButton label="Delete" className="primary_btns mr-25" onClick={onConfirmDelete}/>
                        <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>
              </div>
                }
                </div>
            </div>
        </>
    );
};
export default BlockedEmailForBookingSlot;
