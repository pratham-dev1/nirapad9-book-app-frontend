import React, { SyntheticEvent, useContext, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DELETE_OPEN_AVAILABILITY_TAG, GET_OPEN_AVAILABILITY_TAG, GET_TAG_LINK_TYPES, GET_USER_EMAILS, RESTORE_OPEN_AVAILABILITY_TAG, SAVE_OPEN_AVAILABILITY_TAG } from "../constants/Urls";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import CustomButton from "../components/CustomButton";
import request from "../services/http";
import CustomAutocomplete from "../components/CustomAutocomplete";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { Button, Dialog, DialogContent, IconButton, Tooltip } from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CreateTag from "./CreateTag";
import { GridCloseIcon } from "@mui/x-data-grid";
import RestoreIcon from '@mui/icons-material/Restore';
import { CLIENT_URL } from "../services/axios";
import { AuthContext } from "../context/auth/AuthContext";
import { useEventTypes } from "../hooks/useEventTypes";
import { useLocation, useNavigate } from "react-router-dom";
import AddIcon from "../styles/icons/AddIcon";
import OptionIcon from "../styles/icons/OptionIcon";
import Loader from "../components/Loader";
import CloseIcon from "@mui/icons-material/Close";
import CopyIcon from '@mui/icons-material/ContentCopy';

const OpenAvailabilityTags = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useContext(AuthContext);
  const { data } = useQuery('openAvailabilityTags', () => request(GET_OPEN_AVAILABILITY_TAG))
  const { data: tagLinkTypes } = useQuery('tag-link-types', () => request(GET_TAG_LINK_TYPES))
  const TAG_LINK_TYPES = tagLinkTypes?.data || []
  const { mutate: deleteOpenAvailabilityTag, isLoading: isDeleteOpenAvailabilityTagLoading } = useMutation((body: object) => request(DELETE_OPEN_AVAILABILITY_TAG, "post", body), {
    onSuccess: (data) => {
      setOpenDeleteDialog(false)
      showToast(ToastActionTypes.SUCCESS, data?.message)
      queryClient.invalidateQueries('openAvailabilityTags');
    }
  });

  const { mutate: restoreOpenAvailabilityTag } = useMutation((body: object) => request(RESTORE_OPEN_AVAILABILITY_TAG, "post", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('openAvailabilityTags');
      },
    })

  const handleEdit = (row: any) => {
  
    navigate("/edit-tag", {state: {formdata: row, from: location?.state?.from}})
  };
  const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
  const [openAvailabilityTagId,setOpenAvailabilityTagId] = useState<any>();
  const handleDelete = (row: any) => {
    setOpenAvailabilityTagId({ id: row.id })
    setOpenDeleteDialog(true)
  };

  const handleRestore = (row: any) => {
    restoreOpenAvailabilityTag({ id: row.id })
  };
  const onConfirmDelete = () => {
    deleteOpenAvailabilityTag(openAvailabilityTagId)
  }

  return (
    

    <div className="w-100 d-flex flex-row list-view-template evnt_tmplt_lst_vew">
      <div className="w-15 d-flex justify-center items-center mb-30 add_tmplt_wrp" onClick={() => navigate('/create-tag', {state: {from: location?.state?.from}})}>
          <div className="add_tmplt">
              <span className="add_tmplt_icon">
                  <AddIcon/>
              </span>
              <span>Create New</span>
          </div>
      </div>

      <div className="w-100 tmplt_lst d-flex flex-row mb-70">
        
        {data?.data?.map((row: any, index: number) => (
            <div 
              className={`w-100 d-flex tmplt_list_item items-center ${row.isDeleted ? "itm_delete" : ""}`} 
              key={index}
              
            >
              <div className="tmplt_col w-30">
                {row.tagName}
              </div>
              <div className="tmplt_col w-24 text-center">
                {row.defaultEmail}
              </div>
              <div className="tmplt_col w-20 text-center">
                {row.isDeleted ? "Link Not Available" : <a target="_blank" href={`${CLIENT_URL}/book-your-appointment/${row.tagName}-${row.eventDuration}mins/${state.userId}/${row.id}/${TAG_LINK_TYPES[0]?.typeId}`}>Link</a>}
              </div>
              <div className="tag_txt w-30 text-right">
                {row.openAvailabilityText}
              </div>
            
              <div className="tmplt_act">
                <div className="tmplt_opt">
                  <div className="tmplt_opt_icon">
                    <OptionIcon />
                    <ul className="opt_item">
                      {!row.isDeleted ? (
                        <>
                          <li onClick={() => handleEdit(row)}>Edit</li>
                          <li onClick={() => handleDelete(row)}>Delete</li>
                        </>
                      ) : (
                        <li onClick={() => handleRestore(row)}>Restore</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
      ))}
    </div>

      <Dialog
        open={openDeleteDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="reason-popup"
      >

        {(isDeleteOpenAvailabilityTagLoading) && <Loader />}
        <div className="popup-header">
          <h2>Confirmation</h2>
          <CloseIcon onClick={() => setOpenDeleteDialog(false)} />
        </div>
        {/* {(isDeleteLoading) && <Loader />} */}
        <DialogContent>
          <h2 className="mb-50 text-center">Are you sure want to remove this tag?</h2>
          <div className="d-flex justify-center">
            <CustomButton label="Delete" className="primary_btns mr-25" onClick={onConfirmDelete}/>
            <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
          </div>
        </DialogContent>
      </Dialog>
  </div> 
  );
};

export default OpenAvailabilityTags;
