/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Button } from '@mui/material';
import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import LoadDataList from '../components/LoadDataList';

function Roles() {
  const url = 'api_admin/getRoles';
  const [timestamp, setTimestamp] = useState('');
  const onSelectionChanged = (data: any[]) => {
    console.log('parent received', data);
  };
  const tableColumns = [
    {
      field: 'role_name',
      headerName: 'Name',
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
    },
  ];

  const deleteButton = <Button onClick={() => {}}>click me</Button>;

  return (
    <>
      <Header showBackArrow />

      <div className="container">
        <h4 className="pageTitle">Manage Roles</h4>
        <Button component={Link} to="/addRole" variant="contained">
          {' '}
          <Add /> Add a new Role
        </Button>

        <LoadDataList
          url={url}
          timestamp={timestamp}
          tableColumns={tableColumns}
          uniqueField="role_id"
          onSelectionChanged={onSelectionChanged}
          nameField="role_name"
          deleteUrl="api_admin/role"
          editUrl="addRole"
         />
      </div>
    </>
  );
}

export default Roles;
