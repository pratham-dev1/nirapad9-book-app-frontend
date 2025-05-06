import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Box, Typography } from '@mui/material';

import CustomButton from '../../components/CustomButton';
import { ToastActionTypes } from '../../utils/Enums';
import {  GET_MFA_QR_CODE } from '../../constants/Urls';
import request from '../../services/http';
import showToast from '../../utils/toast';

interface MFAQRCodeProps {
  userId: string; 
  onScanQrCode: () => void;
}

const MFAQRCode: React.FC<MFAQRCodeProps> = ({ userId, onScanQrCode }) => {
  const [qrCode, setQrCode] = useState<string>('');

  const { mutate: getMfaQrCodeMutation } = useMutation(
    (body: { userId: string }) => request(GET_MFA_QR_CODE, 'post', body),
    {
      onSuccess: (data) => {
        setQrCode(data.qrCode);
      },
      onError: () => {
        showToast(ToastActionTypes.ERROR, 'Failed to get Qr code');
      },
    }
  );

  const handleGetQRCode = () => {

    getMfaQrCodeMutation({ userId });
  };

  const renderGetQrCode=()=>
    <div className="scan-qr-code-container">
     <Typography variant="h6" gutterBottom>
           Multifactor Authentication is not configured yet. Please scan the QR Code first.
      </Typography>
      <CustomButton
          label="Get QR Code"
          size="small"
          className="primary_btns mr-10"
          onClick={handleGetQRCode}
          />
    </div>

  return (
    <>
  

      {qrCode ? (
        <>
          <img src={qrCode} alt="Scan this QR code with your app"/>
          <CustomButton
                label="Verify"
                size="small"
                className="primary_btns mr-10  font-12 verify-qr-code-btn"
                onClick={onScanQrCode}
          />
        </>
      ): renderGetQrCode()}
    </>
  );
};

export default MFAQRCode;
