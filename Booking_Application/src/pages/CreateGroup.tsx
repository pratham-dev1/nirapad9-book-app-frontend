import { Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import CustomButton from '../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../components/CustomAutocomplete';
import CustomTextField from '../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import request from '../services/http';
import { CREATE_GROUP, EDIT_GROUP, GET_ALL_USER_LIST } from '../constants/Urls';
import { ToastActionTypes } from '../utils/Enums';
import showToast from '../utils/toast';
import Loader from '../components/Loader';
import { queryClient } from '../config/RQconfig';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomCheckBox from '../components/CustomCheckbox';
import CloseIcon from "@mui/icons-material/Close";

type FormInputProps = {
    name: string;
    members: any[];
    addMe: boolean;
} 

const CreateGroup: FC<{formData?: any}> = ({formData}) => {
    const [openDialog, setOpenDialog] = useState(false)
    const {data} = useQuery(['all-user-list'],() => request(GET_ALL_USER_LIST, "get"))
    const { handleSubmit, control, formState: { errors }, reset } = useForm<FormInputProps>();
    const { mutate: mutateGroup, isLoading } = useMutation((body: object) => request(formData ? EDIT_GROUP : CREATE_GROUP, "post", formData ? {...body, id: formData.id} : body), {
        onSuccess: (data) => {
         setOpenDialog(false)
          showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
            queryClient.invalidateQueries('group-list')
        },
    })
    useEffect(() => {
        formData && reset({name: formData.name, members: formData.groupMembers})
    },[formData])
    const onSubmit = (formData: FormInputProps) => {
        mutateGroup({...formData, members: formData.members.map((i) => i.id)})
    }
  return (
    <>
        { formData ? 
          <EditOutlinedIcon onClick={() => setOpenDialog(true)} /> 
          : <CustomButton label="Create Group" onClick={() => setOpenDialog(true)} />
        }
    <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2>Create Group</h2>
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
                      label="Group name"
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
                  name="members"
                  rules={{ required: "This field is required" }}
                  control={control}
                  render={({ field: { onChange,value = [] } }) => (
                    <CustomAutocomplete
                      options={data?.data || []}
                      getOptionLabel={(option) => `${option.id} - ${option.fullname}`}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      multiple
                      onChange={(e,v) => onChange(v)}
                      value = {value || []}
                      label="Add members"
                      limitTags={3}
                      error={!!errors.members}
                      helperText={errors.members?.message}
                    />
                  )}
                />
              </div>
              <div className='w-100 mw-500 mb-20'>
                <div className='w-100'>
                  <Controller
                    name="addMe"
                    control={control}
                    render={({ field: { onChange,value = [] } }) => (
                      <CustomCheckBox
                      label="Add me in group"
                      onChange={onChange}
                      labelPlacement='end'
                    />
                    )}
                  /> 
                </div>
              </div>
            </div>
          <div className='d-flex justify-center'>
            <CustomButton type='submit' className='primary_btns mr-25' label="Save" />
            <CustomButton className='secondary_btns' onClick={() => setOpenDialog(false)} label="cancel" />
          </div>
          </form>
        </DialogContent>
      </Dialog>
      </>
  )
}

export default CreateGroup
