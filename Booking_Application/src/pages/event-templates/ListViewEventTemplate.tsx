import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import AddIcon from "../../styles/icons/AddIcon";
import { Button, TableContainer, Table, TableBody, TableRow, TableCell, Paper, Dialog, DialogContent } from "@mui/material";
import CopyIcon from "../../styles/icons/CopyIcon";
import OptionIcon from "../../styles/icons/OptionIcon";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/auth/AuthContext";
import dayjs from "dayjs";
import ViewTemplate from "../../components/ViewTemplate";
import CloseIcon from "@mui/icons-material/Close";
import { GET_PREDEFINED_MEETS_LOCATIONS, PREVIEW_TEMPLATE } from "../../constants/Urls";
import request from "../../services/http";
import PreviewTemplate from "../../components/PreviewTemplate";

const ListViewEventTemplate: React.FC<{data: any, deleteTemplate: any,  openDeleteDialog: any, setOpenDeleteDialog: any, duplicatePredefinedEvent: any}> = ({data, deleteTemplate,  openDeleteDialog, setOpenDeleteDialog, duplicatePredefinedEvent}) => {
    const EVENT_TYPES = [{id: 1, value: 'One to one'}, {id: 2, value: 'One to many'}, {id: 3, value: 'Custom'}, {id: 4, value: 'Group'}]
    const navigate = useNavigate();
    const location = useLocation()
    const { state } = useContext(AuthContext);
    const system_timeZone = dayjs.tz.guess()
    const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
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
        <div className="w-100 d-flex flex-row list-view-template evnt_tmplt_lst_vew">
            <div className="w-15 d-flex justify-center items-center mb-30 add_tmplt_wrp" onClick={() => navigate('/add-event-templates', {state: {view: 'list', from: location.state?.from}})}>
                <div className="add_tmplt">
                    <span className="add_tmplt_icon">
                        <AddIcon/>
                    </span>
                    <span>Create New</span>
                </div>
            </div>

            <div className="w-100 tmplt_lst d-flex flex-row mb-70">
                {data?.map((item: any)=> {
                    return <div className="w-100 d-flex tmplt_list_item items-center" key={item.id}>
                    <div className="tmplt_nme">
                        {item.title}
                    </div>
                    <div className="tmplt_nme">
                    {EVENT_TYPES.filter((i) => item.eventTypeId === i.id)[0]?.value}
                    </div>
                    <div className="tmplt_nme">
                    {dayjs(item.startTime).tz(default_timeZone).format("h:mm A")}
                    </div>
                    <div className="tmplt_date">
                    {dayjs(item.date).tz(default_timeZone).format("MM/DD/YYYY")}
                    </div>
                    <div className="tmplt_act">
                        <div className="tmplt_copy" onClick={()=> duplicatePredefinedEvent(item)}>
                            <CopyIcon />
                        </div>
                        <div className="tmplt_opt">
                            <div className="tmplt_opt_icon">
                                <OptionIcon />
                                <ul className="opt_item">
                                    {/* <ViewTemplate value={item.template} text={'Preview'} view={'list'} /> */}
                                    <li onClick={() => handlePreviewTemplate(item)}>Preview</li>
                                    <li onClick={() => navigate('/edit-event-templates', {state:{data: item, view: 'list', from: location.state?.from}})}>Edit</li>
                                    <li onClick={() => { setOpenDeleteDialog(true);setTemplateId({eventTemplateId: [item.id]})}}>Delete</li>
                                </ul>
                            </div>
                            
                        </div>

                    </div>
                </div>
                })}
            </div>
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
export default ListViewEventTemplate;