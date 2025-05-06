import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import AddIcon from "../../styles/icons/AddIcon";
import CopyIcon from "../../styles/icons/CopyIcon";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Loader from "../../components/Loader";

const GroupGridView: React.FC<{data: any, deleteGroup: Function, openDeleteDialog: any, setOpenDeleteDialog: any, duplicateGroup: any, isDeleteLoading: boolean}> = ({deleteGroup, data, openDeleteDialog, setOpenDeleteDialog, duplicateGroup, isDeleteLoading}) => {
    const navigate = useNavigate();
    const [groupId,setGroupId] = useState<any>();
    const onConfirmDelete = () => {
        setOpenDeleteDialog(false)
        deleteGroup(groupId)
    }
    const location = useLocation()

    return (
        <div className="w-100 d-flex flex-row">
            {isDeleteLoading && <Loader />}
            <div className="tmplt_box crt_nw_tmplt">
                <div className="tmplt_add_doc">
                    <div
                        className="add_tmplt"
                        onClick={() => navigate("/add-group", {state: {view: 'grid', from: location.state?.from}})}
                    >
                        <AddIcon />
                    </div>
                </div>
                <div className="tmplt_name">Add New Group</div>
            </div>

            {data?.map((item: any) => {
                return <div className="tmplt_box" key={item.id}>
                <div className="tmplt_snp_view">    
                    <div className="tmplt_doc tmplt_doc_dtls_snp">
                        <p className="mb-zero font-regular">{item?.description}</p>
                        {/* <p className="mt-0">Some About group content</p> */}
                        <p className="mb-zero font-regular">Member Count:</p>
                        <p className="mt-0">{item?.groupMembers?.length + (item.addMe && 1)}</p>
                    </div>
                </div>

                <div className="templt_act">
                    <span className="tmplt_edit" onClick={() => navigate("/edit-group", {state: {data: item, view: 'grid'}})}>Edit</span>
                    <span className="tmplt_prevw" onClick={() => navigate("/view-group", {state: {data: item, view: 'grid'}})}>View</span>
                    {/* <span className="tmplt_dlt" onClick={() => deleteGroup({groupIds: [item.id]})}>Delete</span> */}
                    <span className="tmplt_dlt" onClick={() => { setOpenDeleteDialog(true);setGroupId({groupIds: [item.id]})}}>Delete</span>
                </div>
                <div className="tmplt_name">
                    <span>{item.name}</span>
                    <span className="tmplt_clone" onClick={()=>duplicateGroup(item)}><CopyIcon/></span>
                </div>
            </div>
            })}
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
                    <h2 className="mb-50 text-center">Are you sure want to remove this group?</h2>
                    <div className="d-flex justify-center">
                        <CustomButton label="Delte" disabled={isDeleteLoading} className="primary_btns mr-25" onClick={onConfirmDelete}/>
                        <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default GroupGridView;