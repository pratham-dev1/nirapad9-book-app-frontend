import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import CustomTextField from "./CustomTextField";
import CustomButton from "./CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useForm } from "react-hook-form";
import ClearIcon from "@mui/icons-material/Clear";
import { useMutation } from "react-query";
import request from "../services/http";
import { ADD_PHONE_NUMBERS, DELETE_PHONE_NUMBER } from "../constants/Urls";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { queryClient } from "../config/RQconfig";
import Loader from "./Loader";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import WarningIcon from "../styles/icons/WarningIcon";

const AddPhoneNumber: React.FC<any> = ({ userDetails = {}, isRefetching }) => {
  let { primaryPhonenumber } = userDetails;
  let phoneNumberFields = [...Array(5)].map((item, index) => {
    return {
      phone: (index === 0 ? userDetails[`phonenumber`] : userDetails[`phonenumber${index+1}`]), 
      code: (index === 0 ? userDetails[`phonenumberCountryCode`] : userDetails[`phonenumber${index+1}CountryCode`])
    }
  })
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [phone, setPhone] = useState<any>({phone: '', dialCode: ''})
  const [error, setError] = useState('');

  useEffect(() => {
    let extractedPhoneNumber = phone?.number?.replace(phone.dialCode,'') || ''
    if(extractedPhoneNumber.length >= 6) {
     setError('')
    }
  },[phone])

  const { mutate, isLoading: isAddLoading } = useMutation(
    (body: object) => request(ADD_PHONE_NUMBERS, "post", body),
    {
      onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, data.message);
        queryClient.invalidateQueries("user-details-data");
        let extractedPhoneNumber = phone?.number?.replace(phone.dialCode,'') || ''  // just remove number not the dialcode in the field
        setPhone({...phone, number: phone?.number?.replace(extractedPhoneNumber, '')})
      },
    }
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<any>()
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const { mutate: deletePhoneNumber, isLoading: isDeleteLoading } = useMutation(
    (body: object) => request(DELETE_PHONE_NUMBER, "delete", body),
    {
      onSuccess: (data) => {
        setOpenDeleteDialog(false)
        showToast(ToastActionTypes.SUCCESS, data.message);
        queryClient.invalidateQueries("user-details-data");
      },
    }
  );

  const handleUpdateNumbers = () => {
    let extractedPhoneNumber = phone?.number?.replace(phone.dialCode,'') || ''
    if(extractedPhoneNumber?.length < 6 || !phone.dialCode) {
      setError('Please enter a valid phone number');
      return;
    }
    mutate({phone: extractedPhoneNumber, countryCode: `+${phone.dialCode}`});
  };

  const handleArrowClick = () => {
    setOpenDialog(true);
  };

  const lengthOfPhoneFields = phoneNumberFields.filter(item => item.phone).length
  const onConfirmDelete = () => {
    deletePhoneNumber(selectedPhoneNumber)
  }

  return (
    <div className="update-user-phone d-flex items-center justify-between">
      <p className="user-label mr-25">Update Phone Number:</p>
      <ArrowForwardIcon className="cursur-pointer" onClick={handleArrowClick} />

      <Dialog open={openDialog} className="update-number-dialog">
        {(isRefetching || isAddLoading || isDeleteLoading) && <Loader />}
        
        <div className="popup-header">
          <h2>Update Phone Number</h2>
          <CloseIcon
            className="close-dialog"
            onClick={() => setOpenDialog(false)}
          />
        </div>

        <DialogContent>
          <div className="d-flex justify-center flex-column items-center">
            <div className="modal-inner-container">
              <ul className="phone-list">
                {phoneNumberFields.map((item, index) => {
                  return (
                    <li className="list-item" key={index}>
                      {item.phone && (
                        <>
                        <div className="phone-label w-30">
                          {
                            `${item.code} ${item.phone}` === primaryPhonenumber
                              ? "Primary Phone Number"
                              : "Phone Number"
                          }
                        </div>
                        <div className="phone-numbers w-40">
                          <span>{item.code}</span>
                          <CustomTextField
                            label=""
                            className={
                              `${item.code} ${item.phone}` === primaryPhonenumber
                              ? "primary-number"
                                : "mobile-number"
                            }
                            value={item.phone}
                            disabled={true}
                          />
                        </div>
                          
                          <div className="d-flex justify-end items-center w-30">
                            {`${item.code} ${item.phone}` !== primaryPhonenumber && (
                              <>
                                {/* <DeleteIcon className="cursur-pointer" onClick={() =>asdd deletePhoneNumber({phone: item.phone, countryCode: item.code })} /> */}
                                <DeleteIcon 
                                  className="pointer" 
                                  onClick={() => {
                                    setSelectedPhoneNumber({ phone: item.phone, countryCode: item.code });
                                    setOpenDeleteDialog(true)
                                  }} 
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      onChange={(e) => mutate({primaryNumber: item.phone, countryCode: item.code})}
                                    />
                                  }
                                  style={{ marginLeft: 10 }}
                                  label={"Make Primary"}
                                />
                              </>
                            )}
                          </div>
                          
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            {lengthOfPhoneFields === 5 ? (
              <h3>You can add maximum 5 phone numbers </h3>
              ) : (
                <>
                  <div className="modal-inner-container">
                    <div className="w-100">
                      <label className="form-label">Add Phone Number</label>
                      <PhoneInput
                        country={'us'}
                        countryCodeEditable={false}
                        value={phone?.number || ''}
                        placeholder="Enter Phone"
                        onChange={(phone,data: any) => {
                          setPhone({number: phone, dialCode: data.dialCode})
                        }}
                        enableSearch
                        dropdownClass="react-phone-lib"
                      />
                      <p style={{color: 'red', fontSize: 13, fontWeight:400}}>{error}</p>
                    </div>
                    <div className="w-100 d-flex justify-center mt-20">
                      <CustomButton className="submit-btn" label="Save" onClick={handleUpdateNumbers} /> 
                    </div>
                  </div>    
                </>
              )
            }
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="reason-popup"
      >
        {(isDeleteLoading) && <Loader />}
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Delete Phone Number?</span></h2>
          <CloseIcon
            className="close-dialog"
            onClick={() => setOpenDeleteDialog(false)}
          />
        </div>
        <DialogContent>
            <h2 className="text-center mb-50">Are you sure you want to delete this Phone number?</h2>
            <div className="d-flex justify-center">
              <CustomButton label="Cancel" className="secondary_btns mr-25" onClick={() => setOpenDeleteDialog(false)} />
              <CustomButton label="Delete" className="primary_btns mr-0" onClick={onConfirmDelete}/>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPhoneNumber;
