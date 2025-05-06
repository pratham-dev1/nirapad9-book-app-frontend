import React, { ChangeEvent, useContext, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import {ADD_SECONDARY_EMAIL, DELETE_SECONDARY_EMAIL, EDIT_USER_DETAILS, GET_USER_DETAILS, RESEND_VERIFICATION_LINK } from "../constants/Urls";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { queryClient } from "../config/RQconfig";
import { Button, Dialog, DialogActions, DialogContent, Drawer, IconButton } from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomTextField from "../components/CustomTextField";
import AddPhoneNumber from "../components/AddPhoneNumbers";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { AuthContext } from "../context/auth/AuthContext";
import CustomButton from "../components/CustomButton";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import Loader from "../components/Loader";
import { SERVER_URL } from "../services/axios";

const EditUserDetails = () => {
const [openDialog, setOpenDialog] = useState<boolean>(false);
const [openUserNameDialog, setOpenUserNameDialog] = useState(false);
const [userName, setUserName] = useState<string>();
const [userNameError, setUserNameError] = useState<string>('');
const { state, dispatch } = useContext(AuthContext);
const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);

const secondaryEmailToDeleteRef = useRef<string | null>(null); 

const handleOpenDialog = () => {
  setOpenDialog(true);
};

const handleCloseDialog = () => {
  setOpenDialog(false);
};

const { data: userDetailsData, isLoading, isRefetching } = useQuery("user-details-data", () =>
  request(GET_USER_DETAILS), {
    onSuccess: (data) => {
        setUserName(data.userData.username);
    }
  }
);
const { mutate: editUserDetails } = useMutation((body: object) => request(EDIT_USER_DETAILS, "post", body), {
  onSuccess: (data) => {
    queryClient.invalidateQueries('user-details-data');
    showToast(ToastActionTypes.SUCCESS, data?.message)
    dispatch({
      type: AuthActionTypes.SET_USER_INFO,
      payload: {...state, timezone: data?.timezone, isUsernameUpdated: true }
    })
  }
});

const { mutate: deleteSecondaryEmail ,isLoading: isDeleteLoading} = useMutation((body: object) => request(DELETE_SECONDARY_EMAIL, "post", body), {
  onSuccess: (data) => {
    setOpenDeleteDialog(false)
    setOpenDialog(false)
    showToast(ToastActionTypes.SUCCESS, data?.message)
    queryClient.invalidateQueries('user-details-data');
    queryClient.invalidateQueries('user-emails');
    queryClient.invalidateQueries('notifications');
  }
});


const handleSecondaryEmail1DeleteClick = () => {
  deleteSecondaryEmail({email2: null})
  secondaryEmailToDeleteRef.current=null
};

const handleSecondaryEmail2DeleteClick = () => {
  deleteSecondaryEmail({email3: null})
  secondaryEmailToDeleteRef.current=null

};

const handleSave = () => {
  if(!userNameError){
    editUserDetails({username:userName})
    setOpenUserNameDialog(false);  
  }
};

const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setUserName(value);
  if (value.length < 6) {
    setUserNameError('Username must be at least 6 characters long');
  } else {
    setUserNameError('');
  }
};

const handleSecondaryEmailDeleteClick=()=>{
  
  switch(secondaryEmailToDeleteRef.current){
    case "SECONDARY_EMAIL_1":
      handleSecondaryEmail1DeleteClick()
      break
    case "SECONDARY_EMAIL_2":
      handleSecondaryEmail2DeleteClick()
      break
      default:
        break
  }
}

const renderConfirmDeleteSecondaryEmail=():React.ReactElement=><Dialog
open={openDeleteDialog}
aria-labelledby="alert-dialog-title"
aria-describedby="alert-dialog-description"
>
{(isDeleteLoading) && <Loader />}
<div className='popup-header'>
    <h2>Confirmation</h2>
    <CloseIcon onClick={() => setOpenDeleteDialog(false)} />
</div>
<DialogContent>
    <h2 className='text-center mb-50'>Are you sure want to delete this?</h2>
    <div className='d-flex justify-center'>
        <CustomButton label="Delete" className="primary_btns mr-25" onClick={handleSecondaryEmailDeleteClick}/>
        <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
    </div>
