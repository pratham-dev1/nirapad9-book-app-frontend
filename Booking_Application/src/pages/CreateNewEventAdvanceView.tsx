import React, { useContext, useEffect, useState } from 'react'
import EventTypeView from './recruiter/EventTypeView'
import CreateNewEventAdvance from './CreateNewEventAdvance'
import BookSlotView from './recruiter/BookSlot'
import CreateNewEvent from './CreateNewEvent'
import CustomButton from '../components/CustomButton'
import BookSlot from './recruiter/BookSlot'
import { AuthContext } from '../context/auth/AuthContext'
import { useQueryParams } from '../hooks/useSearchParams'

const CreateNewEventView = () => {
  const {state} = useContext(AuthContext)
  const {getQueryParam, setQueryParam, searchParams} = useQueryParams()
  const [getUIMode, setUIMode] = useState(parseInt(getQueryParam('view') as string) || 0)
  const [eventValue, setEventValue] = useState(null)
  useEffect(() => {  
    setQueryParam({view: `${getUIMode}`})
  },[getUIMode])

  useEffect(() => {
    setUIMode(parseInt(getQueryParam('view') as string) || 0)
  },[searchParams])
  return (
    <div>
      {getUIMode === 0 ? 
          <div className={`book-slot-opt gnrl_usr ${state.userType === 4 && "gnrl_usr"}`} style={{display:'flex'}}>
            <EventTypeView setUIMode={setUIMode} setEventValue={setEventValue} />
          </div>
      : getUIMode === 1 ? (
        <>
        <BookSlot />
        <div className="back-btn">
          <CustomButton label="Go back" onClick={() => setUIMode(0)} />
        </div>
        </>
      ) : getUIMode === 2 ? (
        <>
        <CreateNewEvent />
        <div className="back-btn">
          <CustomButton label="Go back" onClick={() => setUIMode(0)} />
        </div>
        </>
      ) 
        :
          <div className="adv_crt_evnt_col">
            <CreateNewEventAdvance setUIMode={setUIMode} eventValue={eventValue} />
          </div>
        }
    </div>
  )
}

export default CreateNewEventView
