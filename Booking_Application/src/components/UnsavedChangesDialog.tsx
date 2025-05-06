import { useState, useEffect } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";

interface UnsavedChangesDialogProps {
  when: boolean;
}

export const UnsavedChangesDialog = ({ when }: UnsavedChangesDialogProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  // Block navigation when the condition is true
  const blocker: any = useBlocker(when);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setNextLocation(blocker.location.pathname);
      setOpen(true);
    }
  }, [blocker]);

  const handleDiscard = () => {
    setOpen(false);
    blocker.proceed(); // Allow navigation
  };

  const handleCancel = () => {
    setOpen(false);
    blocker.reset(); // Prevent navigation
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <div className='popup-header'>
      <h2>Unsaved Changes</h2>
      </div>
      <DialogContent>You have unsaved changes. Are you sure you want to leave?</DialogContent>
      <DialogActions>
        <Button onClick={handleDiscard} color="error">
          Leave
        </Button>
        <Button onClick={handleCancel} color="primary">
          Stay
        </Button>
      </DialogActions>
    </Dialog>
  );
};
