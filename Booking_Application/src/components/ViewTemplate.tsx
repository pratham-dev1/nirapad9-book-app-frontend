import { Dialog, DialogContent } from "@mui/material";
import React, { FC, Fragment, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "./CustomButton";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const ViewTemplate: FC<{value: string, icon?: boolean, text?: any, view?: string}> = ({value, icon, text, view}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const getHtml = () => {
    return view === 'list' ? <li onClick={() => setOpenDialog(true)}>{text}</li> : <span className="tmplt_prevw" onClick={() => setOpenDialog(true)}>{text}</span>
  }
  return (
    <>
    {icon ? <VisibilityOutlinedIcon onClick={() => setOpenDialog(true)} />
      : text ? getHtml()
      : <CustomButton label="View Template" onClick={() => setOpenDialog(true)} /> }
      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h1>Template Preview</h1>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        
        <DialogContent>
          <div className="temp_preview_content" dangerouslySetInnerHTML={{__html: value}} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewTemplate;
