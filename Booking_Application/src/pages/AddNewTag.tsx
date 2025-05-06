import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTextField from "../components/CustomTextField";
import { useMutation } from "react-query";


import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import { RadioGroup, Radio, FormControl, FormControlLabel    } from "@mui/material";
import { useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OpenAvailabilityTags from "./OpenAvailabilityTags";
import BackArrowIcon from "../styles/icons/BackArrowIcon";



const AddNewTag: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation()
    return (
        <div className="page-wrapper">
            <div className="d-flex justify-between items-center mb-20">
                <h1>
                    <span className='back-to mr-10 cursur-pointer' onClick={() => navigate((location.state?.from || -1))} ><BackArrowIcon /></span>
                    Add New Tag
                </h1> 
            </div>
            <OpenAvailabilityTags />
        </div>
        
    )
}

export default AddNewTag;