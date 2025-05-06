import React, { useContext, useState } from 'react';

import { AuthActionTypes } from '../../context/auth/AuthContextTypes';
import { AuthContext } from '../../context/auth/AuthContext';
import { ToastActionTypes } from '../../utils/Enums';
import showToast from '../../utils/toast';
import "../../styles/MFAStyle.css"

import VerifyMFAConfigurationSetUp from './VerifyMFAConfigurationSetUp';
import MFAQRCode from './MFAQRCode';

interface ConfigureMFASetupProps{

  isFromHomeRoutePath?:boolean
  onSuccessConfigurationSetup?:()=>void
}

const ConfigureMFASetup: React.FC<ConfigureMFASetupProps> = ({isFromHomeRoutePath=false,onSuccessConfigurationSetup}) => {

  const { state,dispatch } = useContext(AuthContext);
  const [isQrCodeScanned, setIsQrCodeScanned] = useState(state.mfaConfigured);

  const userId = state.userId;

  const handleOnScanQrCode = () => {
    setIsQrCodeScanned(true)
  };

  const onSuccessMFASetup = () => {
    dispatch({
      type: AuthActionTypes.SET_USER_INFO,
      payload: {
       ...state,
        mfaConfigured:true,
      },
    });
    onSuccessConfigurationSetup?.()
  };



  if (!userId) {
    showToast(ToastActionTypes.ERROR, 'User ID is invalid. Please log in again.');
    return null; 
  }

  return (
    <div className="configure-mfa-set-up-container">
      
      {!isQrCodeScanned ? (
        <MFAQRCode userId={userId}  onScanQrCode={handleOnScanQrCode} />
      ) : (
       <VerifyMFAConfigurationSetUp userId={userId} onSuccess={onSuccessMFASetup} isFromHomeRoutePath={isFromHomeRoutePath}/>
      )}
    </div>
  );
};

export default ConfigureMFASetup;
