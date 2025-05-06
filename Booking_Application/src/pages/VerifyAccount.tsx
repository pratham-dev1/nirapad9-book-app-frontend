import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { VERIFY_ACCOUNT_KEY } from '../constants/Urls'
import request from '../services/http'
import { Link, useParams } from 'react-router-dom'
import { LOGO_URL } from '../../src/constants/Urls';

const VerifyAccount = () => {
    const {userId, key} = useParams()
    const [message, setMessage] = useState('')

    const {data, isLoading} = useQuery('account-key', ()=>request(`${VERIFY_ACCOUNT_KEY}/${userId}/${key}`),{
        retry:0,
        onSuccess: (data) => {
            if(data.success) {
            setMessage(data.message)
            }
        },
        onError: (error: any) => {
            setMessage(error?.response.data?.message)
        }
    })
console.log(data,isLoading)
    if(isLoading){
        return <h1>Loading...</h1>
    }

  return (
    <>
    <div className='rainbow-bg vh-100 d-flex justify-center items-center'>
        <div className='page-wrapper'>
            <div className='card-box mw-800 d-flex flex-column justify-center items-center mb-zero rainbow-border'>
                <div className='text-center mb-30'>
                  <img className="logo-img" src={LOGO_URL} alt="Logo" />
                </div>
                {/* <h1 className='text-center mb-30'>{message}</h1> */}
                <h3 className='text-center mb-10'>Your account has been successfully verified!</h3>
                <img className='mb-20' src="/succes-blue-icon.svg" width="100" height="100" />
                
                <p className='text-center word-break-normal font-bold mb-zero'>Your email [User's Email] has been successfully verified.</p>
                <p className='text-center word-break-normal font-bold mb-zero'>Credentials have been sent to your email.</p>
                <p className='text-center word-break-normal font-bold mb-70'>You can go back to the login page to access the platform.</p>
                <Link className='primary_btns' to="/login">Log in</Link>
            </div>
        </div>
    </div> 

    
    
    </>
  )
}

export default VerifyAccount