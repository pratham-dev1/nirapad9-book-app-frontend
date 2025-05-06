import React, { useContext, useEffect, useState } from "react";
import ClockIcon from "../../styles/icons/ClockIcon";
import { useQuery } from "react-query";
import request from "../../services/http";
import { FREQUENTLY_USED_EVENTS } from "../../constants/Urls";

interface CompProps {
    setUIMode: any;
    setEventValue: any;
}

const FrequentlyUsedEvents: React.FC<CompProps> = ({setEventValue, setUIMode}) => {
    const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
    const {data} = useQuery(['frequently-used-events'],() => request(FREQUENTLY_USED_EVENTS, "get"))

    const handleClick = (item: any) => {
        setUIMode(3)
        setEventValue({
            ...item, 
            minutes: item.eventTime, 
            eventType: EVENT_TYPES.filter((i) => i.id === item.eventTypeId)[0],
            type: "frequently_used_events",
            predefinedEventId: item.id
        })
    }

    return (
        <div className="frequently-used-events-table simple-table">
            <div className="col-head d-flex">
                <span className="w-40 text-center">Event Template</span>
                <span className="w-15 text-center"><ClockIcon /></span>
                <span className="w-40 text-center">
                    <img src="/person-group-icon.svg" />
                </span>
            </div>
            {data?.data.length === 0 ? (
                <div className="no-tbl_data_msg">
                    <span>Currently, There's no any Events.</span>
                </div>
            ) : (
            data?.data.map((item: any) => (
                <div className="col-body d-flex items-center" onClick={()=> handleClick(item)}>
                    <span className="w-40 text-center cursur-pointer">{item.title}</span>
                    <span className="w-15 text-center cursur-pointer">{item.eventTime + ' Min'}</span>
                    <span className="w-40 text-center cursur-pointer">{EVENT_TYPES.filter((element) => element.id === item.eventTypeId)[0]?.value}</span>
                </div>
            )))}
        </div>
    )
}
export default FrequentlyUsedEvents;