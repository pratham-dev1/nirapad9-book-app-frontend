import axiosInstance from "./axios";

const request = async (url:string, method = 'get', params = {}, options = {}):Promise<any> => {
    const requestOptions = {
      ...options,
      method,
      url,
      ...(method === 'get' ? { params:params } : { data:params }) // data key is for POST request and params key is for GET request 
    };
    try {
      const response = await axiosInstance(requestOptions);
      return response.data;
    } catch (error) {
      // console.log(error)
      return Promise.reject(error)
      // throw error;
    }
  };
  
  export default request;