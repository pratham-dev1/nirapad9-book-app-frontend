import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../context/auth/AuthContext";
import { useContext } from "react";
import request from "../services/http";
import { GET_BOOKING_APPLICATION_TABS, LOGOUT, UPDATE_USER_TAB_ACTIVITY } from "../constants/Urls";

interface UseUserTabActivityReturnType {
  triggerUpdateUserTabActivity: (tabId: string) => void;
}

export const useUserTabActivity = (): UseUserTabActivityReturnType => {
  const { state } = useContext(AuthContext);

  const { mutate: userTabActivityMutation }: any = useMutation((body: object) =>
        request(UPDATE_USER_TAB_ACTIVITY, "post", body), {
          onError: () => {}
        }
  );

  const {data: bookingApplicationTabs} = useQuery(['booking-application-tabs'], () => request(GET_BOOKING_APPLICATION_TABS))


  const getTabId=(tabName:string)=>
    bookingApplicationTabs?.data.find((eachTab:any)=>eachTab.tabName.toLowerCase()===tabName.toLowerCase())
  
  const triggerUpdateUserTabActivity = (tabName: string) => {

    const tab=getTabId(tabName)


    if(!tab) return 

    const body = {
      userId: state?.userId,
      tabId:tab.id,
      startTime: new Date().toISOString(),
    };
    userTabActivityMutation(body);
  };

  return { triggerUpdateUserTabActivity };
};
