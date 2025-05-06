import React, { useContext, useEffect, useState } from "react";
import ClockIcon from "../../styles/icons/ClockIcon";
import { useQuery } from "react-query";
import request from "../../services/http";
import { FREQUENTLY_MET_PEOPLE, FREQUENTLY_USED_EVENTS } from "../../constants/Urls";
import { EmailOutlined } from "@mui/icons-material";

interface CompProps {
    setUIMode: any;
    setEventValue: any;
}

const FrequentlyMetPeople: React.FC<CompProps> = ({setEventValue, setUIMode}) => {
    const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
    const {data} = useQuery(['frequently-met-people'],() => request(FREQUENTLY_MET_PEOPLE, "get"))

    const handleClick = (item: any) => {
        // setUIMode(3)
        // setEventValue({
        //     ...item, 
        //     minutes: item.eventTime, 
        //     eventType: EVENT_TYPES.filter((i) => i.id === item.eventTypeId)[0],
        //     type: "frequently_used_events",
        //     predefinedEventId: item.id
        // })
    }

    return (
        <div className="frequently-used-events-table simple-table">
            <div className="col-head d-flex">
                <span className="w-60 text-center"><EmailOutlined /></span>
                <span className="w-15 text-center">Count</span>
                <span className="w-25 text-center">
                   Tag Id
                </span>
            </div>
            {data?.data.length === 0 ? (
                <div className="no-tbl_data_msg">
                    <span>Currently, There's no any Events.</span>
                </div>
            ) : (
            data?.data.map((item: any) => (
                <div className="col-body d-flex items-center" onClick={()=> handleClick(item)}>
                    <span className="w-60 cursur-pointer">{item.attendee}</span>
                    <span className="w-15 text-center cursur-pointer">{item.count}</span>
                    <span className="w-25 text-center cursur-pointer">{item?.tagName}</span>
                </div>
            )))}
        </div>
    )
}
export default FrequentlyMetPeople;