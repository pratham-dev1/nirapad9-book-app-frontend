import { useQuery } from 'react-query'
import request from '../services/http'
import { GET_EVENT_TYPES } from '../constants/Urls'

export const useEventTypes = () => useQuery('eventTypes', () => request(GET_EVENT_TYPES), {
    select: (data) => {
        const filteredRecord =  data?.data?.filter((i: any) => i.value !== 'Advanced')
        return {...data, data: filteredRecord}
    }
})