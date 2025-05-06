import React, { useContext, useEffect, useState } from "react";
import AddIcon from "../../styles/icons/AddIcon";
import CopyIcon from "../../styles/icons/CopyIcon";
import { useNavigate } from "react-router-dom";
import ViewTemplate from "../../components/ViewTemplate";
import HtmlToImagePreview from "../../components/DocPreview";
import { Dialog, DialogContent } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import CloseIcon from "@mui/icons-material/Close";

const GridViewTemplate: React.FC<{ data: any; deleteTemplate: any, openDeleteDialog: any, setOpenDeleteDialog: any, duplicatePredefinedEmailTemplate: any }> = ({
  data,
  deleteTemplate,
  openDeleteDialog,
  setOpenDeleteDialog,
  duplicatePredefinedEmailTemplate
}) => {
  const navigate = useNavigate();
  const [templateId,setTemplateId] = useState<any>();
  const onConfirmDelete = () => {
    deleteTemplate(templateId)
  }
  return (
    <div className="w-100 d-flex flex-row">
      <div className="tmplt_box crt_nw_tmplt">
        <div className="tmplt_add_doc">
          <div
            className="add_tmplt"
            onClick={() => navigate("/add-email-templates", {state: {view: 'grid'}})}
          >
            <AddIcon />
          </div>
        </div>
        <div className="tmplt_name">Add New Template</div>
      </div>

      {data.map((item: any) => {
        return (
          <div className="tmplt_box" key={item.id}>
            <div className="tmplt_snp_view">
              <div className="tmplt_doc">
              <HtmlToImagePreview htmlContent={item?.template as HTMLElement} />
              </div>
            </div>
            <div className="templt_act">
              <span className="tmplt_edit" onClick={() => navigate('/edit-email-templates', {state:{data: item, view:'grid'}})}>Edit</span>
              <ViewTemplate value={item.template} text={'Preview'} view="grid" />
              <span className="tmplt_dlt" onClick={() => { setOpenDeleteDialog(true);setTemplateId({templateId: [item.id]})}}>Delete</span>
            </div>
            <div className="tmplt_name">
              <span>{item.name}</span>
              <span className="tmplt_clone" onClick={()=>duplicatePredefinedEmailTemplate(item)}>
                <CopyIcon />
              </span>
            </div>
          </div>
        );
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
              <h2 className="mb-50 text-center">Are you sure want to remove this template?</h2>
              <div className="d-flex justify-center">
                <CustomButton label="Delete" className="primary_btns mr-25" onClick={onConfirmDelete}/>
                <CustomButton label="Cancel" className="secondary_btns" onClick={() => setOpenDeleteDialog(false)} />
              </div>
          </DialogContent>
        </Dialog>
      
    </div>
  );
};
export default GridViewTemplate;
