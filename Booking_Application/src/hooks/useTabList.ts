import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import request from '../services/http'
import { GET_TABS } from '../constants/Urls'
import { AuthContext } from '../context/auth/AuthContext'

export const useTabList = () => {
    const {state} = useContext(AuthContext)
    return useQuery(['get-tabs', state.userType], () => request(`${GET_TABS}/${state.userType}`))
}