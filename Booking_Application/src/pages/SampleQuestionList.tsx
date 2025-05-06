import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import TextField from '@mui/material/TextField';
import CopyIcon from "../styles/icons/CopyIcon";
import OptionIcon from "../styles/icons/OptionIcon";
import AddIcon from "../styles/icons/AddIcon";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { DELETE_QUESTION, DUPLICATE_QUESTION, GET_QUESTIONS } from "../constants/Urls";
import { queryClient } from "../config/RQconfig";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";


const SampleQuestionList = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery('questions', () => request(GET_QUESTIONS))
    const { mutate: mutateDelete, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_QUESTION, "delete", body),{
    onSuccess: (data) => {
        queryClient.invalidateQueries('questions')
        showToast(ToastActionTypes.SUCCESS, data?.message)
    }
})
    const { mutate: mutateDuplicateQuestion, isLoading: duplicateQuestionLoading } = useMutation(
        (body: object) => request(DUPLICATE_QUESTION, "post", body),
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries('questions')
            showToast(ToastActionTypes.SUCCESS, data?.message);
          },
        }
    );
    return (
        <>
        {(isLoading || isDeleteLoading || duplicateQuestionLoading) && <Loader />}
            <div className="page-wrapper">
                <div className="d-flex justify-between items-center mb-20">
                    <h1 className="mb-zero">
                        <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
                        All Questions
                    </h1>
                    <div className="list-act-optns d-flex mt-20">
                        <div 
                            className="optn_itm d-flex items-center add_new MuiButton-root secondary_btns mr-20" 
                            onClick={() => navigate('/add-questions')}
                        >
                            <span className="linear-icon"><AddIcon/></span>
                            <span className="ml-10">Add New</span>
                        </div>
                    </div>
                </div>

                <div className="w-100 d-flex flex-row list-view-template all-qus-list">
                    <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
                        {data?.data?.map((item: any) =>{
                            return <div className="w-100 d-flex tmplt_list_item items-center">
                            <div className="tmplt_nme qus-title">
                                <span>{item.question}</span>
                            </div>
                            <div className="tmplt_nme qus-type">
                                <span>{item.type}</span>
                            </div>
                            <div className="tmplt_act">
                                <div className="tmplt_copy" onClick={() => mutateDuplicateQuestion(item)}>
                                    <CopyIcon />
                                </div>
                                <div className="tmplt_opt">
                                    <div className="tmplt_opt_icon">
                                        <OptionIcon />
                                        <ul className="opt_item">
                                            <li onClick={() => navigate('/edit-questions', {state: {data: item}})}>Edit</li>
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
export default SampleQuestionList;