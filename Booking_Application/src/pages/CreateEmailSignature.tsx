import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { TextField, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import { ADD_QUESTION, CREATE_EMAIL_SIGNATURE, EDIT_QUESTION, GET_EMAIL_SIGNATURE, GET_ORGANIZATION } from "../constants/Urls";
import { queryClient } from "../config/RQconfig";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";
import CustomTextField from "../components/CustomTextField";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomCheckBox from "../components/CustomCheckbox";
import PhoneInput from "react-phone-input-2";

interface FormInputProps {
 title:string;
 fullname:string;
 phonenumber: string;
 organization: { id: number, organization: string };
 website: string;
}

const CreateEmailSignature = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.data;
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<FormInputProps>();
  const { data: organizationData, isLoading: organizationLoading, isError: organizationError } = useQuery('organization', () => request(GET_ORGANIZATION));
  const { data: emailSignatureData, isLoading: emailSignatureLoading, } = useQuery('emailSignature', () => request(GET_EMAIL_SIGNATURE),{
    onSuccess(data) {
        reset({title: data?.data.title, fullname:data?.data?.fullname, phonenumber: data?.data?.phonenumber, organization: data?.data?.organization, website: data?.data?.website})
    },
  });

  const { mutate, isLoading } = useMutation(
    (body: object) =>
      request(CREATE_EMAIL_SIGNATURE, "post", body),
    {
      onSuccess: (data) => {
        // queryClient.invalidateQueries('questions')
        navigate(-1)
        showToast(ToastActionTypes.SUCCESS, data?.message);
      },
    }
  );
  const onSubmit = (formdata: FormInputProps) => {
    console.log(formdata);
    mutate({...formdata, organization: formdata?.organization?.id})
  };

  return (
    <>
      {isLoading && <Loader />}
      {emailSignatureLoading && <Loader />}
      <div className="page-wrapper top_algn-clr-mode">
        <div className="d-flex justify-between items-center mb-20">
          <h1 className="mb-zero">
            <span
              className="back-to mr-10 cursur-pointer"
              onClick={() => navigate(-1)}
            >
              <BackArrowIcon />
            </span>
            Email Signature
          </h1>
        </div>

        <div className="card-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-100 mw-700">
              <div className="w-100 mb-10">
              <Controller
                  name="title"
                  control={control}
                  rules={{ 
                    required: "This field is required",
                    validate: (value) => value.trim() !== "" || "This field is required", 
                  }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label="Title"
                      className='w-100'
                      onChange={onChange}
                      value={value || ""}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </div>
              <div className="w-100 mb-20">
              <Controller
                  name="fullname"
                  control={control}
                  rules={{ 
                    required: "This field is required",
                    validate: (value) => value.trim() !== "" || "This field is required", 
                  }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label="Full Name"
                      className='w-100'
                      onChange={onChange}
                      value={value || ""}
                      error={!!errors.fullname}
                      helperText={errors.fullname?.message}
                    />
                  )}
                />
              </div>
              <div className="w-100 mb-20">
              <Controller
                name="phonenumber"
                    control={control}
                    rules={{
                        required: false,
                        pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone number must be exactly 10 digits",
                        },
                        }}
                    render={({ field: { onChange, value } }) => (
                        <CustomTextField
                            label="Phone Number"
                            className="w-100"
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, '');
                                onChange(numericValue);
                            }}
                            value={value || ''}
                            inputProps={{ maxLength: 10}}
                            error={!!errors?.phonenumber}
                            helperText={errors?.phonenumber?.message}
                        />
                    )}
                />
                </div>
                <div className="w-100 mb-20">
                <Controller
                    name="organization"
                    control={control}
                    rules={{required: "This field is required"}}
                    render={({ field: { onChange, value } }) => (
                        <CustomAutocomplete
                        label="Organization"
                        options={organizationData?.data || []}
                        getOptionLabel={(options: { id: number, organization: string }) =>
                          options.organization
                        }
                        isOptionEqualToValue={(option, value) => option.id == value.id}
                        value={value || null}
                        onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                        }}
                        size="small"
                        fullWidth
                        className="red-bg"
                        error={!!errors.organization}
                        helperText={errors.organization?.message}
                      />
                    )}
                    />
                </div>
                <div className="w-100 mb-20">
                <Controller
                    name="website"
                    control={control}
                    rules={{ 
                      required: "This field is required",
                      validate: (value) => value.trim() !== "" || "This field is required", 
                    }}
                    render={({ field: { onChange, value } }) => (
                        <CustomTextField
                        label="Website Url"
                        className='w-100'
                        onChange={onChange}
                        value={value || ""}
                        error={!!errors.website}
                        helperText={errors.website?.message}
                        />
                    )}
                    />
                </div>

              <div className="w-100 mt-50 d-flex justify-center">
                <CustomButton label="Cancel" className="secondary_btns mr-25" onClick={() => navigate(-1)} />
                <CustomButton type="submit" label="Save" className="primary_btns mr-0" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default CreateEmailSignature;
