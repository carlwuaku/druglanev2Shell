/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { Link, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthUser } from 'react-auth-kit';
import {
  Backup,
  CloudDownload,
  CloudSync,
  DisplaySettings,
  LockPerson,
  NotificationsOutlined,
  Person2Outlined,
  Settings,
} from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Header from '../components/Header';
import {
  BACKUP_TIME,
  GET_PREFERENCES,
  GET_SERVER_URL,
  SERVER_URL_RECEIVED,
} from '../utils/stringKeys';
import ServerState from '../components/ServerState';
import ServerLogs from '../components/ServerLogs';
import { getData } from '../utils/network';
import AppConfig from '../components/AppConfig';
import DashboardTile from '../components/DashboardTile';
import SettingItem from '../components/SettingItem';
import { ACTIVATION_STATE_RECEIVED, GET_ACTIVATION_STATE } from 'main/utils/stringKeys';
// import logo from '@/app/assets/logo.png';
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const times = [
  { label: '12 AM', value: '0' },
  { label: '1 AM', value: '1' },
  { label: '2 AM', value: '2' },
  { label: '3 AM', value: '3' },
  { label: '4 AM', value: '4' },
  { label: '5 AM', value: '5' },
  { label: '6 AM', value: '6' },
  { label: '7 AM', value: '7' },
  { label: '8 AM', value: '8' },
  { label: '9 AM', value: '9' },
  { label: '10 AM', value: '10' },
  { label: '11AM', value: '11' },
  { label: '12PM', value: '12' },
  { label: '1 PM', value: '13' },
  { label: '2 PM', value: '14' },
  { label: '3 PM', value: '15' },
  { label: '4 PM', value: '16' },
  { label: '5 PM', value: '17' },
  { label: '6 PM', value: '18' },
  { label: '7 PM', value: '19' },
  { label: '8 PM', value: '20' },
  { label: '9 PM', value: '21' },
  { label: '10 PM', value: '22' },
  { label: '11 PM', value: '23' },
];

function Index() {
  const auth = useAuthUser();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('Company Name');
  const openPreferences = () => {
    window.electron.ipcRenderer.send(GET_PREFERENCES);
  };

  useEffect(() => {
    const handleServerUrlReceived = async (data: any) => {
      const serverUrl = data;

      // get the settings
      const getSettings = await getData<any>({
        url: `${serverUrl}/api_admin/settings`,
        token: auth()?.token,
      });
      setCompanyName(getSettings.data.company_name);
    };

    const handleActivationStateReceived = async (data: any) => {
      console.log('activation state', data)
      if(!data){
        //navigate to activation page
        navigate('/activate')
      }


    };

    window.electron.ipcRenderer.send(GET_SERVER_URL);
    window.electron.ipcRenderer.send(GET_ACTIVATION_STATE);

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);
    window.electron.ipcRenderer.on(ACTIVATION_STATE_RECEIVED, handleActivationStateReceived);
  }, []);

  return (
    <>
      <Header />

      {/* <Button><Link to="/activate">Activation</Link></Button>
      <Button><Link to="/settings">settngs</Link></Button> */}
      <Box className="container">
        <h3>Druglane Management System</h3>
        <h4>Licensed to {companyName}</h4>
        <Grid container spacing={2}>
          <Grid xs={12} md={12}>
            <ServerState />
            <SettingItem
              key={BACKUP_TIME}
              description="Backup time"
              name={BACKUP_TIME}
              type="select"
              options={times}
            />
          </Grid>

        </Grid>
        <Grid container spacing={2}>
          <Grid lg={3} md={3} sm={6}>
            <Link to="" className="unsetAll link ">
              <DashboardTile
                title="Backup your database now"
                subtitle="Create a backup file of your database"
                icon={<Backup sx={{ fontSize: 30 }} />}
              />
            </Link>
          </Grid>
          <Grid lg={3} md={3} sm={6}>
            <Link to="backups" className="unsetAll link">
              <DashboardTile
                title="Restore data from a backup"
                subtitle={
                  "Revert your database to a previous state if there's been an error "
                }
                icon={<CloudSync sx={{ fontSize: 30 }} />}
              />
            </Link>
          </Grid>
          <Grid lg={3} md={3} sm={6}>
            <Link to="settings" className="unsetAll link">
              <DashboardTile
                title="Edit system settings"
                subtitle="Edit the phone, email, address, etc"
                icon={<DisplaySettings sx={{ fontSize: 30 }} />}
              />
            </Link>
          </Grid>
          <Grid lg={3} md={3} sm={6}>
            <Link to="users" className="unsetAll link">
              <DashboardTile
                title="Manage system users"
                subtitle="Add, edit or view users of the system"
                icon={<Person2Outlined sx={{ fontSize: 30 }} />}
              />
            </Link>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid lg={3} md={3} sm={6}>
            <Link to="roles" className="unsetAll link ">
              <DashboardTile
                title="User Permissions"
                subtitle="Set/disable permissions for user groups"
                icon={<LockPerson sx={{ fontSize: 30 }} />}
              />
            </Link>
          </Grid>
          <Grid lg={3} md={3} sm={6}>
            <Link to="" className="unsetAll link">
              <DashboardTile
                title="Manage Automatic Reminders"
                subtitle={
                  "Revert your database to a previous state if there's been an error "
                }
                icon={<NotificationsOutlined sx={{ fontSize: 30 }} />}
              />
            </Link>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Index;
