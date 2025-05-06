import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material/styles";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { QueryClientProvider } from 'react-query'
import { queryClient } from "./config/RQconfig"
import { ToastContainer } from "react-toastify";
import AuthProvider from "./context/auth/AuthContext";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventsProvider from "./context/event/EventsContext.tsx";
import ThemeProvider from "./context/theme/ThemeContext.tsx";
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advancedFormat);

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    // <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <EventsProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </EventsProvider>
          </AuthProvider>
          <ToastContainer position="top-center" theme="colored" autoClose={3000} closeOnClick />
        </QueryClientProvider>
      </StyledEngineProvider>
    // </BrowserRouter>
  // </React.StrictMode>
);
