import { Dialog, DialogActions, DialogContent } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

type Props = {
  [key: string]: any;
};

const ViewUserDetails: React.FC<Props> = ({ userDetails }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  return (
    <>
      <VisibilityOutlinedIcon onClick={() => setOpenDialog(true)} />
      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2>User Details</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        
        <DialogContent>
          <div className="d-flex flex-column justify-center pl-50 pr-50 font-16 mb-50">
            <div className="d-flex items-center">
              <p className="w-40 mb-zero">Username - <b>{userDetails.username}</b></p>
              <p className="w-55 mb-zero">Fullname - <b>{userDetails.fullname}</b></p>
            </div>
            <div className="d-flex items-center">
              <p className="w-40 mb-zero">User Type - <b>{userDetails.usertype.userType}</b></p>
              <p className="w-55 mb-zero">Primary Email - <b>{userDetails.email}</b></p>
            </div>
            <div className="d-flex items-center">
              <p className="w-40 mb-zero">Secondary Email 1 - <b>{userDetails.email2 || 'NA'}</b></p>
              <p className="w-55 mb-zero">Secondary Email 2 - <b>{userDetails.email3 || 'NA'}</b></p>
            </div>
           
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewUserDetails;
