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
import BasicGroupCreation from './BasicGroupCreation';
import MergeGroupCreation from './MergeGroupCreation';
import AddIcon from '../../styles/icons/AddIcon';
import BackArrowIcon from "../../styles/icons/BackArrowIcon";
import { EventsContext } from '../../context/event/EventsContext';

// type FormInputProps = {
//     name: string;
//     members: any[];
//     addMe: boolean;
//     groups: any[];
// }
type FormInputProps = {
    name: string;
    members: any[];
    addMe: boolean;
    description: string;
    adminName: any;
}
const ViewGroup: FC = () => {
    const navigate = useNavigate();
    const location = useLocation()
    // const [view, setView] = useState<any>('basic_group');
    const formData = location.state.data;
    // const navigate = useNavigate();
    // const location = useLocation()
    const {emailData} = useContext(EventsContext)
    // const formData = location.state.data;
    const [groupMembers, setGroupMembers] = useState<any[]>([])
    // const [outsideMembers, setOutsideMembers] = useState<any>([])
    // const [removedItem, setRemovedItem] = useState<any>()
    const {data, isLoading: isUserLoading} = useQuery(['all-user-list'],() => request(GET_ALL_USER_LIST, "get"))
    const { handleSubmit, control, formState: { errors }, reset, setValue } = useForm<FormInputProps>();
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
    // const onSubmit = (formData: FormInputProps) => {
    //     if(groupMembers.length < 1){
    //         showToast(ToastActionTypes.ERROR, 'At least one member is required')
    //     }else{
    //         mutateGroup({...formData, members: groupMembers.filter(i => !i.isYou), adminName: formData.adminName})
    //     }
    // }
    
    // const handleRemove = (item: any) => {
    //     let filterValues =  groupMembers.filter((el: any) => el.email !== item.email)
    //     setGroupMembers(filterValues)
    //     setRemovedItem(item)
    // }

    // const checkDuplicates = (value: any[]) => {
    //     const isExist = groupMembers.map(i => i.email).includes(value[0]) 
    //     if(isExist) {
    //         showToast(ToastActionTypes.ERROR, 'Already added in the list')
    //         return true;
    //     }
    // }
    // const handleSelectOrRemoveContact = (item: any, setContacts: React.Dispatch<React.SetStateAction<any[]>>) => {
    //     if(!item.selected) {
    //         if(checkDuplicates([item.email])) return; 
    //         setGroupMembers(prev => [...prev, item])
    //     }
    //     else {
    //         setGroupMembers(prev => prev.filter((el: any) => el.email !== item.email))
    //     }

    //     setContacts(prev => prev?.map(el => el.id === item.id ? {...el, selected: !item.selected} : el))
    // }

    const groupFirstLetter = formData.name.charAt(0);

    return (
        <div className='page-wrapper top_algn-clr-mode mb-20'>
            {/* {(isLoading || isUserLoading) && <Loader />} */}
            <div className="d-flex justify-between items-center mb-20">
                <h1 className='mb-zero'>
                    <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
                    Group Details
                </h1>
            </div>

            <div className='card-box add_group_frm_wpr view_details_card'>
                
                <>
            <div className='d-flex flex-row justify-between w-100 group_crtn_frm'>
                
                {/* <form onSubmit={handleSubmit(onSubmit)} className=''> */}
                    <div className='d-flex flex-row justify-between mb-30 w-100'>
                        <div className='w-100 mb-50 grp_nme'>
                            <div className='grp_thmb'>  
                                {groupFirstLetter}
                            </div>
                            <Controller
                                name="name"
                                control={control}
                                rules={{required: "This field is required"}}
                                render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                    label="Group name"
                                    className='w-100'
                                    onChange={onChange}
                                    value={value || ""}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={true}
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
                                    label="Group Description"
                                    className='w-100'
                                    onChange={onChange}
                                    value={value || ""}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                    disabled={true}
                                />
                            )}
                            />
                        </div>
                        
                        {/* <div className='w-48 mb-20'>
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
                                    setGroupMembers(prev => [...prev, ...v?.map((i:any) => ({email: i}))])
                                    setValue('members', [])
                                }}
                                value = {value || []}
                                label="Add members"
                                // renderTags={() => null}
                                freeSolo
                                />
                            )}
                            />
                        </div> */}

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
                                disabled={true}
                                />
                            )}
                            />
                        </div>

                        {/* <div className='w-100 mb-20'>
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
                        </div> */}
                    </div>
                    {/* <div className='d-flex'>
                        <CustomButton type='submit' className='primary_btns' label="Save" />
                    </div> */}
                {/* </form> */}
                <div className='member_list'>
                    <h2 className='mb-30'>Group members:</h2>
                    {/* <Contacts handleSelectOrRemoveContact={handleSelectOrRemoveContact} outsideMembers={outsideMembers} removedItem={removedItem} meetAttendees={groupMembers || []} /> */}
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
                                {/* {!item.isYou && <div className='membr_remove' onClick={() => handleRemove(item)}>
                                    <CloseIcon />
                                </div>} */}
                            </div>
                        </div>
                        })}
                    </div>
                </div>

            </div>
        </>
                
            </div>
        </div>
    )
}

export default ViewGroup;