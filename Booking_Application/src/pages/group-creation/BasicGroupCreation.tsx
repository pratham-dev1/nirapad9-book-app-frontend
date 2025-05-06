import React, { FC, useContext, useEffect, useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../../components/CustomAutocomplete';
import CustomTextField from '../../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import CreateGroup from '../CreateGroup';
import request from '../../services/http';
import { CREATE_GROUP, EDIT_GROUP, GET_ALL_USER_LIST, GET_GROUP_LIST_WITH_MEMBERS } from '../../constants/Urls';
import { ToastActionTypes } from '../../utils/Enums';
import showToast from '../../utils/toast';
import Loader from '../../components/Loader';
import { queryClient } from '../../config/RQconfig';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomCheckBox from '../../components/CustomCheckbox';


import { Dialog, DialogActions, DialogContent, Drawer, Button, Checkbox } from "@mui/material";
import { GET_CONTACTS} from "../../constants/Urls";
import ContactBookIcon from "../../styles/icons/ContactBookIcon";
import DropdownOutlinedIcon from "../../styles/icons/DropdownOutlinedIcon";
import AddContact from "../AddContact";
import TextField from '@mui/material/TextField';
import AddIcon from "../../styles/icons/AddIcon";
import Contacts from '../Contacts';
import { EventsContext } from '../../context/event/EventsContext';

type FormInputProps = {
    name: string;
    members: any[];
    addMe: boolean;
    description: string;
    adminName: any;
}

const BasicGroupCreation: FC = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const {emailData} = useContext(EventsContext)
    const formData = location.state.data;
    const [groupMembers, setGroupMembers] = useState<any[]>([])
    const [outsideMembers, setOutsideMembers] = useState<any>([])
    const [removedItem, setRemovedItem] = useState<any>()
    const {data, isLoading: isUserLoading} = useQuery(['all-user-list'],() => request(GET_ALL_USER_LIST, "get"))
    const { handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<FormInputProps>();
    const { mutate: mutateGroup, isLoading } = useMutation((body: object) => request(formData ? EDIT_GROUP : CREATE_GROUP, "post", formData ? {...body, id: formData.id} : body), {
        onSuccess: (data) => {
          showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
            queryClient.invalidateQueries('group-list')
            navigate('/group-creation',{state: {view: location.state?.view, from: location.state?.from}})
        },
    })
    useEffect(() => {
        if (formData && emailData) {
            reset({ ...formData})
            if (formData?.addMe) setGroupMembers(() => [{email: emailData[0]?.email, isYou: true}, ...formData?.groupMembers])
            else setGroupMembers(formData?.groupMembers || [])
    }
    },[formData, emailData])
    const onSubmit = (formData: FormInputProps) => {
        if(groupMembers.length < 1){
            showToast(ToastActionTypes.ERROR, 'At least one member is required')
        }else{
            mutateGroup({...formData, members: groupMembers.filter(i => !i.isYou), adminName: formData.adminName})
        }
    }
    
    const handleRemove = (item: any) => {
        let filterValues =  groupMembers.filter((el: any) => el.email !== item.email)
        setGroupMembers(filterValues)
        setRemovedItem(item)
    }

    const checkDuplicates = (value: any[]) => {
        const isExist = groupMembers.map(i => i.email).includes(value[0]) 
        if(isExist) {
            showToast(ToastActionTypes.ERROR, 'Already added in the list')
            return true;
        }
    }
    const handleSelectOrRemoveContact = (item: any, setContacts: React.Dispatch<React.SetStateAction<any[]>>) => {
        if(!item.selected) {
            if(checkDuplicates([item.email])) return; 
            setGroupMembers(prev => [...prev, item])
        }
        else {
            setGroupMembers(prev => prev.filter((el: any) => el.email !== item.email))
        }

        setContacts(prev => prev?.map(el => el.id === item.id ? {...el, selected: !item.selected} : el))
    }

    return (
        <>
            {isLoading && <Loader /> }
            <div className='d-flex flex-row justify-between w-70 group_crtn_frm'>
                <form onSubmit={handleSubmit(onSubmit)} className='w-85'>
                    <div className='d-flex flex-row justify-between mb-30 w-100 mt-50'>
                        <div className='w-48 mb-20'>
                            <Controller
                                name="name"
                                control={control}
                                rules={{required: "This field is required"}}
                                render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                label={`Group name (Text ${watch('name')?.length || 0}/30 Characters)`}
                                className='w-100'
                                onChange={onChange}
                                value={value || ""}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                inputProps={{ maxLength: 30 }}
                                />
                            )}
                            />
                        </div>
                        <div className='w-48 mb-20'>
                            <Controller
                                name="description"
                                control={control}
                                rules={{required: "This field is required"}}
                                render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                    label={`Group Description (Text ${watch('description')?.length || 0}/255 Characters)`}
                                    className='w-100'
                                    onChange={onChange}
                                    value={value || ""}
                                    error={!!errors.description}
                                    inputProps={{ maxLength: 255 }}
                                    helperText={errors.description?.message}
                                />
                            )}
                            />
                        </div>
                        
                        <div className='w-48 mb-20'>
                            <Controller
                            name="members"
                            control={control}
                            render={({ field: { onChange,value = [] } }) => (
                                <CustomAutocomplete
                                options={[]}
                                multiple
                                onChange={(e,v) => {    
                                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v[0])
                                    if (!isEmail) {
                                    showToast(ToastActionTypes.ERROR, 'Invalid email Address')
                                    return;
                                    }
                                    if(checkDuplicates(v)) return;
                                    setOutsideMembers((prev: any[]) => [...prev, {email: v[0]}])        
                                    onChange(v)
                                    const isYou = v[0] === emailData[0]?.email
                                    isYou && setValue('addMe', true)
                                    setGroupMembers(prev => [...prev, ...v?.map((i:any) => ({email: i, isYou}))])
                                    setValue('members', [])
                                }}
                                value = {value || []}
                                label="Add members"
                                // renderTags={() => null}
                                freeSolo
                                />
                            )}
                            />
                        </div>

                        <div className='w-48 mb-20'>
                            <Controller
                                name="adminName"
                                control={control}
                                rules={{required: "This field is required"}}
                                render={({ field: { onChange, value } }) => (
                                <CustomAutocomplete
                                options={data?.data?.map((item: any) => item.fullname) || []}
                                onChange={(e,v) => onChange(v)}
                                value = {value || null}
                                label="Group Admin Name"
                                error={!!errors.adminName}
                                helperText={errors.adminName?.message as string}
                                />
                            )}
                            />
                        </div>

                        <div className='w-100 mb-20'>
                            <div className='w-100'>
                            <Controller
                                name="addMe"
                                control={control}
                                render={({ field: { onChange,value} }) => (
                                <CustomCheckBox
                                label="Add me in group"
                                onChange={(e:any, v: boolean) => {
                                    onChange(v)
                                    setGroupMembers((prev: any) => 
                                      v ? [{email: emailData[0].email, isYou: true}, ...prev]
                                      : prev.filter((i:any) => i.email !== emailData[0].email) )
                                }}
                                labelPlacement='end'
                                checked={value || false}
                                />
                                )}
                            /> 
                            </div>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <CustomButton type='submit' className='primary_btns' label="Save" disabled={isLoading} />
                    </div>
                </form>
                <div className='member_list'>
                    <Contacts handleSelectOrRemoveContact={handleSelectOrRemoveContact} outsideMembers={outsideMembers} removedItem={removedItem} meetAttendees={groupMembers || []} />
                    <div className='member_items'>
                        {groupMembers.map((item: any) => {
                            return <div className={`membar_item ${item.isYou ? 'group_admin' : ''}`} key={item.id}>
                            <div className='d-flex items-center mb-5'>
                                <div className='usr_img '>
                                    <img src="/contact-user.png" />
                                </div>
                                <div className='usr_dtl d-flex flex-column'>
                                    <span className='usr_nme'>{item.firstname}</span>
                                    <span className='usr_eml'>{item.email}</span>
                                </div>
                                {!item.isYou && <div className='membr_remove' onClick={() => handleRemove(item)}>
                                    <CloseIcon />
                                </div>}
                            </div>
                        </div>
                        })}
                    </div>
                </div>

            </div>
        </>
    )
}

export default BasicGroupCreation;