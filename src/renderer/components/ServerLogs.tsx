/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Card } from 'primereact/card';
import React, { useEffect, useState } from 'react';
import {
  GET_SERVER_STATE,
  GET_COMPANY_NAME,
  SERVER_MESSAGE_RECEIVED,
  SERVER_STATE_CHANGED,
  COMPANY_NAME_RECEIVED,
} from '../utils/stringKeys';

interface logItem {
  time: string;
  data: string;
}

function ServerLogs() {
  const [logs, setLogs] = useState<logItem[]>([]);
  useEffect(() => {
    window.electron.ipcRenderer.send(GET_SERVER_STATE);

    window.electron.ipcRenderer.send(GET_COMPANY_NAME);

    window.electron.ipcRenderer.on(SERVER_MESSAGE_RECEIVED, (event: any, data: any) => {
      // console.log(SERVER_MESSAGE_RECEIVED, data)
      // add it to the server logs
      setLogs([...logs, data]);
      console.log(logs, typeof logs);
    });

    window.electron.ipcRenderer.on(SERVER_STATE_CHANGED, (event: any, data: any) => {
      // console.log(SERVER_STATE_CHANGED, data)
      // add it to the server logs
      setLogs([...logs, data]);
      console.log(logs, typeof logs);
    });
  }, []);
  return (
    <div>
      <h5>Server Logs</h5>
      {logs.map((log) => {
        return (
          <Card key={Math.random()} footer={log.time}>
            {log.data}{' '}
          </Card>
        );
      })}
    </div>
  );
}

export default ServerLogs;
