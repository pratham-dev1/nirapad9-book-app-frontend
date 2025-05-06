import React, { SetStateAction, useState } from 'react'
import CustomTextField from '../components/CustomTextField'
import CustomButton from '../components/CustomButton'
import { useMutation } from 'react-query'
import request from '../services/http'
import { RESEND_VERIFICATION_LINK } from '../constants/Urls'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@mui/material'
import CloseIcon from "@mui/icons-material/Close";


const ResendVerificationLink: React.FC<{ userId: number, setUserId: SetStateAction<any> }> = ({ userId, setUserId }) => {
    const [openDialog, setOpenDialog] = useState<boolean>(true);

    const { mutate: handleResendVerificationLink } = useMutation((body: object) => request(RESEND_VERIFICATION_LINK, "post", body), {
        onSuccess: (data) => {
            if (data.success) {
                setOpenDialog(false)
                setUserId(null)
                showToast(ToastActionTypes.SUCCESS, data.message)
            }
        }
    });

    const handleClose = () => {
        setOpenDialog(false)
        setUserId(null)
    }

    return (
        <div>
            <Dialog
                open={openDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className='popup-header'>
                    <h2> Verify Your Account </h2>
                    <CloseIcon onClick={handleClose} />
                </div>
                <DialogContent>
                    
                    <div className='mb-70 pl-20 pr-20'>
                        
                        <p className='font-bold'>Hi User's Name!</p>
                        <p className='font-bold  mb-30'>Welcome to [Your SaaS Application Name]! You are one step away from activating your account. Please check your email <strong>[User’s Email]</strong> for a verification link. </p>
                        <p><strong>Didn’t receive it? </strong></p>
                        <ul className='font-bold mb-30'>
                            <li>Check your spam/junk folder.</li>
                            <li>
                                <span className='text-underline cursur-pointer' onClick={() => handleResendVerificationLink({ userId })}>
                                    Resend Email
                                </span>
                            </li>
                        </ul>
                        <p className='font-bold'>Need help? Contact [Support Email].</p>
                        <p className='font-bold'>Thank you for joining us! [Support Email].</p>
                        <p className='font-bold'>[Your SaaS Application Name]</p>
                    </div>
                    
                </DialogContent>
            </Dialog>
        </div>

    )
}

export default ResendVerificationLink
