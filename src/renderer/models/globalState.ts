/* eslint-disable prettier/prettier */
import React from 'react';

export interface GlobalState {
  serverUrl: string;
  companyName: string;
  setServerUrl: React.Dispatch<React.SetStateAction<any>>;
  setCompanyName: React.Dispatch<React.SetStateAction<any>>;
}
