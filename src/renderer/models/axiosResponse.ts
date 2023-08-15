/* eslint-disable prettier/prettier */
import { Permissions } from './permissions';

export interface saveSettingsResponse {
  status: string;
  data: string[];
  statusText: string;
}

export interface genericAxiosGetResponse {
  status: string;
  data: any;
  statusText: string;
}

export interface genericAxiosPostResponse {
  status: string;
  data: any;
  statusText: string;
}

export interface getPermissionsResponse {
  status: string;
  data: Permissions[];
  statusText: string;
}

export interface saveRoleResponse {
  status: string;
  data: { role_id: string };
  statusText: string;
}
