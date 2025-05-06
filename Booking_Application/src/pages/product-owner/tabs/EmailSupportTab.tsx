import React, { useState } from 'react'
import { useQuery } from 'react-query'
import request from '../../../services/http'
import { GET_EMAIL_SUPPORT_HISTORY } from '../../../constants/Urls'
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import { Dialog, DialogContent } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

const EmailSupport = () => {
  const { data } = useQuery('email-support-history', () => request(GET_EMAIL_SUPPORT_HISTORY))
  const [openDialog, setOpenDialog] = useState(false)
  const [currentItem, setCurrentItem] = useState<any>()
  return (
    <div className="w-100 d-flex flex-row list-view-template all-qus-list">
      <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
      <div className="w-100 d-flex tmplt_list_item items-center">
      <div className="tmplt_nme"><span>UserId</span></div>
      <div className="tmplt_nme"><span>Full Name</span></div>
      <div className="tmplt_nme"><span>Category</span></div>
      <div className="tmplt_nme"><span>Comment</span></div>
      <div className="tmplt_nme"><span>Action</span></div> 
      </div>
        {data?.data?.map((item: any, index: number) => {
          return <div className="w-100 d-flex tmplt_list_item items-center" key={index}>
            <div className="tmplt_nme">
              <span>{item?.user?.id}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.user?.fullname}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.category?.name}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.text}</span>
            </div>
            <div className="tmplt_nme">
              <ViewIcon onClick={() => {setOpenDialog(true); setCurrentItem(item)}} />
            </div>
          </div>
        })}
      </div>
      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2><span className="pl-10">View</span></h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
          UserId: <span><b>{currentItem?.user?.id}</b></span> <br />
          Full name: <span><b>{currentItem?.user?.fullname}</b></span> <br />
          Category: <span><b>{currentItem?.category?.name}</b></span> <br /> <br />
          Comment: <span><b>{currentItem?.text}</b></span>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmailSupport;