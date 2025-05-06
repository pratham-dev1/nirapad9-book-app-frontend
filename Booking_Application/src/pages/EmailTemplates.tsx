import React from 'react'
import CustomDataGrid from '../components/CustomDataGrid'
import CreateGroup from './CreateGroup'
import { useMutation, useQuery } from 'react-query'
import request from '../services/http'
import { DELETE_EMAIL_TEMPLATE, DELETE_GROUP, DUPLICATE_PREDEFINED_EMAIL_TEMPLATE, GET_ALL_USER_LIST, GET_EMAIL_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS } from '../constants/Urls'
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { queryClient } from '../config/RQconfig'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'
import Loader from '../components/Loader'
import CreateEmailTemplate from './CreateEmailTemplate'
import ViewTemplate from '../components/ViewTemplate'
import CustomButton from '../components/CustomButton'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from "react";
import AddIcon from '../styles/icons/AddIcon'
import GridViewTemplate from './email-template/GridViewTemplate'
import ListViewTemplate from './email-template/ListViewTemplate'
import ListIcon from '../styles/icons/ListIcon'
import GridIcon from '../styles/icons/GridIcon'
import BackArrowIcon from '../styles/icons/BackArrowIcon'

const EmailTemplates = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);

    const {data, isLoading, isRefetching } = useQuery(['user-saved-email-templates'],() => request(GET_EMAIL_TEMPLATES, "get"))
    const { mutate: deleteTemplate, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_EMAIL_TEMPLATE, "delete", body),
    {
      onSuccess: () => {
        setOpenDeleteDialog(false)
        showToast(ToastActionTypes.SUCCESS, data?.message)
        queryClient.invalidateQueries('user-saved-email-templates')
      },
    })

      const [view, setView] = useState<any>(location.state?.view || 'grid');

      const { mutate: duplicatePredefinedEmailTemplate, isLoading: isDuplicatePredefinedEmailTemplateLoading } = useMutation((body: object) => request(DUPLICATE_PREDEFINED_EMAIL_TEMPLATE, "post", body),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('user-saved-email-templates')
        },
      })

  return (
    <>
        {(isDeleteLoading || isLoading || isDuplicatePredefinedEmailTemplateLoading) && <Loader />}
        <div className="page-wrapper">
            <div className="d-flex justify-between items-center mb-20">
              <h1>
                <span className='back-to mr-10 cursur-pointer' onClick={() => navigate('/settings')} ><BackArrowIcon /></span>
                Template Creation
              </h1>
              <div className="view-toggle">
                <span 
                  className={view === 'grid' ? 'active-view' : ''} 
                  onClick={() => setView('grid')}
                >
                  <GridIcon /> Grid
                </span>
                <span 
                  className={view === 'list' ? 'active-view' : ''} 
                  onClick={() => setView('list')}
                >
                  <ListIcon /> List
                </span>
              </div>
              
            </div>

            {view === 'grid' ?
              <GridViewTemplate data={data?.data || []} deleteTemplate={deleteTemplate} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} duplicatePredefinedEmailTemplate={duplicatePredefinedEmailTemplate} />
            : 
              <ListViewTemplate data={data?.data || []} deleteTemplate={deleteTemplate} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} duplicatePredefinedEmailTemplate={duplicatePredefinedEmailTemplate} />
            }
        </div>
    </>
  )
}

export default EmailTemplates
