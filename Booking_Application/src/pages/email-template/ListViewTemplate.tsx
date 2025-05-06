import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import AddIcon from "../../styles/icons/AddIcon";
import { Button, TableContainer, Table, TableBody, TableRow, TableCell, Paper, Dialog, DialogContent } from "@mui/material";
import CopyIcon from "../../styles/icons/CopyIcon";
import OptionIcon from "../../styles/icons/OptionIcon";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ViewTemplate from "../../components/ViewTemplate";
import CloseIcon from "@mui/icons-material/Close";

const ListViewTemplate: React.FC<{data: any, deleteTemplate:any, openDeleteDialog: any, setOpenDeleteDialog: any, duplicatePredefinedEmailTemplate: any }> = ({data, deleteTemplate, openDeleteDialog, setOpenDeleteDialog, duplicatePredefinedEmailTemplate}) => {
    const navigate = useNavigate();
    const [templateId,setTemplateId] = useState<any>();
    const onConfirmDelete = () => {
      deleteTemplate(templateId)
    }
    return (
        <div className="w-100 d-flex flex-row list-view-template">
            <div className="w-15 d-flex justify-center items-center mb-30 add_tmplt_wrp" onClick={() => navigate('/add-email-templates', {state: {view: 'list'}})}>
                <div className="add_tmplt">
                    <span className="add_tmplt_icon">
                        <AddIcon/>
                    </span>
                    <span>Create New</span>
                </div>
            </div>
            <div className="w-100 tmplt_lst d-flex flex-row mb-70">
            {data.map((item: any) => {
                return (
                <div className="w-100 d-flex tmplt_list_item items-center"  key={item.id}>
                    <div className="tmplt_nme">
                        {item.name}
                    </div>
                    <div className="tmplt_date">
                        07/27/2024
                    </div>
                    <div className="tmplt_act">
                        <div className="tmplt_copy" onClick={()=> duplicatePredefinedEmailTemplate(item)}>
                            <CopyIcon />
                        </div>
                        <div className="tmplt_opt">
                            <div className="tmplt_opt_icon">
                                <OptionIcon />
                                <ul className="opt_item">
                                    <ViewTemplate value={item.template} text={'Preview'} view={'list'} />
                                    <li onClick={() => navigate('/edit-email-templates', {state:{data: item, view: 'list'}})}>Edit</li>
                                    <li onClick={() => { setOpenDeleteDialog(true);setTemplateId({templateId: [item.id]})}}>Delete</li>
                                </ul>
                            </div>
                            
                        </div>

                    </div>
                </div>
                )
            })}
            </div> 
            <Dialog
                open={openDeleteDialog}
                // onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                className="reason-popup"
            >
                <div className="popup-header">
                    <h2>Confirmation</h2>
                    <CloseIcon onClick={() => setOpenDeleteDialog(false)} />
                </div>
                {/* {(isDeleteLoading) && <Loader />} */}
                <DialogContent>
                    <h2 className="mb-50 text-center">Are you sure want to remove this template?</h2>
                    <div className="d-flex justify-center">
                        <CustomButton label="Delete" className="primary_btns mr-25" onClick={onConfirmDelete}/>
                        <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </div> 

    )
}
export default ListViewTemplate;