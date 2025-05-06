import { QueryClient } from "react-query";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      onError: (error: any) =>
        showToast(ToastActionTypes.ERROR, error.response.data.message),
    },
    mutations: {
      onError: (error: any) =>
        showToast(ToastActionTypes.ERROR, error.response.data.message),
      onSuccess: (data: any) => showToast(ToastActionTypes.SUCCESS, data.message)
    },
  },
});
