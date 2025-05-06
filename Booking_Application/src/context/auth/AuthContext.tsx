import React, { createContext, ReactNode, useReducer } from 'react';
import { AuthAction, AuthActionTypes, AuthContextValue, AuthState } from './AuthContextTypes';

const initialState: AuthState = { userId: null, userType:null, isPasswordUpdated: null, userTypeName: null, profilePicture: null, timezone: null, subscription: null, orgId: null, isFreeTrial: null, isPaidPlan: null,mfaEnabled:null,mfaConfigured:null,mfaManditory:null, appAccess: [], isUsernameUpdated: null, isMergeCalendarGuideChecked: null, isFreeTrialOver: null };
export const AuthContext = createContext<AuthContextValue>({ state: initialState, dispatch: () => {} });


const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionTypes.SET_USER_INFO:
      return { userId: action.payload?.userId ,userType: action.payload?.userType, isPasswordUpdated: action.payload?.isPasswordUpdated, userTypeName: action.payload?.userTypeName, profilePicture: action.payload?.profilePicture, timezone: action.payload?.timezone, subscription: action.payload?.subscription, orgId: action.payload?.orgId, isFreeTrial: action.payload?.isFreeTrial, isPaidPlan: action.payload?.isPaidPlan,mfaEnabled:action.payload?.mfaEnabled,mfaConfigured:action.payload?.mfaConfigured,mfaManditory:action.payload?.mfaManditory, appAccess: (action.payload?.appAccess || []), isUsernameUpdated: action.payload?.isUsernameUpdated, isMergeCalendarGuideChecked: action.payload?.isMergeCalendarGuideChecked, isFreeTrialOver: action.payload?.isFreeTrialOver};
   
    case AuthActionTypes.REMOVE_USER_INFO:
      return { ...initialState };
    default:
      return state;
  }
};



const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
