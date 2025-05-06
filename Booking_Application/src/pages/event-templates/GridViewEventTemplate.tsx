import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import AddIcon from "../../styles/icons/AddIcon";
import CopyIcon from "../../styles/icons/CopyIcon";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../../context/auth/AuthContext";
import ViewTemplate from "../../components/ViewTemplate";
import { Dialog, DialogContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PreviewTemplate from "../../components/PreviewTemplate";
import request from "../../services/http";
import { GET_PREDEFINED_MEETS_LOCATIONS, PREVIEW_TEMPLATE } from "../../constants/Urls";

const GridViewEventTemplate: React.FC<{data: any, deleteTemplate: any, openDeleteDialog: any, setOpenDeleteDialog: any, duplicatePredefinedEvent: any}> = ({data, deleteTemplate, openDeleteDialog, setOpenDeleteDialog, duplicatePredefinedEvent}) => {
  const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
  const navigate = useNavigate();
  const location = useLocation()
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  // const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
  const [templateId,setTemplateId] = useState<any>();
  const [previewTemplate, setPreviewTemplate] = useState('');

  const {data: meetLocations} = useQuery('predefined-meet-locations', () => request(GET_PREDEFINED_MEETS_LOCATIONS))
  const onConfirmDelete = () => {
    deleteTemplate(templateId)
  }

  const { mutate: mutatePreviewTemplate, isLoading: isPreviewLoading, isSuccess: isPreviewSuccess } = useMutation((body: object) => request(PREVIEW_TEMPLATE, "post", body),{
    onSuccess: (data) => {
        setPreviewTemplate(data?.data)
        console.log('ooo')
    }
  })

  const handlePreviewTemplate = (item: any) => {
    const startTime = item.startTime
    mutatePreviewTemplate({
        template: item.template,
        // datetime: (date && startTime) ? dayjs(`${date?.format("YYYY-MM-DD")} ${startTime?.format("HH:mm")}`).utc() : null,
        time: startTime ? dayjs(startTime).tz(default_timeZone).format("h:mm A") : null,
        url: item?.predefined_meet?.url,
        passcode: item?.predefined_meet?.passcode,
        location: meetLocations?.data.filter((i: any) => i.id === item?.predefined_meet?.location)[0]?.value,
        phone: item?.predefined_meet?.phone,
        address: item?.predefined_meet?.address,
        timezone: default_timeZone
    })
  }

    return (
        <div className="w-100 d-flex flex-row evnt_tmplt_itm_wrp">
            <div className='tmplt_box crt_nw_tmplt'>
                <div className='tmplt_add_doc'>
                  <div className='add_tmplt' onClick={() => navigate('/add-event-templates', {state: {view: 'grid',from: location.state?.from}})}>
                    <AddIcon />
                  </div>
                </div>
                <div className='tmplt_name'>Add New Template</div>
            </div>

            {data?.map((item: any) => {
              return (
                <div className='tmplt_box' key={item.id}>
                <div className='tmplt_snp_view'>
                  <div className="evnt_dtls">
                    <p>Event Title: {item.title}</p>
                    <p>Event Type: {EVENT_TYPES.filter((i) => item.eventTypeId === i.id)[0]?.value}</p>
                    <p>Event Time: {dayjs(item.startTime).tz(default_timeZone).format("h:mm A")}</p>
                    <p>Event Location: Video Call</p>

                  </div>
                </div>
                <div className='templt_act'>
                  <span className='tmplt_edit' onClick={() => navigate('/edit-event-templates', {state:{data: item, view: 'grid', from: location.state?.from}})}>Edit</span>
                  {/* <ViewTemplate value={item.template} text={'Preview'} view="grid" /> */}
                  <span className="tmplt_prevw" onClick={() => handlePreviewTemplate(item)}>Preview</span>
                  {/* <span className='tmplt_dlt' onClick={() => deleteTemplate({eventTemplateId: [item.id]})}>Delete</span> */}
                  <span className='tmplt_dlt' onClick={() => { setOpenDeleteDialog(true);setTemplateId({eventTemplateId: [item.id]})}}>Delete</span>
                
                </div>
                <div className='tmplt_name'>
                  <span>{item.title}</span>
                  <span className="tmplt_clone" onClick={()=>duplicatePredefinedEvent(item)}><CopyIcon/></span>
                </div>
            </div>
              )
            })}
            {isPreviewSuccess && <PreviewTemplate value={previewTemplate} />}
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
export default GridViewEventTemplate;