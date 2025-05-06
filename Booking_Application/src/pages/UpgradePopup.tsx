import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import CustomButton from "../components/CustomButton";
import { Dialog, DialogContent } from '@mui/material';
import CloseIcon from "../styles/icons/CloseIcon";
import { useNavigate } from "react-router-dom";



const UpgradePopup: React.FC<{setOpenUpgradePopup: any}> = ({setOpenUpgradePopup}) => {
    const navigate = useNavigate()
    return (
        <>
        <Dialog open={true} className="upgrd_ftur_pup">
        <DialogContent>
                    <span className="pup_cls" onClick={() => {setOpenUpgradePopup(false) }}>
                        <CloseIcon />
                    </span>
                    <div className="d-flex flex-row justify-center">
                        <div className="w-40 mt-30">
                            <img src="/upgrd_exp.png" />
                        </div>
                        <div className="w-50 upgrd_fetr_cnt">
                            <span className="dmnd_icn">
                                <img src="/diamond.png" />
                            </span>
                            <h3 className="mb-20">Unlock Our Platform's Full Potential</h3>
                            <p className="mb-20">Upgrade your subscription to access advanced features like One to Many Events for managing multiple guests, enhanced analytics for deeper insights, and priority support for quick assistance. </p>
                            <p className="mb-30"><b>Elevate your productivity and efficiency—upgrade now!</b></p>
                           
                            <div className="w-100 d-flex flex-row align-center justify-center">
                                <CustomButton
                                    label="Maybe Later"
                                    className="cancel-btn mr-25"
                                    onClick={() => {setOpenUpgradePopup(false) }}
                                />
                                <CustomButton
                                    label="Upgrade"
                                    className="submit-btn"
                                    onClick={() => navigate('/plans-and-pricing')}
                                />
                            </div>   
                        </div>
                        
                    </div>
                </DialogContent>
          </Dialog>
          </>
    )
}
export default UpgradePopup


