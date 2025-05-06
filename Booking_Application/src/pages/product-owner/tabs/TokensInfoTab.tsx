import React, { useContext } from 'react'
import { AuthContext } from '../../../context/auth/AuthContext';
import dayjs from 'dayjs';
import { useQuery } from 'react-query';
import request from '../../../services/http';
import { GET_CREDENTIALS_BLOCKED_LOGS, GET_USERS_TOKENS_INFO } from '../../../constants/Urls';

const TokensInfoTab = () => {
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const { data } = useQuery('users-token-info', () => request(GET_USERS_TOKENS_INFO))
  return (
    <div className="w-100 d-flex flex-row list-view-template all-qus-list">
      <div className="w-100 tmplt_lst d-flex flex-row mb-70 qus-list-item">
      <div className="w-100 d-flex tmplt_list_item items-center">
      <div className="tmplt_nme"><span>UserId</span></div>
      <div className="tmplt_nme"><span>First time Email1 Sync At</span></div> 
      <div className="tmplt_nme"><span>Last Email1 Sync At</span></div> 
      <div className="tmplt_nme"><span>Email1 Token Expiration At</span></div>
      <div className="tmplt_nme"><span>First time Email2 Sync At</span></div> 
      <div className="tmplt_nme"><span>Last Email2 Sync At</span></div>
      <div className="tmplt_nme"><span>Email2 Token Expiration At</span></div> 
      <div className="tmplt_nme"><span>First time Email3 Sync At</span></div>
      <div className="tmplt_nme"><span>Last Email3 Sync At</span></div>
      <div className="tmplt_nme"><span>Email3 Token Expiration At</span></div>

      </div>
        {data?.data?.map((item: any) => {
          return <div className="w-100 d-flex tmplt_list_item items-center">
            <div className="tmplt_nme">
              <span>{item?.id}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.firstTimeEmailSyncTimeStamp ? dayjs(item?.firstTimeEmailSyncTimeStamp).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.emailSyncTimeStamp ? dayjs(item?.emailSyncTimeStamp).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.emailSyncExpiration ? dayjs(item?.emailSyncExpiration).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : 'never'}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.firstTimeEmail2SyncTimeStamp ? dayjs(item?.firstTimeEmail2SyncTimeStamp).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.email2SyncTimeStamp ? dayjs(item?.email2SyncTimeStamp).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.email2SyncExpiration ? dayjs(item?.email2SyncExpiration).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : 'never'}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.firstTimeEmail3SyncTimeStamp ? dayjs(item?.firstTimeEmail3SyncTimeStamp).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : null}</span>
            </div>
            <div className="tmplt_nme">
              <span>{item?.email3SyncTimeStamp ? dayjs(item?.email3SyncTimeStamp).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : null}</span>
            </div>
            <div className="tmplt_nme">
            <span>{item?.email3SyncExpiration ? dayjs(item?.email3SyncExpiration).tz(default_timeZone).format('DD-MM-YYYY h:mm A') : 'never'}</span>
            </div>
          </div>
        })}
      </div>
    </div>
  )
}

export default TokensInfoTab