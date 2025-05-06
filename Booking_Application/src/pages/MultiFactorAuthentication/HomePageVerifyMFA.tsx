

import { useMutation } from 'react-query';
import CustomButton from '../../components/CustomButton';
import '../../styles/MFAStyle.css';

import ConfigureMFASetup from "./ConfigureMFASetup";
import VerifyMFA from "./VerifyMFA";
import request from '../../services/http';
import { SKIP_MFA, VERIFY_MFA } from '../../constants/Urls';
import showToast from '../../utils/toast';
import { ToastActionTypes } from '../../utils/Enums';

interface HomePageVerifyMFAProps{
  userId:string
  mfaConfigured:boolean
  mfaManditory:boolean
  onSuccessVerifiedMFA:()=>void
  onSuccessSkipMFA:()=>void
}

const HomePageVerifyMFA: React.FC<HomePageVerifyMFAProps> = (props) => {
 const {userId,mfaConfigured,mfaManditory,onSuccessVerifiedMFA,onSuccessSkipMFA}=props

 const { mutate: skipMFAMutation } = useMutation(
  (body: {}) => request(SKIP_MFA, 'post', body),
  {
    onSuccess:(data)=>{
      onSuccessSkipMFA()
    },
    onError: () => {
      showToast(ToastActionTypes.ERROR, 'Unable to skip MFA');
    },
  }
);
 
const hanldeSkipMFA=()=>{
  skipMFAMutation({})
}

  return (
    <div className="home-page-verify-mfa-container">
    {mfaConfigured ? 
        <VerifyMFA userId={userId} onSuccess={onSuccessVerifiedMFA} /> : 
        <ConfigureMFASetup isFromHomeRoutePath={true} onSuccessConfigurationSetup={onSuccessVerifiedMFA}/>}
        {
          mfaManditory ? null : 
                <CustomButton
                label="Skip"
                size="small"
                className="secondary_btns mr-10"
                onClick={hanldeSkipMFA}
                color='warning'
              />
        }

    </div>
  );
};

export default HomePageVerifyMFA;
