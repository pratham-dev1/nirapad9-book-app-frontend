import { Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import CustomButton from '../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CustomTextField from '../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import request from '../services/http';
import { CREATE_EMAIL_TEMPLATE, CREATE_GROUP, EDIT_EMAIL_TEMPLATE, EDIT_GROUP, GET_ALL_USER_LIST } from '../constants/Urls';
import { ToastActionTypes } from '../utils/Enums';
import showToast from '../utils/toast';
import Loader from '../components/Loader';
import { queryClient } from '../config/RQconfig';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomCheckBox from '../components/CustomCheckbox';
import CloseIcon from "@mui/icons-material/Close";
import CustomRichTextEditor from '../components/CustomRichTextEditor';

type FormInputProps = {
    name: string;
    template: string;
} 

const CreateEmailTemplate: FC<{formData?: any}> = ({formData}) => {
    const [openDialog, setOpenDialog] = useState(false)
    const { handleSubmit, control, formState: { errors }, reset } = useForm<FormInputProps>();
    const { mutate: mutate, isLoading } = useMutation((body: object) => request(formData ? EDIT_EMAIL_TEMPLATE : CREATE_EMAIL_TEMPLATE, "post", formData ? {...body, templateId: formData.id} : body), {
        onSuccess: (data) => {
         setOpenDialog(false)
          showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
            queryClient.invalidateQueries('user-saved-email-templates')
        },
    })
    useEffect(() => {
        formData && reset({name: formData.name, template: formData.template})
    },[formData])

    const onSubmit = (formData: FormInputProps) => {
        mutate({...formData})
    }
  return (
    <div className='mb-20'>
        { formData ? 
          <EditOutlinedIcon onClick={() => {setOpenDialog(true); reset();}} /> 
          : <CustomButton label="Create Template" onClick={() => setOpenDialog(true)} />
        }
    <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2>Create Template</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
            {isLoading && <Loader />}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='d-flex flex-column mb-30'>
              <div className='w-100 mw-500 mb-20'>
                <Controller
                  name="name"
                  control={control}
                  rules={{required: "This field is required"}}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label="Template Name"
                      className='w-100'
                      onChange={onChange}
                      value={value || ""}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </div>
              <div className='w-100 mw-500 mb-20'>
              <Controller
                name="template"
                control={control}
                rules={{ required: "This field is required" }}
                render={({ field: { onChange, value } }) => (
                  <CustomRichTextEditor 
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
              </div>
            </div>
          <div className='d-flex justify-center'>
            <CustomButton type='submit' className='primary_btns mr-25' label="Save" />
            <CustomButton className='secondary_btns' onClick={() => setOpenDialog(false)} label="cancel" />
          </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
  )
}

export default CreateEmailTemplate;
