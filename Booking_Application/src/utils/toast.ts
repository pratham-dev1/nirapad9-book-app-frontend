import { toast } from "react-toastify";


const showToast = (type: string, message:string, options = {}) => {
    switch (type) {
      case 'success':
        toast.success(message, options)
        break;
  
      case 'warning':
        toast.warning(message, options)
        break;
  
      case 'error':
        toast.error(message, options)
        break;
  
      case 'info':
        toast.info(message, options)
        break;
  
      default:
        toast.info('Toast Action not recognized', options)
    }
  }

export default showToast
  