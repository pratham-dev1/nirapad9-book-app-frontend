import { Dispatch } from "react";

export interface AuthState {
    // accessToken: string | null;
    userId?: string | null | undefined;
    userType?: number | null | undefined;
    isPasswordUpdated?: boolean | null | undefined;
    userTypeName?: string | null | undefined;
    profilePicture?: string | null | undefined;
    timezone?: {
        id: number;
        timezone: string;
        value: string;
        abbreviation: string;
    } | null | undefined;
    subscription: number | null | undefined;
    orgId: number | null | undefined;
    isFreeTrial: boolean | null | undefined;
    isPaidPlan: boolean | null | undefined;
    mfaEnabled:boolean | null | undefined;
    mfaConfigured:boolean | null | undefined;
    mfaManditory:boolean | null | undefined;
    appAccess: string[];
    isUsernameUpdated: boolean | null | undefined;
    isMergeCalendarGuideChecked: boolean | null | undefined
    isFreeTrialOver: boolean | null | undefined
}

export type AuthAction = {
    type: string;
    payload?: AuthState
}

export interface AuthContextValue {
    state: AuthState;
    dispatch: Dispatch<AuthAction>;
}

export enum AuthActionTypes{
    SET_USER_INFO = "SET_USER_INFO",
    REMOVE_USER_INFO = "REMOVE_USER_INFO",
}