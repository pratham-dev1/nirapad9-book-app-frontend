import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTextField from "../components/CustomTextField";
import { useMutation } from "react-query";
import { Controller, useForm } from "react-hook-form";
import request from "../services/http";
import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useContext, useState } from "react";
import { ToastActionTypes } from "../utils/Enums";
import showToast from "../utils/toast";
import { CHANGE_PASSWORD, CREATE_NEW_PASSWORD, LOGOUT } from "../constants/Urls";
import { useLogout } from "../hooks/useLogout";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Loader from "../components/Loader";
import CloseIcon from "@mui/icons-material/Close";



type FormInputProps = {
    oldPassword: string;
    password: string;
    confirmPassword: string;
};

const ChangePassword: React.FC = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);

    const {
        handleSubmit,
        control,
        formState: { errors },
        watch
    } = useForm<FormInputProps>();

    const { mutate: changePassword, isLoading: isLoadingChangePassword } = useMutation((body: object) => request((CHANGE_PASSWORD), "post", body), {
        onSuccess: (data) => {
            setOpenDialog(false);
            showToast(ToastActionTypes.SUCCESS, "Password Changed Successfully")
        }
    });

    const handlePasswords = (formData: FormInputProps) => {
        changePassword(formData)
    };

    return (
        <div className="login-form-outer-div">
            <div className="user-info-col d-flex items-center justify-between">
                <p className="mr-25 user-label">Change Password</p>
                <ArrowForwardIcon className="cursur-pointer" onClick={() => setOpenDialog(true)} /> 
            </div>
            
            <div className="login-form-inner-div">
                <Dialog open={openDialog}>
                <div className="popup-header">
                    <h2>Change Password</h2>
                    <CloseIcon onClick={() => setOpenDialog(false)} />
                </div>
                    <DialogContent>
                    {(isLoadingChangePassword) && <Loader />}
                        <form onSubmit={handleSubmit(handlePasswords)} className="change-password-popup">
                            <Controller
                                name="oldPassword"
                                control={control}
                                rules={{
                                    required: "Old Password is required",
                                }}
                                render={({ field: { onChange } }) => (
                                    <CustomTextField
                                        label="Old Password"
                                        type={showOldPassword ? "text" : "password"}
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
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: "Password is required",
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

                            <Controller
                                name="confirmPassword"
                                control={control}
                                rules={{
                                    required: "Confirm Password is required",
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
                            <div className="form-act-fixed">
                                <CustomButton
                                    type="submit"
                                    size="medium"
                                    label="Submit"
                                    className="submit-btn"
                                    sx={{ marginBottom: 2 }}
                                />
                                <Button className="cancel-btn" onClick={() => setOpenDialog(false)}>Cancel</Button>
                            </div>
                            
                        </form>
                    </DialogContent>
                    <DialogActions>
                        
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    )
}

export default ChangePassword