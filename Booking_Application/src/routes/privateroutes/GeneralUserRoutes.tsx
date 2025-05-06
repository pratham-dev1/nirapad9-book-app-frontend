import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import Layout from "../../components/layout/Layout";
import { AuthContext } from "../../context/auth/AuthContext";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import { Applications } from "../../utils/Enums";
import Loader from "../../components/Loader";

const CreateNewPassword = lazy(() => import("../../pages/CreateNewPassword"));
const GeneralUserDashboard = lazy(() => import("../../pages/generaluser/GeneralUserDashboard"));
const Settings = lazy(() => import("../../pages/Settings"));
const Error = lazy(() => import("../../pages/Error"));
const AvailableSlots = lazy(() => import("../../pages/AvailableSlots"));
const GeneralUserPage = lazy(() => import("../../pages/generaluser/GeneralUserPage"));
const ResetPasswordForSecurity = lazy(() => import("../../pages/ResetPasswordForSecurity"));
const VerifyAccount = lazy(() => import("../../pages/VerifyAccount"));
const PaymentPlans = lazy(() => import("../../pages/PaymentPlans"));
const EventDetails = lazy(() => import("../../pages/EventDetails"));
const AddNewTag = lazy(() => import("../../pages/AddNewTag"));
const GroupCreation = lazy(() => import("../../pages/GroupCreation"));
const PaymentSuccess = lazy(() => import("../../pages/PaymentSuccess"));
const EmailTemplates = lazy(() => import("../../pages/EmailTemplates"));
const Analytics = lazy(() => import("../../pages/Analytics"));
const EventTemplate = lazy(() => import("../../pages/EventTemplate"));
const AddEmailTemplate = lazy(() => import("../../pages/email-template/AddEmailTemplate"));
const AddEventTemplate = lazy(() => import("../../pages/event-templates/AddEventTemplate"));
const AddGroup = lazy(() => import("../../pages/group-creation/AddGroup"));
const PlansInfo = lazy(() => import("../../pages/PlansInfo"));
const PredefinedMeetList = lazy(() => import("../../pages/predefined-meeting-config/PredefinedMeetList"));
const AddPredefinedMeet = lazy(() => import("../../pages/predefined-meeting-config/AddPredefinedMeet"));
const CreateTagView = lazy(() => import("../../pages/CreateTag"));
const CreateEventsBuffer = lazy(() => import("../../pages/CreateEventsBuffer"));
const D3Analytics = lazy(() => import("../../pages/D3Analytics"));
const ContactList = lazy(() => import("../../pages/ContactList"));
const AllNotifications = lazy(() => import("../../pages/AllNotification"));
const Faq = lazy(() => import("../../pages/Faq"));
const SampleQuestionList = lazy(() => import("../../pages/SampleQuestionList"));
const AddQuestion = lazy(() => import("../../pages/AddQuestion"));
const CreateEmailSignature = lazy(() => import("../../pages/CreateEmailSignature"));
const Community = lazy(() => import("../../pages/community/Community"));
const PostThread = lazy(() => import("../../pages/community/PostThread"));
const ViewGroup = lazy(() => import("../../pages/group-creation/ViewGroup"));
const Billing = lazy(() => import("../../pages/payment/Billing"));
const SearchDashboard = lazy(() => import("../../pages/SearchDashboard"));
const APIKeyManagement = lazy(() => import("../../pages/APIKeyManagement/APIKeyManagement"));
const EmailSupport = lazy(() => import("../../pages/EmailSupport"));
const BlockedEmailForBookingSlot = lazy(() => import("../../pages/BlockedEmailForBookingSlot"));
const AllOpenAvailabilities = lazy(() => import("../../pages/AllOpenAvailabilities"));

