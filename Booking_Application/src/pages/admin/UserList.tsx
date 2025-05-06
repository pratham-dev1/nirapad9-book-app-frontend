import { ChangeEvent, useContext, useEffect, useState, } from "react";
import Box from "@mui/material/Box";
import { GridColDef, GridPagination, GridPaginationModel, GridRenderCellParams, GridRowSelectionModel, GridSortDirection, GridSortModel, GridToolbarContainer } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import request from "../../services/http";
import { GET_USER_LIST, DELETE_USERS, RESTORE_USER, CREATE_BULK_USERS, RESEND_VERIFICATION_LINK } from "../../constants/Urls";
import dayjs, { Dayjs } from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, Drawer } from "@mui/material";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomButton from "../../components/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import CustomTextField from "../../components/CustomTextField";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import TuneIcon from "@mui/icons-material/Tune";
import CustomDataGrid from "../../components/CustomDataGrid";
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateUser from "./CreateUser";
import RestoreIcon from '@mui/icons-material/Restore';
import { makeStyles } from '@mui/styles';
import { ToastActionTypes } from "../../utils/Enums";
import showToast from "../../utils/toast";
import ViewUserDetails from "./ViewUserDetails";
import VerificationIcon from '@mui/icons-material/DomainVerification';
import WarningIcon from "../../styles/icons/WarningIcon";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import ImportIcon from "../../styles/icons/ImportIcon";
import DownloadIcon from "../../styles/icons/DownloadIcon";
import AddIcon from "../../styles/icons/AddIcon";
import AddUserIcon from "../../styles/icons/AddUserIcon";
import PersonIcon from "../../styles/icons/PersonIcon";
import TextField from '@mui/material/TextField';
import { AuthContext } from "../../context/auth/AuthContext";

const useStyles = makeStyles({
  rowWithLineThrough: {
    textDecoration: 'line-through',
  },
});


const History = () => {
  const classes = useStyles();
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openInviteUserDialog, setOpenInviteUserDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openRestoreUserDialog,setOpenRestoreUserDialog] = useState<boolean>(false);
  const [openFailedUserDialog, setOpenFailedUserDialog] = useState(false);
  const [failedRecords, setFailedRecords] = useState([]);
  const [openVerificationLinkUserDialog,setOpenVerificationLinkUserDialog] = useState<boolean>(false);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [formData, setFormData] = useState<any>();
  const [params,setParams ]= useState({
    page: 0,
    pageSize: 20,
    searchText: "",
    sortingColumn: "username",
    sortingOrder: "desc"
  });
  const {data} = useQuery(['user-list',params],()=>request(GET_USER_LIST,"get",params))
  const queryClient = useQueryClient()
  const { mutate: deleteUsers } = useMutation((body: object) => request(DELETE_USERS, "delete", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-list');
      },
    })

  const { mutate: restoreUsers } = useMutation((body: object) => request(RESTORE_USER, "put", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-list');
      },
    })

  const {mutate: saveBulkUsers} = useMutation((body: object) => request(CREATE_BULK_USERS, 'post', body),
  {
    onSuccess: (data) => {
      if (data?.success){
        showToast(ToastActionTypes.SUCCESS, data.message)
      }
      if(data?.warning && data?.failedRecords) {
        setFailedRecords(data.failedRecords)
        setOpenFailedUserDialog(true)
      }
      queryClient.invalidateQueries('user-list');
    },
  })

  const { mutate: handleResendVerificationLink } = useMutation((body: object) => request(RESEND_VERIFICATION_LINK, "post", body), {
    onSuccess: (data) => {
        if (data.success) {
            setOpenVerificationLinkUserDialog(false)
            setRowSelectionModel([])
            showToast(ToastActionTypes.SUCCESS, data.message)
        }
    }
});

