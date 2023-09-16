/* eslint-disable prettier/prettier */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable camelcase */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import {
  List,
  ListItem,
  IconButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Card,
  Button,
  CardContent,
  Typography,
  Dialog,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  CardHeader,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import Edit from '@mui/icons-material/Edit';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  GET_PREFERENCE,
  PREFERENCE_RECEIVED,
  PREFERENCE_SET,
  RESTART_APPLICATION,
  SET_PREFERENCE,
} from '../utils/stringKeys';

function SettingItem(props: {
  name: string;
  type: string;
  options?: { label: string; value: any }[];
  description: string;
}) {
  const [editing, setEditing] = useState(false);
  const [new_value, setValue] = useState('');
  const [currentValue, setCurrentValue] = useState<any>('');
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = React.useState(false);

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
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setValue(currentValue);
    setOpen(false);
  };

  useEffect(() => {
    // get the value of the setting
    const handlePreferenceReceived = (
      event: any,
      data: { name: string; value: string }
    ) => {
      console.log(props.name, data);
      if (data.name === props.name) {
        setCurrentValue(data.value);
        setValue(data.value);
      }
    };
    window.electron.ipcRenderer.send(GET_PREFERENCE, { key: props.name });

    window.electron.ipcRenderer.on(PREFERENCE_RECEIVED, handlePreferenceReceived);
  }, []);

  // const editButton = <Button
  //     onClick={setEditing(true)}
  //     label="Edit" icon="pi pi-edit"></Button>;
  function getInput(type: string) {
    switch (type) {
      case 'select':
        return (
          <>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={new_value}
              onChange={(e: SelectChangeEvent) => setValue(e.target.value)}
            >
              {props.options?.map((option, i) => (
                <MenuItem key={i} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </>
        );

      default:
        return (
          <TextField
            value={new_value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
    }
  }

  function save() {
    window.electron.ipcRenderer.send(SET_PREFERENCE, { key: props.name, value: new_value });
  }

  useEffect(() => {
    window.electron.ipcRenderer.on(PREFERENCE_SET, (event, data) => {
      if (data.success) {
        setValue(new_value);
        setOpen(false);

        showSuccess(data.message);
        // wait 2 seconds and restart the app
        setTimeout(() => {
          window.electron.ipcRenderer.send(RESTART_APPLICATION);
        }, 2000);
      } else {
        setOpen(false);

        showError(data.message);
      }
    });
  }, []);

  return (
    <>

            <IconButton
              onClick={handleClickOpen}
              color="secondary"
              edge="end"
              aria-label="edit"
            >
              <Edit />
            </IconButton>


      <Toast ref={toast} />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{`Edit ${props.name}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{props.description}</DialogContentText>

          {getInput(props.type)}
          <Alert severity="info">
            The application will restart automatically once you save
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={() =>{save()}}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SettingItem;
