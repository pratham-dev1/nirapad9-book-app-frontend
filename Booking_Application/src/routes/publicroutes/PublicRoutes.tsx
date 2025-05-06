import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../../components/Loader";

// Lazy-loaded components
const Home = lazy(() => import("../../pages/Home"));
const Login = lazy(() => import("../../pages/Login"));
const ForgotPassword = lazy(() => import("../../pages/ForgotPassword"));
const VerifyAccount = lazy(() => import("../../pages/VerifyAccount"));
const Signup = lazy(() => import("../../pages/Signup"));
const Resume = lazy(() => import("../../pages/Resume"));
const AvailableSlots = lazy(() => import("../../pages/AvailableSlots"));
const Error = lazy(() => import("../../pages/Error"));
const ResetPasswordForSecurity = lazy(() => import("../../pages/ResetPasswordForSecurity"));


const PublicRoutes: React.FC = () => {
  const element = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/verify-account/:userId/:key",
      element: <VerifyAccount />,
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: '/resume',
      element: <Resume />
    },
    {
      path: '/book-your-appointment/:tagName/:userId/:tagId/:tagTypeId/:slotId?',
      element: <AvailableSlots />
    },
    {
      path: '/reset-password-for-security/:userId/:key',
      element: <ResetPasswordForSecurity />
    },
    {
      path: '/error',
      element: <Error />
    },
    {
      path: "*",
      element: <Navigate to="/login" />,
    },
  ]);

  return <Suspense fallback={<Loader />}>
          <RouterProvider router={element} />
        </Suspense>
};

export default PublicRoutes;
