import { Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Controller, useForm } from 'react-hook-form';
import CustomAutocomplete from '../../components/CustomAutocomplete';
import CustomTextField from '../../components/CustomTextField';
import { useMutation, useQuery } from 'react-query';
import request from '../../services/http';
import { CREATE_EMAIL_TEMPLATE, CREATE_GROUP, EDIT_EMAIL_TEMPLATE, EDIT_GROUP, GET_ALL_USER_LIST, GET_GENERAL_TEMPLATES, GET_PREDEFINED_MEETS_TYPES } from '../../constants/Urls';
import { ToastActionTypes } from '../../utils/Enums';
import showToast from '../../utils/toast';
import Loader from '../../components/Loader';
import { queryClient } from '../../config/RQconfig';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomCheckBox from '../../components/CustomCheckbox';
import CloseIcon from "@mui/icons-material/Close";
import CustomRichTextEditor from '../../components/CustomRichTextEditor';
import { useLocation, useNavigate } from "react-router-dom";
import BackArrowIcon from "../../styles/icons/BackArrowIcon";

type FormInputProps = {
    name: string;
    template: string;
    meetType: any;
    selectTemplate: any;
    type: any
} 

const AddEmailTemplate: FC = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const formData = location.state?.data;
    const { data: templatesData } = useQuery('general-templates', () => request(GET_GENERAL_TEMPLATES))
    const { data: meetTypeData } = useQuery('predefined-meet-types', () => request(GET_PREDEFINED_MEETS_TYPES))
    const [templateOptions, setTemplateOptions] = useState<any>();

    const { handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<FormInputProps>();
    const { mutate: mutate, isLoading } = useMutation((body: object) => request(formData ? EDIT_EMAIL_TEMPLATE : CREATE_EMAIL_TEMPLATE, "post", formData ? {...body, templateId: formData.id} : body), {
        onSuccess: (data) => {
          showToast(ToastActionTypes.SUCCESS, data?.message)
            reset()
            queryClient.invalidateQueries('user-saved-email-templates')
            navigate('/email-templates',{state: {view: location.state?.view}})
        },
    })
    useEffect(() => {
        formData && reset({name: formData.name, template: formData.template, type: formData.type, meetType: formData?.predefined_meet_type})
    },[formData])

    const onSubmit = (formData: FormInputProps) => {
        mutate({...formData, meetType: formData?.meetType?.id})
    }
    const meetType = watch('meetType')?.id 
    useEffect(() => {
      if(meetType){
        const filteredOptions = templatesData?.data?.filter((option: any) => option.predefinedMeetTypeId === meetType);
        setTemplateOptions(filteredOptions);
      }else{
        setTemplateOptions(templatesData?.data)
      }
    }, [templatesData,meetType ]); 
  return (
    <div className='page-wrapper top_algn-clr-mode mb-20'>
      {isLoading && <Loader />}
        <div className="d-flex justify-between items-center mb-20">
          <h1 className='mb-zero'>
            <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(-1)}><BackArrowIcon /></span>
            {formData ? 'Edit' : 'Create New' } Template
          </h1>
        </div>
        <div className='card-box'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='d-flex flex-column mb-30'>
              <div className='w-100 mw-800 mb-30'>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: "This field is required",
                    validate: (value) => value.trim() !== "" || "This field is required", 
                  }}
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
              <div className="w-100 mw-800 mb-30">
                  <Controller
                      name="type"
                      control={control}
                      rules={{required: "This field is required"}}
                      render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                          label='Type'
                          options={['create', 'response']}
                          onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                          setTemplateOptions(templatesData?.data)
                          setValue('meetType', null)
                          setValue('selectTemplate', null)
                          setValue('template', '')
                          }}
                          value={value || null}
                          error={!!errors.type}
                          helperText={errors.type?.message as string}
                      />
                      )}
                  />
                </div>
                {watch('type') === 'create' && <div className="w-100 mw-800 mb-30">
                  <Controller
                      name="meetType"
                      control={control}
                      // rules={{required: "This field is required"}}
                      render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                          label='Meeting Type'
                          options={meetTypeData?.data}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          getOptionLabel={(option: any) => option?.value}
                          onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                          if(selectedValue.id !== watch('selectTemplate')?.predefinedMeetTypeId)
                            setValue('selectTemplate', null)
                            setValue('template', '')
                          }}
                          value={value || null}
                          // error={!!errors.meetType}
                          // helperText={errors.meetType?.message as string}
                      />
                      )}
                  />
                </div> }
              <div className="w-100 mw-800 mb-30">
                  <Controller
                      name="selectTemplate"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                          label='Select Template'
                          options={templateOptions || []}
                          groupBy={option => option.group}
                          getOptionLabel={option => option.name}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, selectedValue) => {
                          onChange(selectedValue);
                          setValue('template', (selectedValue?.template || ''))
                          }}
                          value={value || null}
                          // disabled={!meetType}
                      />
                      )}
                  />
                </div>
              <div className='w-100 mw-800 mb-70'>
              <Controller
                name="template"
                control={control}
                rules={{
                  required: "This field is required",
                  validate: (value) => {
                    if(value === "<p><br></p>" || value.split(' ').join('') === "<p></p>") {
                      return "This field is required"
                    }
                    return true
                } 
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomRichTextEditor 
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
              </div>
              <small className='w-100 mw-800 mb-70' style={{color: 'red'}}>{errors.template?.message}</small>
            </div>
            <div className='d-flex justify-center'>
              <CustomButton type='submit' className='primary_btns' label="Save" disabled={isLoading} />
            </div>
          </form>
        </div>
      </div>
  )
}

export default AddEmailTemplate;
