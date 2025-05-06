import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import AddIcon from "../../styles/icons/AddIcon";
import CopyIcon from "../../styles/icons/CopyIcon";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import OptionIcon from "../../styles/icons/OptionIcon";
import request from "../../services/http";
import { CREATE_PREDEFINED_MEET, DELETE_PREDEFINED_MEET, GET_PREDEFINED_MEETS, GET_PREDEFINED_MEETS_LOCATIONS, GET_PREDEFINED_MEETS_TYPES } from "../../constants/Urls";
import { CLIENT_URL } from "../../services/axios";
import { AuthContext } from "../../context/auth/AuthContext";
import Loader from "../../components/Loader";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import { queryClient } from "../../config/RQconfig";
import BackArrowIcon from "../../styles/icons/BackArrowIcon";


const PredefinedMeetList: React.FC = () => {
    const navigate = useNavigate();
    const {data: meetLocations} = useQuery('predefined-meet-locations', () => request(GET_PREDEFINED_MEETS_LOCATIONS))
    const {data: meetTypes} = useQuery('predefined-meet-types', () => request(GET_PREDEFINED_MEETS_TYPES))
    const {data, isLoading, isFetching} = useQuery('predefined-meet', () => request(GET_PREDEFINED_MEETS))
    const {mutate: mutateDelete, isLoading: isDeleteLoading} = useMutation((body: object) => request(DELETE_PREDEFINED_MEET, 'delete', body),{
        onSuccess: (data) => {
            showToast(ToastActionTypes.SUCCESS, data?.message)
            queryClient.invalidateQueries('predefined-meet')
        }
    })
    return (
        <>
            {(isLoading || isDeleteLoading || isFetching) && <Loader />}
            <div className="page-wrapper">
                <div className="d-flex justify-between items-center mb-30">
                    <h1>
                        <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/settings')} ><BackArrowIcon /></span>
                        Predefined Audio/Video Config
                    </h1>
                    
                </div>

                <div className="w-100 d-flex flex-row list-view-template">
                    <div className="w-15 d-flex justify-center items-center mb-30 add_tmplt_wrp" onClick={() => navigate('/add-predefined-meeting')}>
                        <div className="add_tmplt">
                            <span className="add_tmplt_icon">
                                <AddIcon/>
                            </span>
                            <span>Add New</span>
                        </div>
                    </div>
                    <div className="w-100 tmplt_lst d-flex flex-row mb-70">
                        {data?.data?.map((item: any) => {
                            return <div className="w-100 d-flex tmplt_list_item items-center">
                            <div className="tmplt_nme">
                                {item.id}
                            </div>
                            <div className="tmplt_nme">
                                {meetLocations?.data.filter((el: any) => el.id === item.location)[0]?.value || '-'}
                            </div>
                            <div className="tmplt_nme">
                            {meetTypes?.data.filter((el: any) => el.id === item.type)[0]?.value || '-'}
                            </div>
                            <div className="tmplt_nme">
                                {item.url || item?.phone || '-'}
                            </div>
                            <div className="tmplt_act">
                                <div className="tmplt_opt">
                                    <div className="tmplt_opt_icon">
                                        <OptionIcon />
                                        <ul className="opt_item">
                                            <li onClick={() => navigate('/edit-predefined-meeting', {state: {data: item}})}>Edit</li>
                                            <li onClick={() => navigate('/predefined-meeting-details', {state: {data: item, view: true}})}>View</li>
                                            {/* <li onClick={() => {
                                        navigator.clipboard.writeText(item.url)
                                    }}>Copy</li> */}
                                            <li onClick={() => mutateDelete({id: item.id})}>Delete</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        })}
                    </div>
                </div>

            </div>
        </>
    )
}

export default PredefinedMeetList;