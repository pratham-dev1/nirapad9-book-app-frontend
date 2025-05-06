import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTextField from "../components/CustomTextField";
import { useMutation } from "react-query";
import { Controller, useForm } from "react-hook-form";
import request from "../services/http";
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useContext, useState } from "react";
import { ToastActionTypes } from "../utils/Enums";
import showToast from "../utils/toast";
import { CREATE_NEW_PASSWORD, LOGOUT } from "../constants/Urls";
import { useLogout } from "../hooks/useLogout";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import { ThemeContext } from "../context/theme/ThemeContext";
import { ThemeActionTypes } from "../context/theme/ThemeContextTypes";
import { LOGO_URL } from '../../src/constants/Urls';

type FormInputProps = {
  password: string;
  confirmPassword: string;
  oldPassword: string
};

type PageProps = {
  text?: string;
  URL?: string;
  otp?: string;
  email?: string;
  isResetPassword?: boolean;
  isUpdatePasswordForSecurity?: boolean;
  passwordKeyForSecurity?: string;
  userId?: string;
}

const CreateNewPassword: React.FC<PageProps> = ({text, URL, otp, email, isResetPassword, isUpdatePasswordForSecurity, userId, passwordKeyForSecurity}) => {
  const { dispatch, state} = useContext(AuthContext);
  const { dispatch: dispatchTheme } = useContext(ThemeContext);
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const {mutateAsync: mutateLogout} = useLogout()

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<FormInputProps>();

  const { mutate: createNewPassword, isLoading: isCreateNewPasswordLoading  } = useMutation((body: object) => request((URL || CREATE_NEW_PASSWORD), "post", body), {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, "Password Updated Successfully, Please login")
      if (isResetPassword) {
        navigate('/login')
      }
      else if (isUpdatePasswordForSecurity) {
        state?.userId ? mutateLogout({}).then(() => navigate('/login')) : navigate('/login')
      }
      else {
        dispatch({
          type: AuthActionTypes.SET_USER_INFO,
          payload: { userId: data?.data.userId, userType: data?.data.userType, isPasswordUpdated: data?.data.isPasswordUpdated, userTypeName: data?.data.userTypeName, profilePicture: data?.data.profilePicture, timezone: data?.data.timezone, subscription: data?.data.subscription, orgId: data?.data.orgId, isFreeTrial: data?.data.isFreeTrial, isPaidPlan: data?.data.isPaidPlan,mfaEnabled:data?.data.mfaEnabled ,mfaConfigured:data?.data.mfaConfigured,mfaManditory:data?.data.mfaManditory, appAccess: data?.data.appAccess, isUsernameUpdated: data?.data.isUsernameUpdated, isMergeCalendarGuideChecked: data?.data?.isMergeCalendarGuideChecked, isFreeTrialOver: data?.data?.isFreeTrialOver}
        })
        dispatchTheme({
          type: ThemeActionTypes.SET_THEME_CONTEXT,
          payload: { theme: data?.data.theme }
        })
      }
    }
  });

  const handlePasswords = (formData: FormInputProps) => {
    isResetPassword ? createNewPassword({...formData, otp, email}) : isUpdatePasswordForSecurity ? createNewPassword({...formData, key: passwordKeyForSecurity, userId}) : createNewPassword(formData)
  };
  
  return (
    
    <div className="form-page-wrapper rainbow-bg">
      <div className="form-col rainbow-border">
        <div className='text-center mb-50'>
          <img className="logo-img" src={LOGO_URL} alt="Logo" />
        </div>
        <h2 className="text-center">{text || 'Create New Password'}</h2>
        {location.pathname === "/create-new-password" && <h4 className="text-center">Credentials have been sent to your email.</h4>}
        <form onSubmit={handleSubmit(handlePasswords)}>
        {!isResetPassword && <div className="w-100 mw-500">
            <Controller
              name="oldPassword"
              control={control}
              rules={{ required: "Existing Password is required"}}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  type={showOldPassword ? "text" : "password"}
                  label="Existing Password"
                  size="small"
                  fullWidth
                  sx={{ marginBottom: 2 }}
                  onChange={onChange}
                  error={!!errors?.oldPassword}
                  helperText={errors?.oldPassword?.message}
                  inputprops={{
                    endAdornment: (
                      <IconButton onClick={() => setShowOldPassword((prev) => !prev)}>
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              )}
            />
          </div>}
          <div className="w-100 mw-500">
            <Controller
              name="password"
              control={control}
              rules={{ 
                required: "Password is required" ,
                pattern: {
                  value:
                    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,28}$/,
                  message:
                  "Password must contain 8 to 28 characters, 1 number, 1 special character (!, @, #, $, %, ^, &, *, (, ), _, +), 1 uppercase letter, and 1 lowercase letter",
                },
              }}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
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
          </div>

          <div className="w-100 mw-500">
            <Controller
              name="confirmPassword"
              control={control}
              rules={{ required: "Confirm Password is required" ,
                validate: (value: string) => {
                  if (watch('password') != value) {
                    return "Passwords must be same";
                  }
                },
              }}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  type={showPassword ? "text" : "password"}
                  label="Confirm Password"
                  size="small"
                  fullWidth
                  sx={{ marginBottom: 2 }}
                  onChange={onChange}
                  error={!!errors?.confirmPassword}
                  helperText={errors?.confirmPassword?.message}
                />
              )}
            />
          </div>
          <CustomButton
            type="submit"
            size="medium"
            label="Submit"
            className="mt-10"
            fullWidth
            sx={{ marginBottom: 2 }}
            disabled= {isCreateNewPasswordLoading}
          />
        </form>
        </div>
        </div>
  )
}

export default CreateNewPassword