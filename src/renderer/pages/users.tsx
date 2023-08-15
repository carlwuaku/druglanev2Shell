/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@mui/material';
import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import LoadDataList from '../components/LoadDataList';

function Users() {
  const url = 'api_admin/getUsers';
  const [timestamp, setTimestamp] = useState('');
  const tableColumns = [
    { headerName: 'Full Name', field: 'display_name', flex: 1 },
    { headerName: 'Username', field: 'username', flex: 1 },
    { headerName: 'Email', field: 'email', flex: 1 },
    { headerName: 'Role', field: 'role_name', flex: 1 },
    { headerName: 'Active', field: 'active', flex: 1 },
    { headerName: 'Phone', field: 'phone', flex: 1 },
  ];
  const onSelectionChanged = (data: any[]) => {
    console.log('parent received', data);
  };
  return (
    <>
      <Header showBackArrow />

      <div className="container">
        <h4 className="pageTitle">Manage Users</h4>
        <Button component={Link} to="/addUser" variant="contained">
          {' '}
          <Add /> Add a new User
        </Button>

        <LoadDataList
          url={url}
          timestamp={timestamp}
          tableColumns={tableColumns}
          uniqueField="id"
          onSelectionChanged={onSelectionChanged}
          nameField="display_name"
          deleteUrl="api_admin/user"
          editUrl="addUser"
        />
      </div>
    </>
  );
}

export default Users;
