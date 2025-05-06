import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../components/CustomTextField";
import CustomButton from "../../components/CustomButton";
import { useMutation, useQuery } from "react-query";

interface Billing {
    name: string;
    email: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
    };
}

const Billing: React.FC = () => {
    const navigate = useNavigate()
    return (
        <>
            <div className="payment-wrapper">
                <h2 className="text-center">Plans & Pricing</h2>
                <ul className="checkout-steps d-flex justify-center items-center">
                    <li className="plan-step">Current & Available Plans</li>
                    <li className="subscription-step font-bold active-step">Subscription Management</li>
                    <li className="payment-step">Checkout</li>
                </ul>

                <div className="crnt_pln_dtls mw-500">
                    <div className="w-100 d-flex justify-between items-center">
                        <div className="pln_info">
                            <h3>Current Plan: BASIC  $100/month</h3>
                            <h3>Current Billing Cycle: Monthly</h3>
                            <span>Renews on August 1, 2024 </span>
                        </div>
                        <div className="pln_mng">
                            <button onClick={() => navigate('/plans-and-pricing')}>Manage</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Billing;