</DialogContent>
</Dialog>


  return (
     <>
      
    <div className="user-info-col d-flex items-center justify-between">
      <p className="mr-25 user-label">UserId</p>
      <ArrowForwardIcon className="cursur-pointer" onClick={handleOpenDialog} /> 

      <Dialog open={openDialog} onClose={handleCloseDialog} className="userId-dialog">
        <div className="popup-header">
          <h2>User Details</h2>
          <CloseIcon onClick={handleCloseDialog} />
        </div>
        <DialogContent>
          <div className="w-100 d-flex flex-column">
            {state.orgId !== 1 && <div className="user-details-view">
              <label className="form-label" htmlFor="UserId">User Id :</label>
              <p className="form-input">{userDetailsData?.userData?.id}</p>
            </div> }
            <div className="user-details-view">
              <label className="form-label" htmlFor="UserId">User Name :</label>
              <div className="input-act-icon">
                <p className="form-input">{userDetailsData?.userData?.username}</p>
                <IconButton className="edit-icon"  onClick={() => setOpenUserNameDialog(true)}>
                  <EditOutlinedIcon />
                </IconButton>
              </div>
            </div>
            {state.orgId !== 1 && 
              <div className="user-details-view">
                <label className="form-label" htmlFor="UserId">Org Id :</label>
                <p className="form-input">{userDetailsData?.userData?.baOrgId}</p>
              </div> 
            }
            <div className="user-details-view">
              <label className="form-label" htmlFor="UserId">Primary Email :</label>
              <p className="form-input">{userDetailsData?.userData?.email}</p>
            </div>
            {userDetailsData?.userData?.email2 &&
            <div className="user-details-view">
                <label className="form-label" htmlFor="UserId">Secondary Email 1 :</label>
                <div className="input-act-icon"> 
                  <p className="form-input">{userDetailsData?.userData?.email2 || "-"}</p>
                  <div className="d-flex items-center">
                        <DeleteOutlineOutlinedIcon className="del-icon" onClick={() => {
                          setOpenDeleteDialog(true)
                          secondaryEmailToDeleteRef.current="SECONDARY_EMAIL_1"
                  }} />
                  </div>
                </div>
              </div>
              }
              {userDetailsData?.userData?.email3 && 
              <div className="user-details-view">
                <label className="form-label" htmlFor="UserId">Secondary Email 2 :</label>
                <div className="input-act-icon">
                  <p className="form-input">{userDetailsData?.userData?.email3|| "-"}</p>
                  <div className="d-flex items-center">
                        <DeleteOutlineOutlinedIcon className="del-icon" onClick={
                          () => {
                            setOpenDeleteDialog(true)
                            secondaryEmailToDeleteRef.current="SECONDARY_EMAIL_2"
                            }
                        } />
                  </div>
                </div>
              </div>}
              <div className="user-details-view">
              <CustomButton sx={{ height: 50, backgroundColor: "#729ae2" }} label="Sync google Calendar" onClick={() => window.location.href = `${SERVER_URL}/api/auth/google-login/${state.userId}`} />
              </div>
              <div className="user-details-view">
              <CustomButton sx={{ height: 50, backgroundColor: "#729ae2" }} label="Sync microsoft Calendar" onClick={() => window.location.href = `${SERVER_URL}/api/auth/microsoft-login/${state.userId}`} />
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div> 
    <AddPhoneNumber userDetails={userDetailsData?.userData} isRefetching={isRefetching} /> 
   
    <Dialog open={openUserNameDialog} >
      <div className="popup-header">
        <h2>Update Username</h2>
        <CloseIcon onClick={() => {setOpenUserNameDialog(false); setUserName(userDetailsData?.userData?.username)}} />
      </div>
      <DialogContent>
          <div className="w-100 mw-500">
            <CustomTextField
              label="Username"
              className="w-100"
              sx={{ width: 300 }}
              // onChange={(e) => setUserName(e.target.value)}
              onChange={handleUserNameChange}
              value={userName || ""}
              inputProps={{ maxLength: 30 }}
              error={!!userNameError} 
              helperText={userNameError} 
            />
          </div>
      </DialogContent>
      <DialogActions>
        <Button className="secondary_btns" onClick={() => {setOpenUserNameDialog(false); setUserName(userDetailsData?.userData?.username)}}>Cancel</Button>
        <Button className="primary_btns" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>


    {renderConfirmDeleteSecondaryEmail()}
    </>
  );
};

export default EditUserDetails;
