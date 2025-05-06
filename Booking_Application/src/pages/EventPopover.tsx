import React, { useContext } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import CustomButton from '../components/CustomButton';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';

interface EventPopoverProps {
    targetElement: HTMLButtonElement | null;
    setTargetElement: (e: any) => void;
    event: any;
}

const EventPopover: React.FC<EventPopoverProps> = ({ targetElement, setTargetElement, event }) => {
    const { state } = useContext(AuthContext);
    const system_timeZone = dayjs.tz.guess()
    const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
    const handleClose = () => {
        setTargetElement(null);
    };

    const open = Boolean(targetElement);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Popover
            id={id}
            open={open}
            anchorEl={targetElement}
            onClose={handleClose}
            className='evnt_view_povr'
            anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
            }}
            
        >
            <div className='content-wrapper'>
                <h3>{event?.title}</h3>
                <div className='evnt_dtl'>{`${dayjs(event?.start).tz(default_timeZone).format('dddd, DD MMMM, h:mm')} - ${dayjs(event?.end).tz(default_timeZone).format('h:mm a')}`}</div>
                {(event.isCancelled || event.isDeleted) ? <></> :
                    <Link to={event?.meetingLink} target='_blank'><CustomButton label="Join" /></Link>}
            </div>
        </Popover>
    );
}

export default EventPopover