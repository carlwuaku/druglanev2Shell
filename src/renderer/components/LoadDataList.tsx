/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable react/destructuring-assignment */
import React, { useContext, useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { Toast } from 'primereact/toast';
import {
  Backdrop,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridRowSelectionModel,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Link } from 'react-router-dom';
import { useAuthUser, useAuthHeader } from 'react-auth-kit';

// import GlobalContext from '../global/global';
import Loading from './Loading';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import { deleteData, getData, postData } from '../utils/network';

function LoadDataList(props: {
  timestamp: string;
  url: string;
  tableColumns: {
    field: string;
    headerName: string;
    width?: number;
    editable?: boolean;
    sortable?: boolean;
    flex?: number; // set to 1 to take up all available space
  }[];
  uniqueField: string;
  nameField: string;
  onSelectionChanged: (selectedData: any[]) => void;
  editUrl: string;
  deleteUrl: string;
}) {
  const auth = useAuthUser();
  const objects = useRef<any[]>([]);
  const serverUrl = useRef<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState(props.tableColumns);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteAlertTitle, setDeleteAlertTitle] = useState('');
  const [deleteAlertMessage, setDeleteAlertMessage] = useState('');
  const showOverlayLoading = useRef<boolean>(false);
  const deleteId = useRef<string>('');
  // const appData = useContext(GlobalContext);
  const handleClose = () => {
    setOpenDialog(false);
    deleteId.current = '';
  };
   const toast = useRef<Toast>(null);

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  };
  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  };


  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getData<any[]>({
        url: `${serverUrl.current}/${props.url}`,
        token: auth()?.token,
      });

      objects.current = response.data;
      setLoading(false);
    } catch (error) {
      showError(`error occurred getting data: ${error}`);
      setLoading(false);
    }
  };



  const handleSelectionModelChange = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails
  ) => {
    setSelectedData(rowSelectionModel);
    const selectedIDs = new Set(rowSelectionModel);
    const selectedRowData = objects.current.filter((row) => {
      return selectedIDs.has(row[props.uniqueField]);
    });
    props.onSelectionChanged(selectedRowData); // Invoke the callback with the selected data
  };

  const handleClickDelete = (id: string) => {
    const object = objects.current.find((obj) => {
      return obj[props.uniqueField] === id;
    });
    deleteId.current = id;
    setDeleteAlertTitle(`Delete item - ${object[props.nameField]}`);
    setDeleteAlertMessage(`Are you sure you want to delete this item?`);
    setOpenDialog(true);
  };

  const deleteItem = async () => {
    try {
      showOverlayLoading.current = true;
      await deleteData<any[]>({
        url: `${serverUrl.current}/${props.deleteUrl}/${deleteId.current}`,
        token: auth()?.token,
      });
      showOverlayLoading.current = false;
      showSuccess(`Deleted successfully!`);
      handleClose();
      loadData();
    } catch (error) {
      showOverlayLoading.current = false;
      showError(`error occurred getting data: ${error}`);
    }
  };

  useEffect(() => {
    window.electron.ipcRenderer.send(GET_SERVER_URL);

    const handleServerUrlReceived = async ( data: any) => {
      serverUrl.current = data;
      loadData();
    };

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);

  }, []);

  // every time the timestamp changes, refresh the data
  useEffect(() => {
    setTableColumns((currentVal) => {
      return [
        ...props.tableColumns,
        {
          field: 'actions',
          headerName: 'Actions',

          renderCell: (params: any) => (
            <>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleClickDelete(params.row[props.uniqueField])}
              >
                <Delete />
              </IconButton>
              <IconButton
                component={Link}
                to={`/${props.editUrl}/${params.row[props.uniqueField]}`}
                size="small"
                color="primary"
                onClick={() => console.log(params)}
              >
                <Edit />
              </IconButton>
            </>
          ),
        },
      ];
    });
  }, [props.timestamp, props.url]);




  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Card>
          <CardContent>
            <DataGrid
              rows={objects.current}
              columns={tableColumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 50,
                  },
                },
              }}
              pageSizeOptions={[5]}
              rowSelectionModel={selectedData}
              onRowSelectionModelChange={handleSelectionModelChange}
              disableRowSelectionOnClick
              getRowId={(row) => row.id || row[props.uniqueField]}
            />
          </CardContent>
        </Card>
      )}
      <Toast ref={toast} />

      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{deleteAlertTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {deleteAlertMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
          <Button variant="contained" onClick={deleteItem}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showOverlayLoading.current}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default LoadDataList;
