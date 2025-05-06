import React from 'react'
import { useEffect, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth/AuthContext";
import request from "../../services/http";
import CustomTextField from '../../components/CustomTextField'
import CustomButton from '../../components/CustomButton'
import EditUserType from './EditUserType'
import SkillManagement from './SkillManagement'
import { EDIT_TAB_NAME, GET_ALL_TABS, EDIT_USER_DETAILS } from "../../constants/Urls";
import { AuthActionTypes } from "../../context/auth/AuthContextTypes";
import BackArrowIcon from '../../styles/icons/BackArrowIcon';


const AdminConfig = () => {
    const navigate = useNavigate();
    const { dispatch, state } = useContext(AuthContext);
    const [recruiterMatch, setRecruiterMatch] = useState<any>()
    const [tpPlanner, setTpPlanner] = useState<any>();
    const { data: tabs } = useQuery("all-tabs", () => request(GET_ALL_TABS),{
        enabled: state.userType === 3
    })
    const { mutate: editUserDetails } = useMutation((body: object) => request(EDIT_USER_DETAILS, "post", body),{
        onSuccess:(data) => {
          dispatch({
            type: AuthActionTypes.SET_USER_INFO,
            payload: {...state, timezone: data?.timezone }
          })
        },
    })

    const { mutate: mutateTabName, isLoading: isLoading} = useMutation((body: object) => request(EDIT_TAB_NAME, "post", body))

    useEffect(() => {
        if(tabs?.data) {
        setTpPlanner(tabs?.data?.filter((item: any) => item.tabId === 3 )[0])
        setRecruiterMatch(tabs?.data?.filter((item: any) => item.tabId === 8 )[0])
        }
    },[tabs])

  return (
    <>
        <div className='page-wrapper'>
            <div className="d-flex justify-between items-center mb-20">
                <h1>
                    <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/settings')} ><BackArrowIcon /></span>
                    App Configrations
                </h1> 
            </div>
            <div className='d-flex justify-between'>
                <div className='card-box w-48 mb-30'>
                    <h2>Manage Dimensions</h2>
                    <SkillManagement />
                </div>
                <div className='card-box w-48 mb-30'>
                    <div className='mb-30'>
                        <h2>Edit User Type</h2>
                        <EditUserType />
                    </div>
                    <div className="mb-30">
                        <h2 className="mb-30">Update tab names</h2>
                        <div className="d-flex items-center mb-30">
                        <div className="w-49 mr-25">
                            <CustomTextField className="w-100" label="Tp planner" value={tpPlanner?.tabNameOrgGiven?.split(' Planner')[0]} onChange={(e) => setTpPlanner({tabId: tpPlanner?.tabId, tabNameOrgGiven: e.target.value + ' Planner'})} /> 
                        </div>
                        <CustomButton label="Save" className="mt-30" onClick={() => mutateTabName(tpPlanner)}/>
                        </div>

                        <div className="d-flex items-center mb-30">
                        <div className="w-49 mr-25">
                            <CustomTextField className="w-100" label="Recruiter Match" value={recruiterMatch?.tabNameOrgGiven?.split(' Match')[0]} onChange={(e) => setRecruiterMatch({tabId: recruiterMatch?.tabId, tabNameOrgGiven: e.target.value + " Match"})} />
                        </div>
                        <CustomButton label="Save" className="mt-30" onClick={() => mutateTabName(recruiterMatch)} />
                        </div>
                        
                    </div>
                </div>
                
            </div>
        </div>
    </>
  )
}

export default AdminConfig