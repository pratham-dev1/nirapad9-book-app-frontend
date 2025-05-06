import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { TextField, Select, MenuItem, SelectChangeEvent, Dialog, DialogContent } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import request from "../services/http";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";
import CustomTextField from "../components/CustomTextField";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomCheckBox from "../components/CustomCheckbox";
import PhoneInput from "react-phone-input-2";
import { EMAIL_SUPPORT, GET_EMAIL_SUPPORT_CATEGORY, GET_EMAIL_SUPPORT_HISTORY_BY_USER_ID } from "../constants/Urls";
import AddIcon from "../styles/icons/AddIcon";
import CloseIcon from "@mui/icons-material/Close";
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import { queryClient } from "../config/RQconfig";

interface FormInputProps {
 category: any;
 text: string;
}

const EmailSupport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentItem, setCurrentItem] = useState<any>()
  const { data } = useQuery('user-email-support-history', () => request(GET_EMAIL_SUPPORT_HISTORY_BY_USER_ID))
  const formData = location.state?.data;
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<FormInputProps>();

  const {data: category} = useQuery('email-support-categories', () => request(GET_EMAIL_SUPPORT_CATEGORY))
  const { mutate, isLoading } = useMutation((body: object) => request(EMAIL_SUPPORT, "post", body),{
    onSuccess: (data:any) => {
        queryClient.invalidateQueries('user-email-support-history')
        showToast(ToastActionTypes.SUCCESS, data.message)
        reset()
    }
  });
  const onSubmit = (formdata: FormInputProps) => {
    console.log(formdata)
    mutate({...formdata, categoryId: formdata?.category?.id})
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="page-wrapper top_algn-clr-mode">
        <div className="d-flex justify-between items-center mb-20">
          <h1 className="mb-zero">
            <span
              className="back-to mr-10 cursur-pointer"
              onClick={() => navigate(-1)}
            >
              <BackArrowIcon />
            </span>
            Email Support
          </h1>
        </div>
        <div className='add_group_frm_wpr'>
                <div className='w-100 d-flex'>
                    <div className="view-toggle">
                        <span 
                            className={view === 0 ? 'active-frm-grp' : ''} 
                            onClick={() => setView(0)}
                        >
                        <span className='icon_circle'><AddIcon /></span> Create Ticket
                        </span>
                        <span 
                            className={view === 1 ? 'active-frm-grp' : ''} 
                            onClick={() => setView(1)}
                        >
                        <span className='icon_circle'><ViewIcon /></span> View History
                        </span>
                    </div>
                </div>
                {view === 0 ?
                    <div className="card-box">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="w-100 mw-700">
                        <div className="w-100 mb-20">
                          <Controller
                              name="category"
                              control={control}
                              rules={{required: "This field is required"}}
                              render={({ field: { onChange, value } }) => (
                                  <CustomAutocomplete
                                  label="Category"
                                  options={category?.data || []}
                                  getOptionLabel={option => option.name}
                                  isOptionEqualToValue={(option,value) => option.id === value.id}
                                  value={value || null}
                                  onChange={(_, selectedValue) => {
                                    onChange(selectedValue);
                                  }}
                                  size="small"
                                  fullWidth
                                  className="red-bg"
                                  error={!!errors.category}
                                  helperText={errors.category?.message as string}
                                />
                              )}
                              />
                        </div>
                        <div className="w-100 mb-10">
                        <Controller
                            name="text"
                            control={control}
                            rules={{ 
                              required: "This field is required",
                              validate: (value) => value.trim() !== "" || "This field is required", 
                            }}
                            render={({ field: { onChange, value } }) => (
                              <CustomTextField
                                label={`Text ${watch('text')?.length || 0}/200 Characters`}
                                className='w-100'
                                onChange={onChange}
                                value={value || ""}
                                error={!!errors.text}
                                helperText={errors.text?.message}
                                inputProps={{ maxLength: 200 }}
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
                : 
                <div className="w-100 d-flex flex-row list-view-template all-qus-list">
                <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
                <div className="w-100 d-flex tmplt_list_item items-center">
                <div className="tmplt_nme"><span>Category</span></div>
                <div className="tmplt_nme"><span>Comment</span></div>
                <div className="tmplt_nme"><span>Action</span></div> 
                </div>
                  {data?.data?.map((item: any, index: number) => {
                    return <div className="w-100 d-flex tmplt_list_item items-center" key={index}>
                      <div className="tmplt_nme">
                        <span>{item?.category?.name}</span>
                      </div>
                      <div className="tmplt_nme">
                        <span>{item?.text}</span>
                      </div>
                      <div className="tmplt_nme">
                        <ViewIcon onClick={() => {setOpenDialog(true); setCurrentItem(item)}} />
                      </div>
                    </div>
                  })}
                </div>
                <Dialog
                  open={openDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <div className="popup-header">
                    <h2><span className="pl-10">View</span></h2>
                    <CloseIcon onClick={() => setOpenDialog(false)} />
                  </div>
                  <DialogContent>
                    Category: <span><b>{currentItem?.category?.name}</b></span> <br /> <br />
                    Comment: <span><b>{currentItem?.text}</b></span>
                  </DialogContent>
                </Dialog>
              </div>
                 }
                
            </div>
      </div>
    </>
  );
};
export default EmailSupport;
