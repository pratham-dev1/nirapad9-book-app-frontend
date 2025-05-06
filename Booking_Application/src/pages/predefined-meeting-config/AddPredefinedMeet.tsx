import React, { FC, useEffect, useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../../components/CustomAutocomplete';
import CustomTextField from '../../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useNavigate } from "react-router-dom";
import request from '../../services/http';
import { CREATE_PREDEFINED_MEET, EDIT_PREDEFINED_MEET, GET_PREDEFINED_MEETS_LOCATIONS, GET_PREDEFINED_MEETS_TYPES} from '../../constants/Urls';
import { ToastActionTypes } from '../../utils/Enums';
import showToast from '../../utils/toast';
import Loader from '../../components/Loader';
import { queryClient } from '../../config/RQconfig';
import BackArrowIcon from '../../styles/icons/BackArrowIcon';

type FormInputProps = {
    title: string;
    type: {id: number, value: string};
    location: {id: number, value: string};
    url: string;
    address: string;
    phone: string;
    passcode: string;
}

const AddPredefinedMeet: FC = () => {
    const {data: meetLocations} = useQuery('predefined-meet-locations', () => request(GET_PREDEFINED_MEETS_LOCATIONS))
    const {data: meetTypes} = useQuery('predefined-meet-types', () => request(GET_PREDEFINED_MEETS_TYPES))
    const navigate = useNavigate();
    const location = useLocation()
    const formData = location?.state?.data;
    const view = location?.state?.view || false;
    const { handleSubmit, control, formState: { errors }, reset, watch } = useForm<FormInputProps>();
    const { mutate: mutate, isLoading } = useMutation((body: object) => request(formData ? EDIT_PREDEFINED_MEET : CREATE_PREDEFINED_MEET, "post", formData ? {...body, id: formData.id} : body), {
        onSuccess: (data) => {
          showToast(ToastActionTypes.SUCCESS, data?.message)
            queryClient.invalidateQueries('predefined-meet')
            navigate('/predefined-meeting-list')
        },
    })
    useEffect(() => {
        formData && reset({
            ...formData,
            type: meetTypes?.data?.filter((item: any) => item.id === formData.type)[0],
            location: meetLocations?.data?.filter((item: any) => item.id === formData.location)[0]
        })
    },[formData, meetTypes, meetLocations])
    const onSubmit = (formData: FormInputProps) => {
        mutate({...formData, location: formData.location?.id, type: formData.type?.id})
    }

    return (
        <>
        {isLoading && <Loader />}
            <div className='page-wrapper'>
                <div className='d-flex justify-between items-center mb-20'>
                    <h1>
                        <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)} ><BackArrowIcon /></span>
                        {view ? '' : formData ? 'Edit' : 'Add New'} Predefined Meet
                    </h1>
                </div>
                <div className='card-box'>
                    <form onSubmit={handleSubmit(onSubmit)} className='group_crtn_frm'>
                        <div className='d-flex flex-column w-100 mw-700 mb-30'>
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="title"
                                    control={control}
                                    rules={{required: "This field is required"}}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomTextField
                                        label="Meeting Title"
                                        className='w-100'
                                        onChange={onChange}
                                        value={value || ""}
                                        inputProps={{ maxLength: 40}}
                                        error={!!errors.title}
                                        helperText={errors.title?.message}
                                        disabled={view}
                                    />
                                )}
                                />
                            </div>
                            
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="type"
                                    rules={{ required: "This field is required" }}
                                    control={control}
                                    render={({ field: { onChange,value} }) => (
                                        <CustomAutocomplete
                                        options={meetTypes?.data || []}
                                        onChange={(e,v) => onChange(v)}
                                        getOptionLabel={option => option.value}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        value = {value || null}
                                        label="Type"
                                        error={!!errors.type}
                                        helperText={errors.type?.message}
                                        disabled={view}
                                        />
                                    )}
                                />
                            </div>
                            {watch('type')?.id === 3 &&
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="location"
                                    rules={{ required: "This field is required" }}
                                    control={control}
                                    render={({ field: { onChange,value} }) => (
                                        <CustomAutocomplete
                                        options={meetLocations?.data || []}
                                        getOptionLabel={option => option.value}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        value = {value || null}
                                        onChange={(e,v) => onChange(v)}
                                        label="Location"
                                        error={!!errors.location}
                                        helperText={errors.location?.message}
                                        disabled={view}
                                        />
                                    )}
                                />
                            </div>
                            }
                            {watch('type')?.id === 1 &&
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="url"
                                    control={control}
                                    rules={{required: "This field is required"}}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomTextField
                                        label="Url"
                                        className='w-100'
                                        onChange={onChange}
                                        value={value || ""}
                                        inputProps={{ maxLength: 255 }}
                                        error={!!errors.url}
                                        helperText={errors.url?.message}
                                        disabled={view}
                                    />
                                )}
                                />
                            </div>
                            }
                            {(watch('type')?.id !== 1 && watch('type')?.id !== 2) &&
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="address"
                                    control={control}
                                    rules={{required: "This field is required"}}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomTextField
                                        label="Address"
                                        className='w-100'
                                        onChange={onChange}
                                        value={value || ""}
                                        inputProps={{ maxLength: 255 }}
                                        error={!!errors.address}
                                        helperText={errors.address?.message}
                                        disabled={view}
                                    />
                                )}
                                />
                            </div>
                            }
                            {watch('type')?.id !== 1 &&
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        required: "This field is required",
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Phone number must be exactly 10 digits",
                                        },
                                        }}
                                    // rules={{required: "This field is required"}}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomTextField
                                        label="Phone Number"
                                        className='w-100'
                                        // onChange={onChange}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '');
                                            onChange(numericValue);
                                        }}
                                        value={value || ""}
                                        inputProps={{ maxLength: 10}}
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message}
                                        disabled={view}
                                    />
                                )}
                                />
                            </div>
                            }
                            {(watch('type')?.id === 1 || watch('type')?.id === 2) &&
                            <div className='w-100 mb-30'>
                                <Controller
                                    name="passcode"
                                    control={control}
                                    rules={{required: "This field is required"}}
                                    render={({ field: { onChange, value } }) => (
                                    <CustomTextField
                                        label="Passcode"
                                        className='w-100'
                                        onChange={onChange}
                                        value={value || ""}
                                        inputProps={{ maxLength: 30 }}
                                        error={!!errors.passcode}
                                        helperText={errors.passcode?.message}
                                        disabled={view}
                                    />
                                )}
                                />
                            </div>
                            }
                            
                        </div>
                        
                        {!view && <div className='d-flex justify-center'>
                            <CustomButton type="submit" className='primary_btns' label="Save" />
                        </div>}
                    </form>

                </div>
            </div>
        </>
    )
}

export default AddPredefinedMeet;