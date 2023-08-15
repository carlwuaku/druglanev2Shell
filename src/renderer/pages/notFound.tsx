/* eslint-disable prettier/prettier */
import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container">
      <div className="flex flex-column gap-3 justify-content-center centeredField">
        <h3>Page Not Found</h3>

        <Button variant="contained" component={Link} to="/">
          Go Back To The Home Page
        </Button>
      </div>
    </div>
  );
}
