/* eslint-disable prettier/prettier */
import { Permissions } from './permissions';

export interface IRoles {
  role_name: string;
  role_id: string;
  description: string;
  Permissions: Permissions[];
  selectedPermissions: string[];
}
