import React, { useContext } from 'react'
import { AuthContext } from '../context/auth/AuthContext'
import { SubscriptionTypes } from '../utils/Enums'

export const useSubscriptions = () => {
    const {state} = useContext(AuthContext)
    return {
        IS_BASIC : state.subscription === SubscriptionTypes.BASIC,
        IS_ADVANCED : state.subscription === SubscriptionTypes.ADVANCED,
        IS_PROFESSIONAL : state.subscription === SubscriptionTypes.PROFESSIONAL,
        IS_ENTERPRISE : state.subscription === SubscriptionTypes.ENTERPRISE,
    }
}