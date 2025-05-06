import { Dispatch } from "react";

export interface ThemeState {
    theme?: string | null | undefined;
}

export type ThemeAction = {
    type: string;
    payload?: ThemeState
}

export interface ThemeContextValue {
    state: ThemeState;
    dispatch: Dispatch<ThemeAction>;
}

export enum ThemeActionTypes{
    SET_THEME_CONTEXT = "SET_THEME_CONTEXT"
}