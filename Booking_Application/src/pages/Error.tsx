import React from 'react'
import { Link, useParams } from 'react-router-dom'
import WarningIcon from '../styles/icons/WarningIcon';

const Error = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams?.get('message');
    return (
        <>
            <div className='page-wrapper'>
                <div className='card-box error_col mw-700 mt-70'>
                    <div className='d-flex flex-column justify-center items-center'>
                        <div className='mb-10 error_icn'><WarningIcon /></div>
                        <h3 className='text-center mb-30'>{message}</h3>
                        <Link className='bck_btn' to="/login">Go Back</Link>
                    </div>
                </div>
            </div>
            
        </>
    )
}

export default Error
