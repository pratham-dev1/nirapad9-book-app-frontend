import { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, Typography } from '@mui/material';
import { AuthContext } from '../context/auth/AuthContext';
import { useLogout } from '../hooks/useLogout';


const useIdleTimeout = (timeout: number): number => {
  const [remainingTime, setRemainingTime] = useState(timeout);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const startTimer = () => {
      timerId = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1000); // Update remaining time every second
      }, 1000);
    };

    const resetTimer = () => {
      clearInterval(timerId);
      setRemainingTime(timeout);
      startTimer();
    };

    startTimer();

    const handleActivity = () => {
      resetTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearInterval(timerId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [timeout]);

  return remainingTime;
};

const IdleTimeout = () => {
  const { state, dispatch } = useContext(AuthContext);
  const { mutate: mutateLogout } = useLogout();
  const timeRemaining = useIdleTimeout(15 * 60 * 1000);
  const [showPopup, setShowPopup] = useState(false); // State to manage popup visibility

  useEffect(() => {
    if (timeRemaining === 0) {
      mutateLogout({});
    } else if (timeRemaining <= 10000) {
      setShowPopup(true); // Show popup when 10 seconds are remaining
    } else {
      setShowPopup(false); 
    }
  }, [timeRemaining, mutateLogout]);

  return (
    <>
      <Dialog open={showPopup && !!state.userId} onClose={() => {}} aria-labelledby="popup-dialog-title">
        <DialogContent style={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Your session will expire soon. Please click anywhere to continue.
          </Typography>
          <Typography variant="body2">Time left: {Math.ceil(timeRemaining / 1000)} seconds</Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IdleTimeout;
