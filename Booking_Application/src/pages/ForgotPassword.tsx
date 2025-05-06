import React, { useState } from 'react'
import CustomTextField from '../components/CustomTextField'
import CustomButton from '../components/CustomButton'
import { useMutation } from 'react-query'
import request from '../services/http'
import { GENERATE_OTP, RESET_PASSWORD, VERIFY_OTP } from '../constants/Urls'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'
import CreateNewPassword from './CreateNewPassword'
import { useNavigate } from "react-router-dom";
import { LOGO_URL } from '../../src/constants/Urls';

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [showSubmitOtpView, setShowSubmitOtpView] = useState<boolean>(false)
  const [showResetPasswordView, setShowResetPasswordView] = useState<boolean>(false)
  const [otp, setOtp] = useState<string>()
  const [otpError,setOtpError] = useState<boolean>(false); 

  const { mutate: handleGenerateOtp, isLoading: isHandleGenerateOtpLoading } = useMutation((body: object) => request(GENERATE_OTP, "post", body), {
    onSuccess: (data) => {
      if (data.success) {
        // setEmail('');
        setOtp('')
        showToast(ToastActionTypes.SUCCESS, data.message)
        setShowSubmitOtpView(true)
      }
    }
  });
  const { mutate: mutateSubmitOtp, isLoading: isSubmittingOtp  } = useMutation((body: object) => request(VERIFY_OTP, "post", body), {
    onSuccess: (data) => {
      setShowResetPasswordView(true)
    }
  });
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };
  const handleSubmitOtp = () =>{
    setOtpError(false)
    if(otp){
      mutateSubmitOtp({ otp, email });
    }else{
      setOtpError(true)
    }
  }
  return (
    <div className='forgot-password-wrapper rainbow-bg'>
      <div className="form-col rainbow-border">
        {!showResetPasswordView ? (
          <>
            {!showSubmitOtpView ? (
              <>
                <div className='d-flex justify-end mb-30'>
                  <CustomButton
                    label="Back"
                    fullWidth
                    className='secondary_btns back_cta'
                    onClick={() => navigate('/login')}
                  />
                </div>
                <div className='text-center mb-50'>
                  <img className="logo-img" src={LOGO_URL} alt="Logo" />
                </div>
                
                <h2>Enter your registered email address</h2>
                <div className="form-inner">
                  <CustomTextField
                    label="Email Address"
                    value={email}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <CustomButton
                    label="Ask for Otp"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    onClick={() => handleGenerateOtp({ email })}
                    disabled={isHandleGenerateOtpLoading}
                  />
                  
                </div>
              </>
            ) : (
              <>
                <div className='mw-400'>
                  <div className='text-center'>
                    <img className="logo-img" src={LOGO_URL} alt="Logo" />
                  </div>
                  <div className='mb-30'>
                    <p className='text-center font-bold'>Enter OTP</p>
                  </div>
                  <h3 className='text-center pl-20 pr-20 word-break-normal'>Enter OTP code we just sent to your email address [User's Email].</h3>
                  <div className="login-form-inner-div">
                    <div className='mb-30'>
                      <CustomTextField
                        label="Otp"
                        value={otp}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                        onChange={handleOtpChange}
                        // type="number"
                        error={otpError}
                        helperText={otpError ? 'This field is required' : ''}
                      />{" "}
                    </div>
                    <br />
                    <div className='d-flex justify-center items-center'>
                      <CustomButton
                        label="Back"
                        className='secondary_btns mr-25'
                        fullWidth
                        onClick={() => navigate('/login')}
                      />
                      <CustomButton
                        label="Submit"
                        className='primary_btns m-zero'
                        fullWidth
                        onClick={ handleSubmitOtp }
                        disabled={isSubmittingOtp}
                      />
                    

                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
          <div className='d-flex justify-end'>
            <CustomButton
              label="Back"
              fullWidth
              className='secondary_btns back_cta'
              onClick={() => navigate('/login')}
            />
          </div>
            <CreateNewPassword text={'Reset Password'} URL={RESET_PASSWORD} otp={otp} email={email} isResetPassword={true} />
            
          </>

        )}
      </div>
    </div>
  );
}

export default ForgotPassword