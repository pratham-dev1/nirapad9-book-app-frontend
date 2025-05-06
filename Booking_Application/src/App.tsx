import "./App.css";
import PublicRoutes from "./routes/publicroutes/PublicRoutes";
import { useQuery } from 'react-query';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "./context/auth/AuthContext";
import { useContext, useEffect, useState } from "react";
import { GET_SESSION } from "./constants/Urls";
import request from "./services/http";
import TalentPartnerRoutes from "./routes/privateroutes/TalentPartnerRoutes";
import RecruiterRoutes from "./routes/privateroutes/RecruiterRoutes";
import AdminRoutes from "./routes/privateroutes/AdminRoutes";
import { AuthActionTypes } from "./context/auth/AuthContextTypes";
import GeneralUserRoutes from "./routes/privateroutes/GeneralUserRoutes";
import { socket } from "./utils/Socket";
import IdleTimeout from "./components/IdleTimeOut";
import { ThemeActionTypes } from "./context/theme/ThemeContextTypes";
import { ThemeContext } from "./context/theme/ThemeContext";
import Loader from "./components/Loader";
import showToast from "./utils/toast";
import { ToastActionTypes } from "./utils/Enums";
import HomePageVerifyMFA from "./pages/MultiFactorAuthentication/HomePageVerifyMFA";
import ProductOwnerRoutes from "./routes/privateroutes/ProductOwnerRoutes";
import UpdateUsername from "./components/UpdateUsername";

const App: React.FC = () => {
  const isAuthenticated = document.cookie.split('; ').find((cookie) => cookie.startsWith('isAuthenticated'))?.split('=')[1];
  const isMFAAuthenticated = document.cookie.split('; ').find((cookie) => cookie.startsWith('isMFAAuthenticated'))?.split('=')[1];
  const isMFASkippedCookie = document.cookie.split('; ').find((cookie) => cookie.startsWith('isMFASkipped'))?.split('=')[1];
  const { state, dispatch } = useContext(AuthContext);
  const { dispatch: dispatchTheme } = useContext(ThemeContext);
  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(!!isMFAAuthenticated); 
  const [isMfaSkipped, setIsMfaSkipped] = useState<boolean>(!!isMFASkippedCookie); 

  const ProtectedRoutes = () => {
    if (state.userType === 1) return <TalentPartnerRoutes />;
    else if (state.userType === 2) return <RecruiterRoutes />;
    else if (state.userType === 3) return <AdminRoutes />;
    else if (state.userType === 4) return <GeneralUserRoutes />;
    else if (state.userType === 5) return <ProductOwnerRoutes />;
    else return <PublicRoutes />;
  };

  const { isLoading } = useQuery('get-session', () => request(GET_SESSION), {
    enabled: !!isAuthenticated,
    onError: () => null,
    onSuccess: (data) => {
      dispatch({
        type: AuthActionTypes.SET_USER_INFO,
        payload: {
          userId: data?.userId,
          userType: data?.userType,
          isPasswordUpdated: data?.isPasswordUpdated,
          userTypeName: data?.userTypeName,
          profilePicture: data?.profilePicture,
          timezone: data?.timezone,
          subscription: data?.subscription,
          orgId: data?.orgId,
          isFreeTrial: data?.isFreeTrial,
          isPaidPlan: data?.isPaidPlan,
          mfaEnabled: data?.mfaEnabled,
          mfaConfigured:data?.mfaConfigured,
          mfaManditory:data?.mfaManditory,
          appAccess: data?.appAccess,
          isUsernameUpdated: data?.isUsernameUpdated,
          isMergeCalendarGuideChecked: data?.isMergeCalendarGuideChecked,
          isFreeTrialOver: data?.isFreeTrialOver
        },
      });
      dispatchTheme({
        type: ThemeActionTypes.SET_THEME_CONTEXT,
        payload: { theme: data?.theme },
      });
    },
    retry: 0,
  });
  const isBookingPage =  window.location.pathname.includes('/book-your-appointment')
  useEffect(() => {
    if (state.userId && !isBookingPage) {
      socket.connect(); // Connect manually
      function onConnect() {
        console.log('connected to socket.io');
        socket.emit('INITIALIZE_SOCKET', state.userId);
      }
      socket.on('connect', onConnect);
      return () => {
        socket.off('connect', onConnect);
      };
    }
  }, [state]);

  if (isLoading) {
    return <Loader />;
  }

  // Render logic based on authentication and MFA verification
  if (!isAuthenticated || !state.userType) {
    return <PublicRoutes />; // Render public routes (e.g., login)
  }

  const onSuccessSkipMFA=()=>{
    setIsMfaSkipped(true)
  }


  if (state.mfaEnabled) {
    if (isMFAAuthenticated) {
      // Do nothing, user is already authenticated with MFA
    } else {
      // If MFA is not authenticated, check if MFA is skipped
      if (!isMfaSkipped) {
        // If MFA is not skipped, show the HomePageVerifyMFA component
        if (!state.userId) {
          showToast(ToastActionTypes.ERROR, "User not found");
          return;
        }
        return <HomePageVerifyMFA userId={state.userId} onSuccessVerifiedMFA={() => setIsMfaVerified(true)} mfaConfigured={!!state.mfaConfigured} mfaManditory={!!state.mfaManditory} onSuccessSkipMFA={onSuccessSkipMFA} />;
      } else if (isMfaSkipped && !state.mfaManditory) {
        // If MFA is skipped and not mandatory, do nothing (continue to protected routes)
      } else if (isMfaSkipped && state.mfaManditory) {
        // If MFA is skipped but mandatory, show the HomePageVerifyMFA component
        if (!state.userId) {
          showToast(ToastActionTypes.ERROR, "User not found");
          return;
        }
        return <HomePageVerifyMFA userId={state.userId} onSuccessVerifiedMFA={() => setIsMfaVerified(true)} mfaConfigured={!!state.mfaConfigured} mfaManditory={!!state.mfaManditory} onSuccessSkipMFA={onSuccessSkipMFA} />;
      }
    }
  }

  // Render protected routes based on userType
  return (
    <>
      {ProtectedRoutes()}
      <IdleTimeout />
      <UpdateUsername />
    </>
  );
};

export default App;