const GeneralUserRoutes: React.FC = () => {
  const { state } = useContext(AuthContext);
  const {IS_BASIC} = useSubscriptions()
  const hasSlotBroadcastAppAccess = state.appAccess?.includes(Applications.SLOT_BROADCAST)
  const hasEventHubAppAccess = state.appAccess?.includes(Applications.EVENT_HUB)
  const getElement = () => {
    if (state.isPasswordUpdated) {
      if(state.isFreeTrial || state.isPaidPlan) {
        return <Layout />
      }
      else {
      return <Navigate to="/billings-and-pricing"/>
      }
    }
    else {
    return <Navigate to="/create-new-password"/>
    }
  }
  const element = createBrowserRouter([
    {
      path: "",
      element: getElement(),
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" />,
        },
        {
          path: "/dashboard",
          element: <GeneralUserDashboard />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
        {
          path: "/user",
          element: <GeneralUserPage />,
        },
        {
          path: "/analytics",
          element: <Analytics />,
        },
        {
          path: "/event-details",
          element: <EventDetails />,
        },
        {
          path: "/add-new-tag",
          element: hasSlotBroadcastAppAccess ? <AddNewTag /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/create-tag",
          element: hasSlotBroadcastAppAccess ? <CreateTagView /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/group-creation",
          element: hasEventHubAppAccess ? (IS_BASIC ? <Navigate to="/plans-and-pricing" /> : <GroupCreation />) : <Navigate to="/dashboard" />,
        },
        {
          path: "/email-templates",
          element: <EmailTemplates />,
        },
        {
          path: "/event-templates",
          element: hasEventHubAppAccess ? <EventTemplate /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/add-email-templates",
          element: <AddEmailTemplate />,
        },
        {
          path: "/add-event-templates",
          element: hasEventHubAppAccess ? <AddEventTemplate /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/create-event-buffers",
          element: hasEventHubAppAccess ? <CreateEventsBuffer /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/add-group",
          element: hasEventHubAppAccess ? (IS_BASIC ? <Navigate to="/plans-and-pricing" /> : <AddGroup />) : <Navigate to="/dashboard" />,
        },
        {
          path: "/plans-and-pricing",
          element: <PlansInfo />,
        },
        {
          path: "/predefined-meeting-list",
          element: hasEventHubAppAccess ? <PredefinedMeetList /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/add-predefined-meeting",
          element: hasEventHubAppAccess ? <AddPredefinedMeet /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/d3-analytics",
          element: <D3Analytics />,
        },
        {
          path: "/contact-list",
          element: <ContactList />,
        },
        {
          path: "/all-notifications",
          element: <AllNotifications />,
        },
        {
          path: "/search-dashboard/:searchId",
          element:<SearchDashboard  />,
        },
        {
          path: "/faq",
          element: <Faq />,
        },
        {
          path: "/sample-questions",
          element: hasSlotBroadcastAppAccess ? <SampleQuestionList /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/add-questions",
          element: hasSlotBroadcastAppAccess ? <AddQuestion /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/create-email-signature",
          element: <CreateEmailSignature />,
        },
        {
          path: "/api-key-management",
          element: <APIKeyManagement />,
        },
        {
          path: "/community",
          element: <Community />,
        },
        {
          path: "/post-thread",
          element: <PostThread />,
        },
        {
          path: "/edit-group",
          element: hasEventHubAppAccess ? (IS_BASIC ? <Navigate to="/plans-and-pricing" /> : <AddGroup />) : <Navigate to="/dashboard" />,
        },
        {
          path: "/edit-tag",
          element: hasSlotBroadcastAppAccess ? <CreateTagView /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/edit-event-templates",
          element: hasEventHubAppAccess ? <AddEventTemplate /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/edit-email-templates",
          element: <AddEmailTemplate />,
        },
        {
          path: "/edit-predefined-meeting",
          element: hasEventHubAppAccess ? <AddPredefinedMeet /> : <Navigate to="/dashboard" />
        },
        {
          path: "/predefined-meeting-details",
          element: hasEventHubAppAccess ? <AddPredefinedMeet /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/edit-questions",
          element: hasSlotBroadcastAppAccess ? <AddQuestion /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/view-group",
          element: <ViewGroup />,
        },
        {
          path: "/billing-step",
          element: <Billing />,
        },
        {
          path: "/email-support",
          element: <EmailSupport />,
        },
        {
          path: "/blocked-email-for-booking-slot",
          element: hasSlotBroadcastAppAccess ? <BlockedEmailForBookingSlot /> : <Navigate to="/dashboard" />,
        },
        {
          path: "/all-slots",
          element: hasSlotBroadcastAppAccess ? <AllOpenAvailabilities /> : <Navigate to="/dashboard" />,
        }
      ],
    },
    {
      path: "/create-new-password",
      element: state.isPasswordUpdated ? <Navigate to="/dashboard" /> :  <CreateNewPassword/>
  },
  {
    path: "/billings-and-pricing",
    element: <PlansInfo />,          // make another route for same component as we have to show this page sometimes without layout
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
    path: '/payment-plan',
    element: <PaymentPlans />
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
      element: <Navigate to="/dashboard" />,
    },
  ]);

  return <Suspense fallback={<Loader />}>
      <RouterProvider router={element} />
    </Suspense>
};

export default GeneralUserRoutes;
