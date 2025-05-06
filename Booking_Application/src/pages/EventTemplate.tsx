import React, { useContext, useEffect } from 'react'
import CustomDataGrid from '../components/CustomDataGrid'
import CreateGroup from './CreateGroup'
import { useMutation, useQuery } from 'react-query'
import request from '../services/http'
import { DELETE_EMAIL_TEMPLATE, DELETE_EVENT_TEMPLATE, DELETE_GROUP, DUPLICATE_PREDEFINED_EVENT, GET_ALL_USER_LIST, GET_EMAIL_TEMPLATES, GET_EVENT_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS } from '../constants/Urls'
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { queryClient } from '../config/RQconfig'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'
import Loader from '../components/Loader'
import CreateEmailTemplate from './CreateEmailTemplate'
import ViewTemplate from '../components/ViewTemplate'
import CustomButton from '../components/CustomButton'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import CreateEventTemplate from './CreateEventTemplate'
import dayjs from 'dayjs'
import { AuthContext } from '../context/auth/AuthContext'
import ListIcon from '../styles/icons/ListIcon'
import GridIcon from '../styles/icons/GridIcon'
import { useState } from "react";
import GridViewEventTemplate from './event-templates/GridViewEventTemplate'
import ListViewEventTemplate from './event-templates/ListViewEventTemplate'
import BackArrowIcon from '../styles/icons/BackArrowIcon'



const EventTemplate = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [view, setView] = useState<any>(location.state?.view || 'grid');
    const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
    const {data, isLoading, isRefetching } = useQuery(['predefined-event-templates'],() => request(GET_EVENT_TEMPLATES, "get"))
    const { mutate: deleteTemplate, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_EVENT_TEMPLATE, "delete", body),
    {
      onSuccess: () => {
        setOpenDeleteDialog(false)
        showToast(ToastActionTypes.SUCCESS, data?.message)
        queryClient.invalidateQueries('predefined-event-templates')
      },
    })
    const { mutate: duplicatePredefinedEvent, isLoading: isDuplicatePredefinedEventLoading } = useMutation((body: object) => request(DUPLICATE_PREDEFINED_EVENT, "post", body),
    {
      onSuccess: () => {
        // setOpenDeleteDialog(false)
        // showToast(ToastActionTypes.SUCCESS, data?.message)
        queryClient.invalidateQueries('predefined-event-templates')
      },
    })
  return (
    <>
        {(isDeleteLoading || isLoading || isDuplicatePredefinedEventLoading) && <Loader />}
        <div className="page-wrapper">
            <div className="d-flex justify-between items-center mb-20">
                <h1>
                  <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(location.state?.from || -1)} ><BackArrowIcon /></span>
                  Predefined Event Templates
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
              <GridViewEventTemplate data={data?.data || []} deleteTemplate={deleteTemplate} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} duplicatePredefinedEvent={duplicatePredefinedEvent}/>
            : 
              <ListViewEventTemplate data={data?.data || []} deleteTemplate={deleteTemplate} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} duplicatePredefinedEvent={duplicatePredefinedEvent} />
            }
        </div>
    </>
  )
}

export default EventTemplate
