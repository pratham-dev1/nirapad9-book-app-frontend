import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { Button, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from "@mui/material";
import { useQuery } from "react-query";
import request from "../services/http";
import { GET_FEATURES_LIST, GET_SUBSCRIPTION_DETAILS } from "../constants/Urls";
import { SERVER_URL } from "../services/axios";
import { AuthContext } from "../context/auth/AuthContext";

const CompareFeaturesTable: React.FC<{data: any[], activeIndex: number}> = ({data,activeIndex}) => {
    const {state} = useContext(AuthContext)
    const {data: featuresData} = useQuery(['features_list'], () => request(GET_FEATURES_LIST))
    return (
        <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="feature compare table">

                <TableBody className="plan-compare-table-row">
                    <TableRow>
                        <TableCell></TableCell>
                        {data.map((item: any) => {
                        return (
                            <TableCell className="basic-plan-compare-col">
                            <div className="plan-details">
                                <h2 className="plan-name">{item?.type?.toUpperCase()}</h2>
                                <p>{item.text}</p>
                                <div className="plan-price">
                                    {item.price && <>
                                    <span className="price">${activeIndex === 0 ? item.price : item.price * 10}</span>
                                    <span>/month</span>
                                    </>}
                                </div> 
                                {state.subscription === item.id ?
                                        <form action={`${SERVER_URL}/api/payment/customer-portal`}
                                        method="POST"
                                        >
                                        <Button className="primary_btns" variant="outlined" type='submit'>Manage</Button>
                                        </form>
                                        :
                                        <form action={`${SERVER_URL}/api/payment/create-checkout-session/${activeIndex === 0 ? item.monthlyPriceId : item.yearlyPriceId}/${item.id}`}
                                        method="POST"
                                        >
                                        { item.id === 4 ? <Button className="primary_btns">Contact Us</Button>
                                        : <Button className="primary_btns" type='submit'>Upgrade</Button> }
                                        </form>
                                }
                            </div>
                        </TableCell>
                        )
                        })}
                    </TableRow>
                </TableBody>

                <TableBody className="feature-compare-table-row">
                    {featuresData?.data?.map((item:any) => (
                        <TableRow key={item.featureName}>
                            <TableCell>
                                {item.featureName}
                            </TableCell>
                            {item?.subscription_features?.map((el:any)=> {
                                return (
                                    <TableCell align="center">{el.availability}</TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer >
    )
}

export default CompareFeaturesTable;
