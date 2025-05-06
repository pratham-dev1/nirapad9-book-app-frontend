import React, { FC, useEffect, useState } from 'react'
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

type FormInputProps = {
    name: string;
    members: any[];
    addMe: boolean;
    groups: any[];
}

const AddGroup: FC = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const [view, setView] = useState<any>('basic_group');

    const formData = location.state.data;
    const [groupMembers, setGroupMembers] = useState([])
    const {data, isLoading: isUserLoading} = useQuery(['all-user-list'],() => request(GET_ALL_USER_LIST, "get"))
    const {data: groupsData } = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"))
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
        formData && reset({name: formData.name, members: formData.groupMembers})
        setGroupMembers(formData?.groupMembers || [])
    },[formData])
    const onSubmit = (formData: FormInputProps) => {
        mutateGroup({...formData, members: formData.members.map((i) => i.id)})
    }

    const handleRemove = (item: any) => {
        let filterValues =  groupMembers.filter((el: any) => el.id !== item.id)
        setValue('members', filterValues)
        setGroupMembers(filterValues)
    }

    return (
        <div className='page-wrapper top_algn-clr-mode mb-20'>
            {(isLoading || isUserLoading) && <Loader />}
            <div className="d-flex justify-between items-center mb-20">
                <h1 className='mb-zero'>
                    <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
                    {formData ? 'Edit' : 'Create' } Group
                </h1>
            </div>

            <div className='card-box add_group_frm_wpr'>
                <div className='w-100 d-flex'>
                    <div className="view-toggle">
                        <span 
                            className={view === 'basic_group' ? 'active-frm-grp' : ''} 
                            onClick={() => setView('basic_group')}
                        >
                        <span className='icon_circle'><AddIcon /></span> Create Basic Group
                        </span>
                        <span 
                            className={view === 'merge_group' ? 'active-frm-grp' : ''} 
                            onClick={() => setView('merge_group')}
                        >
                        <span className='icon_circle'><AddIcon /></span> Group Member Merge
                        </span>
                    </div>
                </div>
                {view === 'basic_group' ?
                    <BasicGroupCreation />
                : 
                    <MergeGroupCreation />
                 }
                
            </div>
        </div>
    )
}

export default AddGroup;