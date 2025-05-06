import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomButton from "../components/CustomButton";
import request from "../services/http";
import { useMutation, useQuery } from "react-query";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { CREATE_USER, GET_INDUSTRIES } from "../constants/Urls";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';
import { Button } from "@mui/material";
import { SERVER_URL } from "../services/axios";
import { LOGO_URL } from '../../src/constants/Urls';
import { RadioGroup, Radio, FormControl, FormControlLabel    } from "@mui/material";
import CustomAutocomplete from "../components/CustomAutocomplete";


interface FormInputProps {
  username: string;
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  subscription: any;
  accountType: string;
  business: string;
  industry: string
}

const generateRandomPassword = () => {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+';
 
  const allChars = lowercaseChars + uppercaseChars + numberChars + specialChars;
  const passwordLength = 12;

  let password = '';

  password += lowercaseChars[Math.floor(Math.random() * 26)];
  password += uppercaseChars[Math.floor(Math.random() * 26)];
  password += numberChars[Math.floor(Math.random() * 10)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  for (let i = 4; i < passwordLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  password = password.split('').sort(() => Math.random() - 0.5).join('');
 
  return password;
  };

const Signup = () => {
    const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormInputProps>();

  const {data: industries} = useQuery("industries", () => request(GET_INDUSTRIES));

  const { mutate: mutateSignup } = useMutation((body: object) => request(CREATE_USER, "post", body),
    {
      onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, 'Signed Up Successfully - A verification link has been sent to your email, Please verify it', {autoClose: 5000});
        navigate('/login')
      },
    }
  );

  const handleSignup = (formdata: FormInputProps) => {
    mutateSignup({...formdata, usertype: 4, password: generateRandomPassword()})
  };

  const handleGoogleLogin = () => {
    window.location.href =  `${SERVER_URL}/api/auth/google-login`
  }

  const handleMicrosoftLogin = () => {
    window.location.href =  `${SERVER_URL}/api/auth/microsoft-login`
  }

  const [view, setView] = useState<any>('trial');

  return (
    <div className="signup-wrapper d-flex flex-column justify-center align-center rainbow-bg">
      <div className="sign-form-col rainbow-border">
        <div className="logo mb-50 text-center">
          <img className="logo-img" src={LOGO_URL} alt="Logo" />
          <h2 className="text-center">Sign up with Booking App for free</h2>
        </div>
        <form onSubmit={handleSubmit(handleSignup)}>
          <div className="w-100 usr_typ mb-30">
          <Controller
              name="accountType"
              control={control}
              render={({ field: { onChange, value } }) => (
            <RadioGroup className="d-flex justify-between flex-row" defaultValue="individual">
              <div className="usr_typ_opt w-48 d-flex align-start">
                <FormControlLabel 
                  className="" 
                  value="individual" 
                  control={<Radio />} 
                  label=""
                  onChange={onChange} 
                />
                <div className="d-flex justify-center items-center">
                  <img src="/person-icon.svg" className="mr-10" />
                  <span className="font-bold">Individual</span>
                </div>
              </div>
              <div className="usr_typ_opt w-48 d-flex align-start">
                <FormControlLabel 
                  className="" 
                  value="business" 
                  control={<Radio />} 
                  label=""  
                  onChange={onChange} 
                />
                <div className="d-flex justify-center items-center">
                  <img src="/business-person-icon.svg" className="mr-10" />
                  <span className="font-bold">Business</span>
                </div>
              </div>
            </RadioGroup>
              )}
              />
          </div>
          <Controller
            name="username"
            control={control}
            rules={{ 
              required: "This field is required",
              minLength: {
                value: 6,
                message: "Username must be at least 6 characters long",
              },
              validate: (value) => value.includes('@') ? 'Username should not contain @ symbol' : true 
            }}
            render={({ field: { onChange } }) => (
              <CustomTextField
                label="Username"
                size="small"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                error={!!errors?.username}
                helperText={errors?.username?.message}
                inputProps={{ maxLength: 30 }}
              />
            )}
          />
          <Controller
            name="fullname"
            control={control}
            rules={{ 
              required: "This field is required",
              minLength: {
                value: 6,
                message: "Username must be at least 6 characters long",
              },
             }}
            render={({ field: { onChange } }) => (
              <CustomTextField
                label="Fullname"
                size="small"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                error={!!errors?.fullname}
                helperText={errors?.fullname?.message}
                inputProps={{ maxLength: 40 }}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{
                required: "This field is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid email address",
                },
              }}
            render={({ field: { onChange } }) => (
              <CustomTextField
                label="Email"
                size="small"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                error={!!errors?.email}
                helperText={errors?.email?.message}
              />
            )}
          />

          { watch('accountType') === 'business' &&
            <>
              <Controller
              name="business"
              control={control}
              rules={{required: "This field is required"}}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  label="Business name"
                  size="small"
                  fullWidth
                  sx={{ marginBottom: 2 }}
                  onChange={onChange}
                  error={!!errors?.business}
                  helperText={errors?.business?.message}
                />
              )}
              />
              <Controller
                  name="industry"
                  rules={{ required: "This field is required" }}
                  control={control}
                  render={({ field: { onChange, value} }) => (
                    <CustomAutocomplete  
                      options={industries?.data || []}
                      getOptionLabel={(option) => option.name}
                      onChange={(e,v) => onChange(v.id)}
                      label="Add industry"
                      error={!!errors.industry}
                      helperText={errors.industry?.message}
                      disableClearable
                    />
                  )}
                />
        </> 
          }

          {/* <div className="w-100 d-flex flex-row justify-between items-center mt-30 mb-30">
            <div className="view-toggle">
              <span 
                className={view === 'trial' ? 'active-view' : ''} 
                onClick={() => setView('trial')}
              >
                5 Days free trial
              </span>
              <span 
                className={view === 'Paid' ? 'active-view' : ''} 
                onClick={() => setView('Paid')}
              >
                Paid Plan
              </span>
            </div>

            <div className="w-60 plans_optns d-flex justify-end">
              {view === 'trial' ?
              <Controller
              name="subscription"
              control={control}
              defaultValue={2}
              render={({ field: { onChange, value } }) => (
                <RadioGroup className="d-flex flex-row" defaultValue={2}>
                  <FormControlLabel 
                    className="" 
                    value={1} 
                    control={<Radio />} 
                    label="Basic"
                    disabled 
                    onChange={onChange}
                  />
                  <FormControlLabel 
                    className="" 
                    value={2}
                    control={<Radio />} 
                    label="Advanced"
                    onChange={onChange} 
                  />
                  <FormControlLabel 
                    className="" 
                    value={3}
                    control={<Radio />} 
                    label="Professional"
                    disabled 
                    onChange={onChange}
                  />
                </RadioGroup>
              )}
              />
              : 
                <RadioGroup className="d-flex flex-row paid_plns_opts" defaultValue="paid_basic">
                  <div className="d-flex flex-row mr-10">
                    <FormControlLabel 
                      className="" 
                      value="paid_basic" 
                      control={<Radio />} 
                      label="" 
                    />
                    <div className="d-flex flex-column align-start">
                      <span className="font-bold">Basic</span>
                      <small>($1/month)</small>
                    </div>
                  </div>

                  <div className="d-flex flex-row mr-10">
                    <FormControlLabel 
                      className="" 
                      value="paid_advanced" 
                      control={<Radio />} 
                      label="" 
                    />
                    <div className="d-flex flex-column align-start">
                      <span className="font-bold">Advanced</span>
                      <small>($5/month)</small>
                    </div>
                  </div>

                  <div className="d-flex flex-row mr-10">
                    <FormControlLabel 
                      className="" 
                      value="paid_professional" 
                      control={<Radio />} 
                      label="" 
                    />
                    <div className="d-flex flex-column align-start">
                      <span className="font-bold">Professional</span>
                      <small>($9/month)</small>
                    </div>
                  </div>
                  
                </RadioGroup>
              }
            </div>
          </div> */}

          {/* <Controller
            name="password"
            control={control}
            rules={{
              required: "This field is required",
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
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "This field is required",
              validate: (value: string) => {
                if (watch("password") != value) {
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
          /> */}
          <CustomButton
            type="submit"
            size="medium"
            label="Sign up"
            className="sign-btn"
            fullWidth
            sx={{ marginBottom: 2 }}
          />
        </form>
        <div className="signup-link text-center mb-30">
          <span>Already have an account?</span>
          <small onClick={()=>navigate('/login')}>Log in</small>
        </div>
        <div className="or-col">
          <span className="div-line"></span>
          <span className="or-text">OR</span>
        </div>

        <div className="social-login-btns d-flex flex-column">
          <Button variant="outlined" className="d-flex align-center justify-center w-100 br-50 mb-20" onClick={handleGoogleLogin}>
            <img src="/google-icon.png" width="24" /> Signup with Google
          </Button>

          <Button variant="outlined" className="d-flex align-center justify-center w-100 br-50" onClick={handleMicrosoftLogin}>
            <img src="/microsoft-icon.png" width="16" /> Signup with Microsoft
          </Button>
        </div>
      </div>
      <div className="signup-agree-text">
        <p>By creating a Bookign App account, you agree to <span>Booking App’s Terms</span> and <span>Privacy Policy.</span></p> 
      </div>
    </div>
  );
};

export default Signup;
