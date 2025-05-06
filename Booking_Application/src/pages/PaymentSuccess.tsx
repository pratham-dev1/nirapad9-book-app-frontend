import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PaymentSuccess = () => {
    const navigate = useNavigate()
    const [timer, setTimer] = useState(3)
    useEffect(() => {
      // Start countdown
      const timer = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000); // Update countdown every second
  
      // Redirect after 3 seconds
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard'); // Change '/target-page' to your desired route
      }, 3000);
  
      // Clear timers on component unmount
      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    }, []);
  return (
    <>
    <h1>
      Payment Success
    </h1>
    <h5>Redirecting in {timer} seconds...</h5>
    </>
  )
}

export default PaymentSuccess