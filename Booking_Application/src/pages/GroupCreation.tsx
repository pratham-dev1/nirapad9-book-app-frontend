import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTextField from "../components/CustomTextField";
import { useMutation, useQuery } from "react-query";

import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import { RadioGroup, Radio, FormControl, FormControlLabel    } from "@mui/material";
import { useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import GroupList from "./GroupList";
import GridIcon from "../styles/icons/GridIcon";
import ListIcon from "../styles/icons/ListIcon";
import GroupGridView from "./group-creation/GroupGridView";
import GroupListView from "./group-creation/GroupListView";
import { DELETE_GROUP, DUPLICATE_GROUP, GET_GROUP_LIST_WITH_MEMBERS } from "../constants/Urls";
import request from "../services/http";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import { queryClient } from "../config/RQconfig";
import Loader from "../components/Loader";
import BackArrowIcon from "../styles/icons/BackArrowIcon";


const GroupCreation: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [view, setView] = useState<any>(location.state?.view || 'grid');
    const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
    const {data, isLoading, isRefetching } = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"))
    const { mutate: deleteGroup, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_GROUP, "delete", body),
    {
      onSuccess: () => {
        setOpenDeleteDialog(false)
        showToast(ToastActionTypes.SUCCESS, data?.message)
        queryClient.invalidateQueries('group-list');
      },
    })
    const { mutate: duplicateGroup, isLoading: isDuplicateGroupLoading } = useMutation((body: object) => request(DUPLICATE_GROUP, "post", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('group-list')
      },
    })

    return (
        <div className="page-wrapper">
            {(isDeleteLoading || isLoading || isDuplicateGroupLoading) && <Loader />}
            <div className="d-flex justify-between items-center mb-20">
                <h1>
                  <span className='back-to mr-10 cursur-pointer' onClick={() => navigate(location.state?.from || -1)}><BackArrowIcon /></span>
                  Group Creation
                </h1>
                <div className="view-toggle">
                  <span 
                    className={view === 'grid' ? 'active-view' : ''} 
                    onClick={() => setView('grid')}
                  >
                    <GridIcon /> Grid
                  </span>
                  <span 
                    className={view === 'list' ? 'active-view' : ''} 
                    onClick={() => setView('list')}
                  >
                    <ListIcon /> List
                  </span>
                </div>
            </div>

            {view === 'grid' ?
              <GroupGridView data={data?.data || []} deleteGroup={deleteGroup} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} duplicateGroup={duplicateGroup} isDeleteLoading={isDeleteLoading}/>
            : 
              <GroupListView data={data?.data || []} deleteGroup={deleteGroup} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} duplicateGroup={duplicateGroup} isDeleteLoading={isDeleteLoading}/>
            }
        </div>
    )
}

export default GroupCreation;