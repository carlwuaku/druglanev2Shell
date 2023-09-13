/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Alert, AlertTitle, CardActionArea, CardActions, CardContent, CardHeader, Typography,Button as MatButton } from "@mui/material";
import Card from "@mui/material/Card";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import Hub from '@mui/icons-material/Hub';
import { Link } from "react-router-dom";
import { COMPANY_NAME_RECEIVED, GET_SERVER_STATE, GET_SERVER_URL, RESTART_SERVER, SERVER_MESSAGE_RECEIVED, SERVER_RUNNING, SERVER_STARTING, SERVER_STATE_CHANGED, SERVER_STOPPED, SERVER_URL_RECEIVED } from "../utils/stringKeys";
import { io } from 'socket.io-client';

function ServerState() {
   const [loading, setLoading] = useState(false);
  function restartServer() {
        setLoading(true);
        window.electron.ipcRenderer.send(RESTART_SERVER);
    };
    const [serverState, setServerState] = useState("...");
    const [serverUrl, setServerUrl] = useState(null);

    const title = "Server State";
    const subtitle = "Shows the state of the main application server";
    const restartButton = <Button loading={loading} onClick={() => {restartServer()}} label="Restart" icon="pi pi-refresh" />




    useEffect(() => {
        const handleServerStateReceived = (event: any, data: any) => {
            setLoading(false)
            setServerState(data.data)
        }
        window.electron.ipcRenderer.send(GET_SERVER_STATE);

        window.electron.ipcRenderer.on(SERVER_STATE_CHANGED, handleServerStateReceived);




        const handleServerUrlReceived = (event: any, data: any) => {
            setServerUrl(data);
            const socket = io(data);

        }

        window.electron.ipcRenderer.send(GET_SERVER_URL);

        window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);




    }, [])
    switch (serverState) {
        case SERVER_RUNNING:
            return <Card >
                <CardHeader
                    avatar={
                        <Hub color="primary" />
                    }
                    title="Open the main application"

                 />
                <CardContent>
                    <h5>Welcome to the Server!</h5>
                    <p>Scroll down to manage the users, permissions, backups, and other system settings.</p>

                    <p className="text-primary">
                        To make sales, manage your inventory, or do any other day-to-day activities,&nbsp;
                        <a className="unsetAll" href={`${serverUrl}/client`} target="_blank" rel="noopener noreferrer">
                            <MatButton variant="contained" size="small">
                                click here</MatButton>
                        </a>&nbsp; to login to the main application.

                    </p>
                    <p>
                        To run the main application on other computers or phones connected to the same network , open a browser (preferably
                        Google Chrome, Microsoft Edge or Firefox) on the device,
                        and enter the following url in the address bar:
                            <br />
                        {serverUrl}/client.
                    </p>




                </CardContent>
                <CardActions  />



            </Card>
        case SERVER_STARTING:
            return <Card >
                <CardContent>
                    <Alert severity="warning">
                        <AlertTitle>{serverState}</AlertTitle>
                        <b>
                            Please wait for the server to get fired up!
                        </b>
                    </Alert>
                </CardContent>


            </Card>

        default:
            return <Card >
                <CardContent>
                    <Alert severity="error">
                        <AlertTitle>{serverState}</AlertTitle>
                        <b>
                            The server process has stopped. Use the controls to restart it
                        </b>
                    </Alert>
                </CardContent>
                    <CardActions>
                    <Button loading={loading} onClick={() =>{restartServer()}} label="Restart" icon="pi pi-refresh" />
                    </CardActions>

            </Card>


    }
}

export default ServerState
