import React, { useContext, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import CustomTextField from './CustomTextField';
import CustomButton from './CustomButton';
import { useMutation, useQuery } from 'react-query';
import request from '../services/http';
import { EDIT_USER_DETAILS, GET_USER_DETAILS, UPDATE_USERNAME_FLAG } from '../constants/Urls';
import { queryClient } from '../config/RQconfig';
import { ToastActionTypes } from '../utils/Enums';
import showToast from '../utils/toast';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../context/auth/AuthContext';
import { AuthActionTypes } from '../context/auth/AuthContextTypes';
import Loader from './Loader';

const UpdateUsername = () => {
    const {state, dispatch} = useContext(AuthContext)
    const [openDialog, setOpenDialog] = useState(false)
  const { handleSubmit, control, formState: { errors }, reset, setValue} = useForm<{username: string}>();
  const { data, isLoading } = useQuery("user-details-data", () => request(GET_USER_DETAILS),{
    onSuccess: (data) => {
      setValue('username', data?.userData?.username)
      !state.isUsernameUpdated && setOpenDialog(true)
    }
  });

  const { mutate: editUserDetails, isLoading: isLoading2 } = useMutation((body: object) => request(EDIT_USER_DETAILS, "post", body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user-details-data');
      showToast(ToastActionTypes.SUCCESS, data?.message)
      setOpenDialog(false)
      dispatch({type: AuthActionTypes.SET_USER_INFO, payload: {...state, isUsernameUpdated: true}})
    }
  });

  const { mutate: updateUsernameFlag } = useMutation((body: object) => request(UPDATE_USERNAME_FLAG, "post", body));
  
  const handleUpdateUsername = (formData: any) => {
editUserDetails({username: formData.username})
  }

  const handleClose = () => {
    setOpenDialog(false)
    updateUsernameFlag({})
  }
  
  return (
<Dialog
open={openDialog}
aria-labelledby="alert-dialog-title"
aria-describedby="alert-dialog-description"
>

    <form onSubmit={handleSubmit(handleUpdateUsername)}>
    <div className='popup-header'>
    <h2>Update Username</h2>
    <CloseIcon onClick={handleClose} />
</div>
    <DialogContent>
        {(isLoading || isLoading2) && <Loader />}
          <Controller
            name="username"
            control={control}
            rules={{
              required: "This field is required",
              minLength: {
                value: 6,
                message: "Username must be at least 6 characters long",
              },
              pattern: {
                value: /^\S*$/,
                message: "Invalid Username",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomTextField
                label="Username"
                size="small"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={onChange}
                value={value || ''}
                error={!!errors?.username}
                helperText={errors?.username?.message}
              />
            )}
          />
           </DialogContent>
           <DialogActions>
           <CustomButton
            type="submit"
            size="medium"
            label="Update"
          />
        <CustomButton
            onClick={handleClose}
            color="primary"
            label="Cancel"
        />
         </DialogActions>
        </form>
        </Dialog>
  )
}

export default UpdateUsername