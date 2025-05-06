import React, { useState } from 'react'
import CreateNewPassword from './CreateNewPassword'
import { useNavigate, useParams } from 'react-router'
import { useQuery } from 'react-query'
import { UPDATE_PASSWORD_FOR_SECURITY, VERIFY_KEY_FOR_UPDATE_PASSWORD } from '../constants/Urls'
import request from '../services/http'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'

const ResetPasswordForSecurity = () => {
    const navigate = useNavigate()
    const {userId, key} = useParams();
    const [showPasswordForm,setShowPasswordForm] = useState(false);
    const {data, error} = useQuery('verify-password-key', () => request(`${VERIFY_KEY_FOR_UPDATE_PASSWORD}/${userId}/${key}`),{
        onSuccess: (data:any) => {
            if(data.success) {
                setShowPasswordForm(true)
            }
        },
        onError: (error:any) => {
            showToast(ToastActionTypes.ERROR, error?.response?.data.message)
            navigate('/login')
        }
    })
  return (
    <>
    {showPasswordForm &&
    <CreateNewPassword text={'Update Password'} URL={UPDATE_PASSWORD_FOR_SECURITY} isUpdatePasswordForSecurity={true} userId={userId} passwordKeyForSecurity={key} />
    }
    </>
  )
}

export default ResetPasswordForSecurity