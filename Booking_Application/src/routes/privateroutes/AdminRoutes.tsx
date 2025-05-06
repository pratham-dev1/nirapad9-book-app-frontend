import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { AuthContext } from "../../context/auth/AuthContext";
import { useContext, lazy, Suspense } from "react";
import Loader from "../../components/Loader";

const AdminDashboard = lazy(() => import("../../pages/admin/AdminDashboard"));
const CreateNewPassword = lazy(() => import("../../pages/CreateNewPassword"));
const AdminUser = lazy(() => import("../../pages/admin/AdminUser"));
const Settings = lazy(() => import("../../pages/Settings"));
const Error = lazy(() => import("../../pages/Error"));
const ResetPasswordForSecurity = lazy(() => import("../../pages/ResetPasswordForSecurity"));
const VerifyAccount = lazy(() => import("../../pages/VerifyAccount"));
const PaymentSuccess = lazy(() => import("../../pages/PaymentSuccess"));
const Analytics = lazy(() => import("../../pages/Analytics"));
const AdminConfig = lazy(() => import("../../pages/admin/AdminConfig"));
const PlansInfo = lazy(() => import("../../pages/PlansInfo"));

const AdminRoutes: React.FC = () => {
  const { state } = useContext(AuthContext);
  const element = createBrowserRouter([
    {
      path: "",
      element: state.isPasswordUpdated ? <Layout /> : <Navigate to="/create-new-password"/>,
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" />,
        },
        {
          path: "/dashboard",
          element: <AdminDashboard />,
        },
        {
          path: "/user",
          element: <AdminUser />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
        {
          path: "/analytics",
          element: <Analytics />,
        },
        {
          path: "/admin-config",
          element: <AdminConfig />,
        },
        {
          path: "/plans-and-pricing",
          element: <PlansInfo />,
        },
      ],
    },
    {
      path: "/create-new-password",
      element: state.isPasswordUpdated ? <Navigate to="/dashboard" /> :  <CreateNewPassword/>
    },
    {
      path: '/reset-password-for-security/:userId/:key',
      element: <ResetPasswordForSecurity />
    },
    // {
    //   path: "/payment-page",
    //   // element: <PaymentPage />,
    //   element: <StripeSubscription />
    // },
    {
      path: "/payment-success",
      element: <PaymentSuccess />,
    },
    // {
    //   path: "/save-card-details",
    //   element: <SaveCardDetails />,
    // },
    {
      path: '/error',
      element: <Error />
    },
    {
      path: "/verify-account/:userId/:key",
      element: <VerifyAccount />,
    },
    {
      path: "*",
      element: <Navigate to="/dashboard"/>,
    },
  ]);

  return <Suspense fallback={<Loader />}>
          <RouterProvider router={element} />
         </Suspense>
};

export default AdminRoutes;
