import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTextField from "../components/CustomTextField";
import { useMutation } from "react-query";
import { Controller, useForm } from "react-hook-form";
import request from "../services/http";
import { LOGIN } from "../constants/Urls";
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useContext, useState } from "react";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import { SERVER_URL } from "../services/axios";
import ResendVerificationLink from "./ResendVerificationLink";
import Loader from "../components/Loader";
import '../styles/Login.css';
import { Button } from "@mui/material";
import { ThemeContext } from "../context/theme/ThemeContext";
import { ThemeActionTypes } from "../context/theme/ThemeContextTypes";
import VideoPlayer from "../components/VideoPlayer";
import video1 from "../../public/login-video-1.mp4";
import { LOGO_URL } from '../../src/constants/Urls';

type FormInputProps = {
  usernameOrEmail: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);
  const { dispatch: dispatchTheme } = useContext(ThemeContext);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userId, setUserId] = useState(null)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputProps>();

  const { mutate: mutateLogin, isLoading } = useMutation((body: object) => request(LOGIN, "post", body), {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data.message)
      dispatch({
        type: AuthActionTypes.SET_USER_INFO,
        payload: { userId: data.userId, userType: data.userType,isPasswordUpdated: data.isPasswordUpdated, userTypeName: data.userTypeName, profilePicture: data?.profilePicture, timezone: data?.timezone, subscription: data?.subscription, orgId: data?.orgId, isFreeTrial: data?.isFreeTrial, isPaidPlan: data?.isPaidPlan,mfaEnabled:data?.mfaEnabled,mfaConfigured:data?.mfaConfigured,mfaManditory:data?.mfaManditory, appAccess: data?.appAccess, isUsernameUpdated: data?.isUsernameUpdated, isMergeCalendarGuideChecked: data?.isMergeCalendarGuideChecked, isFreeTrialOver: data?.isFreeTrialOver }
      })
      dispatchTheme({
        type: ThemeActionTypes.SET_THEME_CONTEXT,
        payload: { theme: data?.theme }
      })
      // if(data.microsoftEventSyncStatus || data.googleEventSyncStatus) {
      // showToast(ToastActionTypes.WARNING,(data.microsoftEventSyncStatus || data.googleEventSyncStatus))
      // }
      // localStorage.setItem('isAuthenticated',"true")
    },
    onError: (error:any) => {
      if (error?.response.data.warning === "Account Not Verified") {
        setUserId(error?.response.data.userId)
      }
      else {
        showToast(ToastActionTypes.ERROR, error?.response.data.message)
      }
    }
  });

  const handleLogin = (formData: FormInputProps) => {
    mutateLogin(formData)
  };

  const handleGoogleLogin = () => {
    window.location.href =  `${SERVER_URL}/api/auth/google-login`
  }

  const handleMicrosoftLogin = () => {
    window.location.href =  `${SERVER_URL}/api/auth/microsoft-login`
  }

  return (
    <>
    {isLoading && <Loader />}
    <div className="login-wrapper d-flex flex-row">
      <div className="login-info-col">
        {/* <div className="slide-bg">
          <img src="/log-slide-bg.png"  />
        </div>
        <div className="login-frames">
          <img src="/login-frame-1.png" className="frame-1"  />
          <img src="/login-frame-2.png" className="frame-2"  />
          <img src="/login-frame-3.png" className="frame-3"  />
        </div> */}
        <VideoPlayer
          src="/login-video-1.mp4"
          type="video/mp4"
          autoplay={true} 
          muted={true}
        />
      </div>
      <div className="login-form-col">
        <div className="logo-wrapper mb-50 text-center">
          {/* <img src="/login-logo.png" width="90" /> */}
          <img className="logo-img" src={LOGO_URL} alt="Logo" />
        </div>
        <form onSubmit={handleSubmit(handleLogin)}>
          <Controller
            name="usernameOrEmail"
            control={control}
            rules={{ required: "Username is required" }}
            render={({ field: { onChange } }) => (
              <CustomTextField
                label="Username or Email"
                size="small"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                error={!!errors?.usernameOrEmail}
                helperText={errors?.usernameOrEmail?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: "Password is required" }}
            render={({ field: { onChange } }) => (
              <CustomTextField
                type={showPassword ? "text" : "password"}
                label="Password"
                size="small"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                error={!!errors?.password}
                helperText={errors?.password?.message}
                inputprops={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            )}
          />
          <div className="password-link mb-50">
            <small onClick={()=>navigate('/forgot-password')}>Forgot Password?</small>
          </div>
          <CustomButton
            type="submit"
            size="medium"
            label="Sign In"
            className="sign-btn rainbow-btn mb-30"
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <div className="signup-link text-center mb-30">
            <span>Don't have an account?</span>
            <small onClick={()=>navigate('/signup')}>Sign up</small>
          </div>
          <div className="or-col">
            <span className="div-line"></span>
            <span className="or-text">OR</span>
          </div>

          <div className="social-login-btns d-flex flex-column">
            <Button variant="outlined" className="d-flex align-center justify-center w-100 br-50 mb-20" onClick={handleGoogleLogin}>
              <img src="/google-icon.png" width="24" /> Continue with Google
            </Button>

            <Button variant="outlined" className="d-flex align-center justify-center w-100 br-50" onClick={handleMicrosoftLogin}>
              <img src="/microsoft-icon.png" width="16" /> Continue with Microsoft
            </Button>
          </div>
          
          {/* <CustomButton
            size="medium"
            color="inherit"
            label="Continue with google"
            fullWidth
            sx={{ marginBottom: 2 }}
            onClick={handleGoogleLogin}
          /> */}
          
          {/* <CustomButton
            size="medium"
            color="inherit"
            label="Continue with microsoft"
            fullWidth
            sx={{ marginBottom: 2 }}
            onClick={handleMicrosoftLogin}
          /> */}
        </form>
      </div>
      
    </div>
    { userId && <ResendVerificationLink userId={userId as unknown as number} setUserId={setUserId} /> }
    </>
  );
};

export default Login;
