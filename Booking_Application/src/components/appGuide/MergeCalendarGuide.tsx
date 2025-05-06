import { Dialog, DialogContent } from '@mui/material'
import React, { useContext, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useMutation } from 'react-query';
import request from '../../services/http';
import { UPDATE_APP_GUIDE } from '../../constants/Urls';
import { AuthContext } from '../../context/auth/AuthContext';
import { AuthActionTypes } from '../../context/auth/AuthContextTypes';

const MergeCalendarGuide = () => {
    const theme = useTheme();
    const {dispatch, state} = useContext(AuthContext)
    const [open, setOpen] = useState(true)

    const { mutate} = useMutation((body: object) => request(UPDATE_APP_GUIDE, "post", body),
        {
          onSuccess: (data) => {
            dispatch({type: AuthActionTypes.SET_USER_INFO, payload: {...state, isMergeCalendarGuideChecked: true}})
          },
        })

    const handleClose = () => {
        setOpen(false)
        mutate({isMergeCalendarGuideChecked: true})
    }

    return (
        <Dialog
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <div className='popup-header'>
                <h2>Merge Calendar Guide</h2>
                <CloseIcon onClick={handleClose} />
            </div>

            <DialogContent>
            <video width="100%" controls autoPlay muted>
            <source src="/MergeCalendarGuide.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
            </DialogContent>
        </Dialog>
    )
}
export default MergeCalendarGuide