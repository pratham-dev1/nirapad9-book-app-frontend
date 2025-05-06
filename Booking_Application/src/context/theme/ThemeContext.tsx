import React, { createContext, ReactNode, useReducer } from 'react';
import { ThemeAction, ThemeActionTypes, ThemeContextValue, ThemeState } from './ThemeContextTypes';

const initialState: ThemeState = { theme: null };
export const ThemeContext = createContext<ThemeContextValue>({ state: initialState, dispatch: () => {} });


const reducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case ThemeActionTypes.SET_THEME_CONTEXT:
      return {...state, theme: action.payload?.theme}
    default:
      return state;
  }
};


const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
