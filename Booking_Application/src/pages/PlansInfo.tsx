import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTextField from "../components/CustomTextField";
import { useMutation, useQuery } from "react-query";

import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { RadioGroup, Radio, FormControl, FormControlLabel    } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useContext, useState } from "react";

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "../styles/icons/CheckIcon";
import CompareFeaturesTable from "../components/CompareFeaturesTable";
import { SERVER_URL } from "../services/axios";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import { SubscriptionTypes, ToastActionTypes } from "../utils/Enums";
import request from "../services/http";
import { ACTIVATE_FREE_TRIAL, GET_SUBSCRIPTION_DETAILS, GET_USER_DETAILS } from "../constants/Urls";
import { useLogout } from "../hooks/useLogout";
import showToast from "../utils/toast";
import Loader from "../components/Loader";

const PlansInfo: React.FC = () => {
    const navigate = useNavigate()
    const {state, dispatch} = useContext(AuthContext)
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const { data: user, isLoading } = useQuery("user-details-data", () => request(GET_USER_DETAILS));
    const {mutate: mutateLogout} = useLogout()
    const {data, isLoading: isLoading2} = useQuery(['subscription-details'], () => request(GET_SUBSCRIPTION_DETAILS))
    const subscription = data?.data?.filter((i: any) => (user?.userData?.business ? i.id !== SubscriptionTypes.BASIC : i))      // removing basic subscription option if business account

    const { mutate: mutateActivateFreeTrial } = useMutation((body: object) => request(ACTIVATE_FREE_TRIAL, "post", body),
      {
        onSuccess: (data) => {
          showToast(ToastActionTypes.SUCCESS, data?.message)
          dispatch({
            type: AuthActionTypes.SET_USER_INFO, 
            payload: {...state, isFreeTrial: true}
        })
        navigate('/dashboard')
        },
      })

    const handleClick = (index: number) => {
        setActiveIndex(index);
    };
    if(isLoading || isLoading2) {
        return <Loader />
    }

    return (
        <div className="plans-container">
            { !state.isFreeTrial && !state.isPaidPlan && <CustomButton label="Back" onClick={() => mutateLogout({})} sx={{float: "right"}} /> }
            <h2 className="text-center">Plans & Pricing</h2>
            <ul className="checkout-steps d-flex justify-center items-center">
                <li className="active-step plan-step font-bold">Current & Available Plans</li>
                <li className="subscription-step pointer" onClick={() => navigate('/billing-step')}>Subscription Management</li>
                <li className="payment-step">Checkout</li>
            </ul>

            <div className="plans-list d-flex justify-between items-center">
            { !state.isFreeTrial && !state.isPaidPlan && !state.isFreeTrialOver && <div className="plan-item">
                        <div className="plan-details">
                            <h2 className="plan-name">Free Trial</h2>
                            <p>5 days Trial </p>
                            <div className="plan-price">
                                {/* {item.id !== 4 && <> 
                                <span className="price">${activeIndex === 0 ? item.price : item.price * 10}</span>
                                <span>/month</span>
                                </>} */}
                            </div> 
                            <div className="plan-activate">    
                                <Button className="primary_btns" variant="outlined"  type='submit' onClick={() => mutateActivateFreeTrial({})}>Activate</Button>
                            </div>
                        </div>
                        <div className="plan-feature">
                            <p>Key Featurse:</p>
                            <ul>
                                <li>
                                    <CheckIcon /> 
                                    <span>50 One-One Meetings</span>
                                </li>
                                <li>
                                    <CheckIcon />
                                    <span>1 Calendar Integration</span>
                                </li>
                                <li>
                                    <CheckIcon />
                                    <span>Event History Available</span>
                                </li>
                                <li>
                                    <CheckIcon />
                                    <span>Limited Personalization</span>
                                </li>
                            </ul>
                        </div>
                    </div>
            }
                {subscription?.map((item: any)=> {
                    return(
                    <div className="plan-item ml-5">
                    <div className="plan-details">
                        <h2 className="plan-name">{item.type?.toUpperCase()}</h2>
                        <p>{item.text}</p>
                        <div className="plan-price">
                            {item.id !== 4 && <> 
                            <span className="price">${activeIndex === 0 ? item.price : item.price * 10}</span>
                            <span>/month</span>
                            </>}
                        </div> 
                        <div className="plan-activate">
                            {/* <Button className="primary_btns current-plan" disabled
                            onClick={() => navigate('/payment-page',{state: {PRICE_ID: activeIndex === 0 ? BASIC_MONTHLY_PRICE_ID : BASIC_YEARLY_PRICE_ID }})}>
                            Current Plan</Button> */}
                            {(state.subscription === item.id && state.isPaidPlan) ?
                            <form action={`${SERVER_URL}/api/payment/customer-portal`}
                            method="POST"
                            >
                            <Button className="primary_btns" variant="outlined" type='submit'>Manage</Button>
                            </form>
                            :
                            <form 
                            action={`${SERVER_URL}/api/payment/create-checkout-session/${activeIndex === 0 ? item.monthlyPriceId : item.yearlyPriceId}/${item.id}`}
                            // action={`${SERVER_URL}/api/payment/customer-portal`}
                            method="POST"
                            >
                            { item.id === 4 ? <Button className="primary_btns">Contact Us</Button>
                            : <Button className="primary_btns" type='submit'>{state.subscription! > item.id ? 'Downgrade' : 'Upgrade'}</Button> }
                            </form>
                            }
                        </div>
                    </div>
                    <div className="plan-feature">
                        <p>Key Featurse:</p>
                        <ul>
                            <li>
                                <CheckIcon /> 
                                <span>50 One-One Meetings</span>
                            </li>
                            <li>
                                <CheckIcon />
                                <span>1 Calendar Integration</span>
                            </li>
                            <li>
                                <CheckIcon />
                                <span>Event History Available</span>
                            </li>
                            <li>
                                <CheckIcon />
                                <span>Limited Personalization</span>
                            </li>
                        </ul>
                    </div>
                </div>
                    )
                })}
                
            </div>

            <div className="compare-features-col">
                <div className="billing-cycle-col">
                    {/* <h3>Current Billing Cycle</h3> */}
                    {/* <p className="saving-amt">Save <span>$$$$$/year</span> when you select annual billing cycle.</p> */}
                    <RadioGroup className="billing-daurations d-flex justify-center flex-row" defaultValue="monthly">
                        <div 
                            className={`duration-item mr-25 ${activeIndex === 0 ? 'active-item' : ''}`}
                            onClick={() => handleClick(0)}
                        >
                            <FormControlLabel 
                                className="plan-duration-checkbox" 
                                value="monthly" 
                                control={<Radio />} 
                                label="" 
                            />
                            <h4>Monthly</h4>
                            <p>after 5-days free trial</p>
                            <div className="price-col">
                                <span className="amount">$100</span>
                                <span>/month</span>
                            </div>
                        </div>

                        <div 
                            className={`duration-item ${activeIndex === 1 ? 'active-item' : ''}`}
                            onClick={() => handleClick(1)}
                        >
                            <FormControlLabel 
                                className="plan-duration-checkbox" 
                                value="annual" 
                                control={<Radio />} 
                                label="" 
                            />
                            <h4>Annual <span className="best-value">Best Value</span></h4>
                            <p>after 5-days free trial</p>
                            <div className="price-col">
                                <span className="amount">$100</span>
                                <span>/month</span>
                            </div>
                        </div>
                    </RadioGroup>
                    
                </div>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        Compare Features
                    </AccordionSummary>
                    <AccordionDetails>
                        <CompareFeaturesTable data={subscription || []} activeIndex={activeIndex} />
                    </AccordionDetails>
                
                </Accordion>
            </div>
            
        </div>
        

    )
}

export default PlansInfo;