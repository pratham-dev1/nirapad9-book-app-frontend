import React from 'react'
import CustomDataGrid from '../components/CustomDataGrid'
import CreateGroup from './CreateGroup'
import { useMutation, useQuery } from 'react-query'
import request from '../services/http'
import { DELETE_GROUP, GET_ALL_USER_LIST, GET_GROUP_LIST_WITH_MEMBERS } from '../constants/Urls'
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { queryClient } from '../config/RQconfig'
import showToast from '../utils/toast'
import { ToastActionTypes } from '../utils/Enums'
import Loader from '../components/Loader'

const GroupList = () => {
    const {data, isLoading, isRefetching } = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"))
    const { mutate: deleteGroup, isLoading: isDeleteLoading } = useMutation((body: object) => request(DELETE_GROUP, "delete", body),
    {
      onSuccess: () => {
        showToast(ToastActionTypes.SUCCESS, data?.message)
        queryClient.invalidateQueries('group-list');
      },
    })

    const columns: GridColDef[] = [
        {
          field: "action",
          headerName: "Actions",
          width: 200,
          renderCell: (params: GridRenderCellParams) => {

            const handleDelete = () => {
                deleteGroup({groupIds: [params.id]})
            }
            return (
              <>
                <CreateGroup formData={params.row}/>
                <DeleteOutlineOutlinedIcon onClick={handleDelete} />
              </>
            )
          }
        },
        { field: "id", headerName: "ID", width: 90 },
        {
          field: "name",
          headerName: "Group Name",
          width: 200,
        },
        {
          field: "groupMembers",
          headerName: "Members",
          width: 200,
          renderCell: (params: GridRenderCellParams) => {
            return params.value.map((item:any) => item.fullname).join(', ')
          }
        }
      ];
  return (
    <div>
        {(isDeleteLoading) && <Loader />}
        
      <CustomDataGrid
          rows={data?.data || []}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick={true}
          disableColumnMenu={true}
          rowCount={data?.count || 0}
          loading={isLoading || isRefetching}
        />
    </div>
  )
}

export default GroupList
