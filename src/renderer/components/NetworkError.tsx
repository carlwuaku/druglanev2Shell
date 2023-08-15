/* eslint-disable prettier/prettier */
import { Card } from 'primereact/card';
import React from 'react';

function NetworkError({ error }: { error: Error }) {
  return (
    <Card
      header="Network Error"
      subTitle="Please check your connection and try again"
    >
      {error.message}
    </Card>
  );
}

export default NetworkError;
