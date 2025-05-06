import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import AddIcon from "../../styles/icons/AddIcon";
import CopyIcon from "../../styles/icons/CopyIcon";
import OptionIcon from "../../styles/icons/OptionIcon";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Loader from "../../components/Loader";

const GroupListView: React.FC<{data: any, deleteGroup: Function,  openDeleteDialog: any, setOpenDeleteDialog: any, duplicateGroup: any, isDeleteLoading: boolean}> = ({data, deleteGroup, openDeleteDialog, setOpenDeleteDialog, duplicateGroup, isDeleteLoading}) => {
    const navigate = useNavigate();
    const [groupId,setGroupId] = useState<any>();
    const location = useLocation()
    const onConfirmDelete = () => {
        setOpenDeleteDialog(false)
        deleteGroup(groupId)
    }
    return (
        <div className="w-100 d-flex flex-row list-view-template">
            {isDeleteLoading && <Loader />}
            <div className="w-15 d-flex justify-center items-center mb-30 add_tmplt_wrp" onClick={() => navigate('/add-group', {state: {view: 'list'}})}>
                <div className="add_tmplt">
                    <span className="add_tmplt_icon">
                        <AddIcon/>
                    </span>
                    <span>Create New</span>
                </div>
            </div>

            <div className="w-100 tmplt_lst d-flex flex-row mb-70">
                {data?.map((item: any) => {
                    return <div className="w-100 d-flex tmplt_list_item items-center" key={item.id}>
                    <div className="tmplt_nme">
                        {item.name}
                    </div>
                    <div className="tmplt_nme">
                        {item.groupMembers.map((i: any) => i.firstname).join(', ')}
                    </div>
                    <div className="tmplt_act">
                        <div className="tmplt_copy" onClick={()=>duplicateGroup(item)}>
                            <CopyIcon />
                        </div>
                        <div className="tmplt_opt"> 
                            <div className="tmplt_opt_icon">
                                <OptionIcon />
                                <ul className="opt_item">
                                    <li onClick={() => navigate("/view-group", {state: {data: item, view: 'grid'}})}>View</li>
                                    <li onClick={() => navigate("/edit-group", {state: {data: item, view: 'list', from: location.state?.from}})}>Edit</li>
                                    <li onClick={() => { setOpenDeleteDialog(true);setGroupId({groupIds: [item.id]})}}>Delete</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                })}
            </div>

            <Dialog
                open={openDeleteDialog}
                // onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className="popup-header">
                    <h2>Confirmation</h2>
                    <CloseIcon onClick={() => setOpenDeleteDialog(false)} />
                </div>
                {/* {(isDeleteLoading) && <Loader />} */}
                <DialogContent>
                    <h2 className="mb-50 text-center">Are you sure want to remove this group?</h2>
                    <div className="d-flex justify-center">
                        <CustomButton label="Delete" disabled={isDeleteLoading} className="primary_btns mr-25" onClick={onConfirmDelete}/>
                        <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default GroupListView;