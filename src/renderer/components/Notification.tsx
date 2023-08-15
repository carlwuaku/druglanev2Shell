/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Alert, IconButton } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { NotificationSeverity } from '../models/notificationSeverityInterface';

function Notification({
  message,
  open,
  severity,
}: {
  message: string;
  open: boolean;
  severity: NotificationSeverity;
}) {
  const [_open, setOpen] = React.useState(open);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={_open}
      autoHideDuration={6000}
      onClose={handleClose}
      action={action}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;