const handlePagination = (pageInfo: GridPaginationModel) => {
  setRowSelectionModel([])
  setParams((prev)=> ({...prev,...pageInfo}))
}

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Actions",
      width: 160,
      renderCell: (params: GridRenderCellParams) => {
        const handleEditClick = () => {
          setFormData(params.row);
          setOpenDialog(true);
        };
        const handleDeleteClick = () => {
          setOpenDeleteDialog(true); 
          setRowSelectionModel([params.id])
        };
        const handleRestoreUser = () => {
          setOpenRestoreUserDialog(true); 
          setRowSelectionModel([params.id])
        };
        const handleVerificationLinkSend = () => {
          setOpenVerificationLinkUserDialog(true);
          setRowSelectionModel([params.id])
        };
        return (
          <>
            <EditOutlinedIcon onClick={handleEditClick} className="cursur-pointer" />
            <ViewUserDetails className="cursur-pointer" userDetails={params.row} />
            {!params.row.isDeleted ?
              <DeleteOutlineOutlinedIcon onClick={handleDeleteClick} className="cursur-pointer" />
              : <RestoreIcon onClick={handleRestoreUser} className="cursur-pointer" />
            }
          {params.row.user_verifications.some((verification:any) => verification.email === params.row.email && verification.isAccountVerified) ? null : <VerificationIcon onClick={handleVerificationLinkSend} className="cursur-pointer" />}
          </>
        )
      }
    },
    { field: "id", headerName: "ID", width: 140, sortable: false, },
    {
      field: "username",
      headerName: "Username",
      width: 200,
    },
    {
      field: "fullname",
      headerName: "Fullname",
      width: 250,
      sortable: false,
    },
    {
      field: "email",
      headerName: "Email",
      width: 330,
      sortable: false,
    },
    {
      field: "usertype",
      headerName: "User Type",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        return params.value.userType;
      }
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        let createdAt = params.row.createdAt;
        return createdAt ? dayjs(createdAt).tz(default_timeZone).format("DD/MM/YYYY h:mm A") : null
      }
    },
    {
      field: "lastLoginTimeStamp",
      headerName: "Last Login Time",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        let lastLoginTime = params.row.lastLoginTimeStamp;
        return lastLoginTime ? dayjs(lastLoginTime).tz(default_timeZone).format("DD/MM/YYYY h:mm A") : null
      }
    },
  ];

  const handleConfirmDelete = () => {
    deleteUsers({ ids: rowSelectionModel });
    setOpenDeleteDialog(false);
  };

  const handleConfirmRestoreUsers = () => {
    restoreUsers({ userIds: rowSelectionModel });
    setOpenRestoreUserDialog(false);
  };
   const handleConfirmVerificationLinkSend = () => {
    handleResendVerificationLink({userId: rowSelectionModel[0]})
    setOpenRestoreUserDialog(false);
   }

  const handleCreateBulkUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File
    // if (file) {
    //   const fileExtention = file.name.split('.')[1]
    //   if (fileExtention === 'csv') {
    //     Papa.parse(file, {
    //       complete: function (results) {
    //         let data = results.data.splice(1) as []
    //         let columns = results.data[0] as any[]
    //         let userData = data?.map((item) => {
    //           return {
    //             [columns[0]]: item[0] || '',
    //             [columns[1]]: item[1] || '',
    //             [columns[2]]: item[2] || '',
    //             [columns[3]]: item[3] || ''
    //           }
    //         })
    //         saveBulkUsers({ userData })
    //       }
    //     }
    //     )
    //   }
    //   else if (fileExtention !== "xls" || fileExtention !== "xlsx" as any) {
      // const reader = new FileReader();
      // reader.onload = (e) => {
      //   const data = e.target?.result;
      //   const workbook = XLSX.read(data, { type: "binary" });
      //   const sheetName = workbook.SheetNames[0];
      //   const worksheet = workbook.Sheets[sheetName];
      //   const json = XLSX.utils.sheet_to_json(worksheet);
      //   saveBulkUsers({ userData: json })
      // };
      // reader.readAsBinaryString(file);
  // }
        const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const fileData = reader.result as string
        const base64Data = fileData?.split(',')[1]
        saveBulkUsers({csvFileBase64Data: base64Data})
        };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      e.target.value = '';
  }

 const handleSortModelChange =(sortInfo: GridSortModel) => {
    setParams((prev)=>({...prev,sortingOrder: sortInfo[0].sort as string}))
  };

  const CustomPagination = () => {
    const pageCount = Math.ceil(data?.totalCount / params.pageSize) || 1;
    return (
      <div style={{
        display: "flex", marginRight: 20, justifyContent: "center", alignItems: "center"
      }}>
        <GridPagination
          sx={{
            height: 60,
          }}
        />
        <div style={{ height: "60px", paddingTop: "15px", paddingLeft: "10px" }}>
          Page: {params.page + 1} of {pageCount}
        </div>
      </div>
    );
  }

 const CustomToolbar = () => { 
    return (
 
        <div className="tbl-filter-col filter-toolbar" style={{backgroundColor:"#f1f2f6",height:60,display:"flex",alignItems:"center"}}>
          <div className="w-100 d-flex justify-between items-center">
            <div className="w-25">
              <div className="w-100">
                <CustomTextField
                  label="Search user..."
                  variant="outlined"
                  className="w-100"
                  size="small"
                  onChange={(e) =>  setParams({ ...params, searchText: e.target.value })}
                  sx={{ mr: 2 }}
                />
              </div>
            </div>

            <div className="w-70 d-flex align-end justify-end">
              {rowSelectionModel.length > 0 ? (
                <>
                  <CustomButton
                    label={`${rowSelectionModel.length > 1 ? "Delete All" : "Delete"}`}
                    size="small"
                    className="primary_btns"
                    onClick={() => setOpenDeleteDialog(true)}
                    sx={{ mx: 2 }}
                  />
                  <CustomButton
                    label={`${rowSelectionModel.length > 1 ? "Restore All" : "Restore"}`}
                    size="small"
                    className="primary_btns"
                    onClick={() => setOpenRestoreUserDialog(true)}
                    sx={{ mx: 2 }}
                  />
                </>
              ) : (
                <>
                  <Button component="label" variant="contained" className="prmy_btn" color="primary" size="small"  >
                    <span className="d-flex mr-10"><ImportIcon /></span> Upload CSV
                    <input type="file" accept=".csv" onChange={handleCreateBulkUser} hidden />
                  </Button>
                  <Button variant="contained"  className="prmy_btn" size="small" href="/CreateBulkUser.csv" download> 
                    <span className="d-flex mr-10"><DownloadIcon /></span> Download CSV
                  </Button>

                  <Button variant="contained"  className="prmy_btn" size="small" onClick={() => { setOpenDialog(true); setFormData(null)}}> 
                    <span className="d-flex mr-10"><AddUserIcon /></span> Create New User
                  </Button> 
                  <Button  className="primary_btns user_invite_btn" size="small" onClick={() => { setOpenInviteUserDialog(true);}}> 
                    <span className="d-flex mr-10"><PersonIcon /></span> User Invite
                  </Button> 
                  
                </>
              )}
            </div>
          </div>  
          
          {/* <CustomButton
            label="More Filter"
            color="inherit"
            className="prmy_btn"
            size="small"
            onClick={() => setOpenDrawer((prev) => !prev)}
            startIcon={<TuneIcon />}
            sx={{ mx: 2 }}
          /> */}
      
        </div>
    );
  };

  const getRowClassName = (params: any) => {
    return params.row.isDeleted ? classes.rowWithLineThrough : '';
  };


  return (
    <>
      <div className="user-table-wrapper">
        {CustomToolbar()}
        <CustomDataGrid
          rows={data?.data || []}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick={true}
          disableColumnMenu={true}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
          // slots={{ toolbar: CustomToolbar }}
          getRowClassName={getRowClassName}
          pagination
          paginationModel={{page: params.page, pageSize: params.pageSize}}
          paginationMode="server"
          pageSizeOptions={[20,50,100]}
          onPaginationModelChange={handlePagination}
          sortModel={[{ field: `username`, sort: params.sortingOrder as GridSortDirection }]}
          sortingOrder={['desc', 'asc']}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          slots={{pagination: CustomPagination}}
          rowCount={data?.totalCount || 0}
        />
      </div>
      <Drawer
        anchor={"right"}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        className="right-slide-popup"
        variant="persistent"
      >
        <Box sx={{ width: 250 }} role="presentation">
          <CloseIcon
            className="pointer"
            sx={{ float: "right", my: 2, mx: 2 }}
            onClick={() => setOpenDrawer(false)}
          />
        </Box>
      </Drawer>

      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="edit-user-popup"
      >
        <div className="popup-header">
          <h2>User Details</h2>
          <CloseIcon onClick={() => setOpenDialog(false)} />
        </div>
        
        <DialogContent>
          <CreateUser formData={formData} setOpenDialog={setOpenDialog} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="confirm-popup"
      >
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Delete Record?</span></h2>
          <CloseIcon onClick={() => setOpenDeleteDialog(false)} />
        </div>
        {/* <CloseIcon  onClick={() => setOpenDeleteDialog(false)} /> */}
        <DialogContent>
          <h3 className="text-center">Are you sure you want to delete the selected users?</h3>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleConfirmDelete} label="Delete" className="primary_btns" />
          <CustomButton onClick={() => setOpenDeleteDialog(false)} className="secondary_btns" label="Cancel" />
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRestoreUserDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Please Confirm</span></h2>
          <CloseIcon onClick={() => setOpenRestoreUserDialog(false)} />
        </div>
        <DialogContent>
          <h3 className="text-center">Are you sure you want to restore the selected users?</h3>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleConfirmRestoreUsers} className="primary_btns" label="Confirm" />
          <CustomButton onClick={() => setOpenRestoreUserDialog(false)} className="secondary_btns" label="cancel" />
        </DialogActions>
      </Dialog>

      <Dialog open={openInviteUserDialog}> 
          <div className="popup-header">
              <h2>Invite User</h2>
              <CloseIcon onClick={() => setOpenInviteUserDialog(false)} />
          </div>
          <DialogContent>
            <div className="w-100 mw-500 d-flex flex-column align-start">
              <h3 className="font-blod">Invite teammates</h3>
              <TextField className="w-100 mb-30" placeholder="Enter email to invite person"/>
              <button className="MuiButtonBase-root primary_btns"> Send</button> 
            </div>
          </DialogContent>
      </Dialog>

      <Dialog
        open={openFailedUserDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <b>These users could not save ({failedRecords.length})</b> 
          {failedRecords.map((item: any, index: number)=>{
            return (
              <li key={index}>
              <div>{JSON.stringify(item.userData)} - <span style={{color:"red"}}>{item.message}</span></div>
              </li>
            )
          })}
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={() => setOpenFailedUserDialog(false)} className="primary_btns" label="ok" />
        </DialogActions>
      </Dialog>
      <Dialog
        open={openVerificationLinkUserDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="popup-header">
          <h2><WarningIcon /> <span className="pl-10">Please Confirm</span></h2>
          <CloseIcon onClick={() => setOpenVerificationLinkUserDialog(false)} />
        </div>
        <DialogContent>
          <h3 className="text-center">Are you sure you want to send the verification link to selected users?</h3>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleConfirmVerificationLinkSend} label="Confirm" className="primary_btns" />
          <CustomButton onClick={() => setOpenVerificationLinkUserDialog(false)}  label="cancel" className="secondary_btns" />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default History;
