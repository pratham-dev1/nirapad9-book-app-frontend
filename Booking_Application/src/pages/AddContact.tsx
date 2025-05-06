import { Dialog, DialogContent } from '@mui/material'
import React, { FC, ReactNode, useEffect } from 'react'
import CustomButton from '../components/CustomButton';
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from 'react-hook-form';
import CustomTextField from '../components/CustomTextField';
import AddIcon from "../styles/icons/AddIcon";
import { useMutation } from 'react-query';
import { ADD_CONTACT, EDIT_CONTACT } from '../constants/Urls';
import { queryClient } from '../config/RQconfig';
import showToast from '../utils/toast';
import { ToastActionTypes } from '../utils/Enums';
import Loader from '../components/Loader';
import request from '../services/http';

type FormInputProps = {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    title: string;
    company: string
}

const AddContact: FC<{button?: boolean, formData?: any, text: string}> = ({button, formData, text}) => {
    const [open, setOpen] = React.useState(false);
    const {
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm<FormInputProps>();

    useEffect (() =>{
        formData && reset(formData)
    },[formData])

    const { mutate, isLoading } = useMutation((body: object) => request(formData ? EDIT_CONTACT : ADD_CONTACT, "post", formData ? {...body, id: formData.id} : body),{
        onSuccess: (data) => {
            queryClient.invalidateQueries('contacts')
            showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
        }
      })

    const onSubmit = (formdata: FormInputProps) => {
        setOpen(false)
        mutate(formdata)
    }
    return (
        <>
            {isLoading && <Loader />}
            {button ? 
            <div className="optn_itm d-flex items-center add_new MuiButton-root secondary_btns mr-20" onClick={() => setOpen(true)}>
                <span className='linear-icon'><AddIcon /></span>
                <span className="ml-10">{text}</span>
            </div>
            : <li onClick={() => setOpen(true)}>{text}</li>}
            <Dialog
                open={open}
            >
                <div className="popup-header">
                    <h2>{formData ? 'Edit' : 'Create New' } Contact</h2>
                    <CloseIcon onClick={() => {setOpen(false); reset();}} />
                </div>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="pad-20 pb-0 pt-0">
                        <div className="w-100 d-flex justify-between">
                            <div className="w-48 mb-20">
                                <Controller
                                    name="firstname"
                                    control={control}
                                    rules={{ 
                                        required: "This field is required",
                                        validate: (value) => value.trim() !== "" || "This field is required", 
                                      }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="First Name"
                                            className="w-100"
                                            onChange={onChange}
                                            value={value || ''}
                                            inputProps={{ maxLength: 40 }}
                                            error={!!errors?.firstname}
                                            helperText={errors?.firstname?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-48 mb-20">
                                <Controller
                                    name="lastname"
                                    control={control}
                                    rules={{ 
                                        required: "This field is required",
                                        validate: (value) => value.trim() !== "" || "This field is required", 
                                      }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="Last Name"
                                            className="w-100"
                                            onChange={onChange}
                                            value={value || ''}
                                            inputProps={{ maxLength: 40 }}
                                            error={!!errors?.lastname}
                                            helperText={errors?.lastname?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="w-100 d-flex justify-between">
                            <div className="w-48 mb-20">
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
                                            className="w-100"
                                            onChange={onChange}
                                            value={value || ''}
                                            inputProps={{ maxLength: 100 }}
                                            error={!!errors?.email}
                                            helperText={errors?.email?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-48 mb-20">
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        required: false,
                                        pattern: {
                                          value: /^[0-9]{10}$/,
                                          message: "Phone number must be exactly 10 digits",
                                        },
                                      }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="Phone Number"
                                            className="w-100"
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, '');
                                                onChange(numericValue);
                                            }}
                                            value={value || ''}
                                            inputProps={{ maxLength: 10}}
                                            error={!!errors?.phone}
                                            helperText={errors?.phone?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="w-100 d-flex justify-between mb-30">
                            <div className="w-48 mb-20">
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="Title"
                                            className="w-100"
                                            onChange={onChange}
                                            value={value || ''}
                                            inputProps={{ maxLength: 60 }}
                                        />
                                    )}
                                />
                            </div>
                            <div className="w-48 mb-20">
                                <Controller
                                    name="company"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomTextField
                                            label="Company"
                                            className="w-100"
                                            onChange={onChange}
                                            value={value || ''}
                                            inputProps={{ maxLength: 100 }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="w-100 d-flex justify-center">
                            <CustomButton label="Cancel" className="secondary_btns mr-25" onClick={() => {setOpen(false); reset();}} />
                            <CustomButton label="Save" className="primary_btns mr-0" type="submit" />
                        </div>
                    </form>
                </DialogContent>

            </Dialog>
        </>
    )
}

export default AddContact