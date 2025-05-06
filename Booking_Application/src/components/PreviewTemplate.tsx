import { Dialog, DialogContent } from "@mui/material";
import React, { FC, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const PreviewTemplate: FC<{value: string}> = ({value}) => {
  const [openDialog, setOpenDialog] = useState(true);
  return (
    <>
      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2>Preview</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        <DialogContent>
          <div dangerouslySetInnerHTML={{__html: value}} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreviewTemplate;
