import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import request from '../../../services/http'
import { GET_CREDENTIALS_BLOCKED_LOGS } from '../../../constants/Urls'
import dayjs from 'dayjs'
import { AuthContext } from '../../../context/auth/AuthContext'

const LogsTab = () => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const { data } = useQuery('credentials-booked-logs', () => request(GET_CREDENTIALS_BLOCKED_LOGS))
  return (
    <div className="w-100 d-flex flex-row list-view-template all-qus-list">
      <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
      <div className="w-100 d-flex tmplt_list_item items-center">
      <div className="tmplt_nme"><span>UserId</span></div> 
      <div className="tmplt_nme"><span>Username</span></div> 
      <div className="tmplt_nme"><span>Last Login Tried</span></div>
      {/* <div className="tmplt_nme"><span>System DateTime</span></div> */}
      <div className="tmplt_nme"><span>User disabled/Enabled</span></div>
      <div className="tmplt_nme"><span>Enabled TimeStamp</span></div>
      <div className="tmplt_nme"><span>Disabled TimeStamp</span></div>
      <div className="tmplt_nme"><span>Subscription Upgrade TimeStamp</span></div>
      <div className="tmplt_nme"><span>Subscription Downgrade TimeStamp</span></div>
      </div>
        {data?.data?.map((item: any) => {
          return <div className="w-100 d-flex tmplt_list_item items-center">
            <div className="tmplt_nme">
              <span>{item?.userId}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.userDetails?.username}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.lastLoginTried ? dayjs(item?.lastLoginTried).tz(default_timeZone).format("DD-MM-YYYY h:mm A") : null}</span>
            </div>
            {/* <div className="tmplt_nme">
              <span>{dayjs().tz(default_timeZone).format("DD-MM-YYYY h:mm A")}</span>
            </div> */}
            <div className="tmplt_nme">
              <span>{item?.isCredentialsDisabled ? 'Disabled' : 'Enabled'}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.credentialEnabledTimeStamp ? dayjs(item?.credentialEnabledTimeStamp).tz(default_timeZone).format("DD-MM-YYYY h:mm A") : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.credentialDisabledTimeStamp ? dayjs(item?.credentialDisabledTimeStamp).tz(default_timeZone).format("DD-MM-YYYY h:mm A") : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.userDetails?.subscriptionUpgradeTimeStamp ? dayjs(item?.userDetails?.subscriptionUpgradeTimeStamp).tz(default_timeZone).format("DD-MM-YYYY h:mm A") : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.userDetails?.subscriptionDowngradeTimeStamp ? dayjs(item?.userDetails?.subscriptionDowngradeTimeStamp).tz(default_timeZone).format("DD-MM-YYYY h:mm A") : null}</span>
            </div>
          </div>
        })}
      </div>
    </div>
  )
}

export default LogsTab;