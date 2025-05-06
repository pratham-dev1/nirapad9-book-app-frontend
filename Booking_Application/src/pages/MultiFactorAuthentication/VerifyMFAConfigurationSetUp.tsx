import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import { Grid, TextField } from '@mui/material';

import CustomButton from '../../components/CustomButton';
import { ToastActionTypes } from '../../utils/Enums';
import { UPDATE_MFA_CONFIGRATION_SETUP, VERIFY_MFA } from '../../constants/Urls';
import showToast from '../../utils/toast';
import request from '../../services/http';

interface VerifyMFAProps {
  userId: string;
  isFromHomeRoutePath:boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

const VerifyMFAConfigurationSetUp: React.FC<VerifyMFAProps> = ({ userId,isFromHomeRoutePath, onSuccess, onError }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Assuming 6-digit OTP
  const inputRefs = useRef<HTMLInputElement[]>([]); // Array to store refs for each input

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { value } = e.target as HTMLInputElement; // Type narrowing here
    if (/^[0-9]?$/.test(value)) { // Allow only one digit
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next input box if the current one is filled
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyMFAConfigurationSetup = () => {
    const otpValue = otp.join('');
    updateMFAConfigurationSetup({ userId, otp: otpValue,isFromHomeRoutePath});
  };


  const { mutate: updateMFAConfigurationSetup } = useMutation(
    (body: { userId: string; otp: string,isFromHomeRoutePath:boolean }) => request(UPDATE_MFA_CONFIGRATION_SETUP, 'post', body),
    {
      onSuccess: (data) => {
        if (data.success) {
          showToast(ToastActionTypes.SUCCESS, 'MFA Configuration Setup is Done!');
          onSuccess?.();
        } else {
          showToast(ToastActionTypes.ERROR, 'Invalid Code');
          onError?.();
        }
      },
      onError: () => {
        showToast(ToastActionTypes.ERROR, 'Failed to verify MFA Configuration Setup');
        onError?.();
      },
    }
  );

  return (
    <>
      <Grid container spacing={1} sx={{maxWidth:"400px"}}>
        {otp.map((digit, index) => (
          <Grid item xs={2} key={index} >
            <TextField
             className='otp-box'
              type="text"
              inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputRef={(el) => (inputRefs.current[index] = el!)} // Assign ref to the input
            />
          </Grid>
        ))}
      </Grid>
      <CustomButton
        label="Verify"
        size="small"
        className="primary_btns mr-10"
        onClick={handleVerifyMFAConfigurationSetup}
      />
    </>
  );
};

export default VerifyMFAConfigurationSetUp;
