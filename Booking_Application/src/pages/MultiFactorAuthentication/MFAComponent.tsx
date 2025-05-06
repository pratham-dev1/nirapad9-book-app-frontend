import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Switch, FormControlLabel, Dialog, DialogContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { AuthActionTypes } from "../../context/auth/AuthContextTypes";
import { AuthContext } from "../../context/auth/AuthContext";
import { ToastActionTypes } from "../../utils/Enums";
import { ENABLE_MFA, GET_ALL_USER_LIST } from "../../constants/Urls";
import showToast from "../../utils/toast";
import request from "../../services/http";

import ConfigureMFASetup from "./ConfigureMFASetup";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import CustomButton from "../../components/CustomButton";

const MFAComponent: React.FC = () => {
  const { state, dispatch } = useContext(AuthContext);
  const [mfaEnabled, setMfaEnabled] = useState(state.mfaEnabled ?? false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const { mutate: enableMFA } = useMutation(
    (body: { userId: string; mfaEnabled: boolean }) =>
      request(ENABLE_MFA, "post", body),
    {
      onSuccess: (data) => {
        dispatch({
          type: AuthActionTypes.SET_USER_INFO,
          payload: {
            ...state,
            mfaEnabled,
          },
        });
        showToast(ToastActionTypes.SUCCESS, data.message);
      },
      onError: () => {
        setMfaEnabled((prev) => !prev);
        showToast(ToastActionTypes.ERROR, "Failed to update enable mfa");
      },
    }
  );

  const { data, isLoading: isUserLoading } = useQuery(["all-user-list"], () =>
    request(GET_ALL_USER_LIST, "get")
  );

  const handleEnableMFA = () => {
    if (!user.id) {
      showToast(ToastActionTypes.ERROR, "User not found please select the user");
      return;
    }

    enableMFA({ userId: user.id, mfaEnabled });
  };

  useEffect(() => {
    if (state?.mfaConfigured) {
      setOpenDialog(false);
    }
  }, [state?.mfaConfigured]);


  const renderUsers = () => (
    <CustomAutocomplete
      options={data?.data ??  []}
      getOptionLabel={(item) => item.fullname}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      onChange={(e, value) => {
        setUser(value)  
        console.log(value)
      }}
      value={user || null}
      label="Users"
    />
  );

  return (
    <div className="login-form-outer-div">
      <div className="user-info-col d-flex items-center justify-between">
        <p className="mr-25 user-label">Multifactor Authentication</p>
        <ArrowForwardIcon
            className="cursur-pointer"
            onClick={() => setOpenDialog(true)}
          />
      </div>

      <div className="login-form-inner-div">
        <Dialog open={openDialog}>
          <div className="popup-header">
            <h2>Enable Multifactor Authenticcation to user</h2>
            <CloseIcon onClick={() => setOpenDialog(false)} />
          </div>
          <DialogContent>
             {renderUsers()}
             <FormControlLabel
                control={
                  <Switch
                    checked={mfaEnabled}
                    onChange={(e,value)=>setMfaEnabled(value)}
                    color="primary"
                  />
                }
                label="Enable"
              />
        
            <CustomButton
              label="MFA"
              className="primary_btns mr-0"
              onClick={handleEnableMFA}
            />

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MFAComponent;
