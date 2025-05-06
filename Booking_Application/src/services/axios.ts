import axios from 'axios';
import request from './http';
import { LOGOUT } from '../constants/Urls';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL
const axiosInstance = axios.create({
  baseURL: SERVER_URL, 
  // timeout: 5000, 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});


axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async(error) => {
    let reason = error.response.data.reason 
    if(error.response.status === 403 && (reason === 'Account Deleted' || reason === "Password Changed For Security" ||  reason === "Free Subscription Over" || reason === "Credentials Blocked")) {
      request(LOGOUT,"post", {}).then(()=>{
        setTimeout(()=>{
          window.location.reload()
        },5000)
      })
    }
    else if (error.response.status === 401 && error.response.data.message === 'Authorization token is missing') {
      setTimeout(() =>  window.location.reload(), 3000)
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;