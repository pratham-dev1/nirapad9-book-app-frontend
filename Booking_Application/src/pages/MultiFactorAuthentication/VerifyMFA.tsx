import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import { Grid, TextField, Typography } from '@mui/material';

import CustomButton from '../../components/CustomButton';
import { ToastActionTypes } from '../../utils/Enums';
import { VERIFY_MFA } from '../../constants/Urls';
import showToast from '../../utils/toast';
import request from '../../services/http';

interface VerifyMFAProps {
  userId: string;
  onSuccess?: () => void;
  onError?: () => void;
}

const VerifyMFA: React.FC<VerifyMFAProps> = ({ userId, onSuccess, onError }) => {
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

  const handleVerifyMFA = () => {
    const otpValue = otp.join('');
    verifyMFAMutation({ userId, otp: otpValue });
  };

  const { mutate: verifyMFAMutation } = useMutation(
    (body: { userId: string; otp: string }) => request(VERIFY_MFA, 'post', body),
    {
      onSuccess: (data) => {
        if (data.success) {
          showToast(ToastActionTypes.SUCCESS, 'MFA Verified!');
          onSuccess?.();
        } else {
          showToast(ToastActionTypes.ERROR, 'Invalid MFA Code');
          onError?.();
        }
      },
      onError: () => {
        showToast(ToastActionTypes.ERROR, 'Failed to verify MFA');
        onError?.();
      },
    }
  );

  return (
    <div className="verify-mfa-container">
       <Typography variant="h4" gutterBottom>
            Enter Your Verification Code.
          </Typography>
      <Grid container spacing={1}>
        {otp.map((digit, index) => (
          <Grid item xs={2} key={index}>
            <TextField
              type="text"
              className='otp-box'
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
        label="Verify MFA"
        size="small"
        className="primary_btns mr-10"
        onClick={handleVerifyMFA}
      />
    </div>
  );
};

export default VerifyMFA;
