/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card, CardContent, Checkbox } from '@mui/material';
import { classNames } from 'primereact/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthUser } from 'react-auth-kit';
import { getData, postData } from '../utils/network';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import {
  getPermissionsResponse,
  saveRoleResponse,
  saveSettingsResponse,
} from '../models/axiosResponse';
import Header from '../components/Header';
import { Permissions } from '../models/permissions';
import Loading from '../components/Loading';
import { IRoles } from '../models/roles';

function AddRole() {
  const auth = useAuthUser();
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const serverUrl = useRef('');
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const selectedPermissions = useRef<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);
  const { id } = useParams();
  const [rolePermissions, setRolePermissions] = useState<Permissions[]>([]);
  const [loadedExistingRole, setLoadedExistingRole] = useState<boolean>(false);

  const toast = useRef<Toast>(null);

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  };
  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  };

  const formik = useFormik<IRoles>({
    initialValues: {
      role_name: '',
      description: '',
      Permissions: [],
      role_id: '',
      selectedPermissions: [],
    },
    validate: (values: IRoles) => {
      const errors: FormikErrors<IRoles> = {};
      if (!values.role_name) {
        errors.role_name = 'The name is required';
      }
      if (!values.description) {
        errors.description = 'A description is required';
      }
      return errors;
    },
    onSubmit: async (data) => {
      // validate and emit data to parent
      try {
        setLoading(true);
        const response = await postData<saveRoleResponse>({
          url: `${serverUrl.current}/api_admin/saveRole`,
          formData: data,
          token: auth()?.token,
        });
        showSuccess('Role added successfully');
        setLoading(false);
        history('/roles');
        // go back to roles
      } catch (error) {
        showError(`error occurred: ${error}`);
        setLoading(false);
      }
    },
  });

  const onPermissionChange = (e: any) => {
    const id = e.target.value;
    console.log(id, e.target.checked);
    if (e.target.checked) {
      selectedPermissions.current = [...selectedPermissions.current, id];
    } else {
      selectedPermissions.current.splice(
        selectedPermissions.current.indexOf(id),
        1
      );
    }
    // let _selectedPermissions:string[] = [];
    // if (selectedPermissions.indexOf(id) === -1) {
    //     _selectedPermissions = [...selectedPermissions, id];
    // }
    // else {
    //     //remove it
    //     let _selectedPermissions = [...selectedPermissions];
    //     _selectedPermissions = _selectedPermissions.filter(permission => permission !== id);
    // }
    formik.setFieldValue('selectedPermissions', selectedPermissions.current);
    // setSelectedPermissions(_selectedPermissions);

    console.log('selected', formik.values.selectedPermissions);
  };



  const loadExistingRole = async () => {
    try {
      setLoadedExistingRole(false);
      const response = await getData<IRoles>({
        url: `${serverUrl.current}/api_admin/role/${id}`,
        token: auth()?.token,
      });
      formik.setValues(response.data);
      setRolePermissions(response.data.Permissions);
      const _selectedPermissions: string[] = [];
      response.data.Permissions.forEach((permission) => {
        _selectedPermissions.push(permission.permission_id.toString());
      });
      formik.setFieldValue('selectedPermissions', _selectedPermissions);
      selectedPermissions.current = _selectedPermissions;
      setLoadedExistingRole(true);
    } catch (error) {
      setLoadedExistingRole(false);

      showError(`error occurred getting permissions: ${error}`);
    }
  };

  useEffect(() => {
    const handleServerUrlReceived = async ( data: any) => {
      serverUrl.current = data;
      try {
        setLoadingPermissions(true);
        const response = await getData<Permissions[]>({
          url: `${data}/api_admin/allPermissions`,
          token: auth()?.token,
        });
        setPermissions(response.data);
        setLoadingPermissions(false);
      } catch (error) {
        showError(`error occurred getting permissions: ${error}`);
        setLoadingPermissions(false);
      }
      if (id) {
        loadExistingRole();
      } else {
        setLoadedExistingRole(true);
      }
    };

    window.electron.ipcRenderer.send(GET_SERVER_URL);

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);


  }, [id, serverUrl]);


  return (
    <>
      <Header showBackArrow />
      <div className="container">
        <h4 className="pageTitle">Add a New Role</h4>
        <form onSubmit={formik.handleSubmit}>
          <Card>
            <CardContent>
              <div className="flex flex-column gap-3 justify-content-center centeredField">
                <div className="flex flex-column gap-2 ">
                  <label htmlFor="location">Name of Role</label>
                  <InputText
                    id="role_name"
                    aria-describedby="role_name-help"
                    value={formik.values.role_name}
                    onChange={(e) => {
                      formik.setFieldValue('role_name', e.target.value);
                    }}
                    className={classNames({
                      'p-invalid':
                        formik.touched.role_name && formik.errors.role_name,
                    })}
                  />
                  <small id="role_name-help">
                    E.g. Accountants, or Cashiers, or Managers
                  </small>
                  {formik.touched.role_name && formik.errors.role_name ? (
                    <small className="p-error">{formik.errors.role_name}</small>
                  ) : (
                    <small className="p-error">&nbsp;</small>
                  )}
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="location">Description</label>
                  <InputText
                    id="description"
                    aria-describedby="description-help"
                    value={formik.values.description}
                    onChange={(e) => {
                      formik.setFieldValue('description', e.target.value);
                    }}
                    className={classNames({
                      'p-invalid':
                        formik.touched.description && formik.errors.description,
                    })}
                  />
                  <small id="description-help">
                    Short description of the role
                  </small>
                  {formik.touched.description && formik.errors.description ? (
                    <small className="p-error">
                      {formik.errors.description}
                    </small>
                  ) : (
                    <small className="p-error">&nbsp;</small>
                  )}
                </div>
                <div>
                  {!loadingPermissions && loadedExistingRole ? (
                    permissions.map((permission) => {
                      return (
                        <div
                          key={permission.permission_id}
                          className="flex align-items-center"
                        >
                          <label
                            htmlFor={permission.permission_id}
                            className="ml-2"
                          >
                            <Checkbox
                              name={`'${permission.permission_id}'`}
                              value={permission.permission_id}
                              onChange={onPermissionChange}
                              defaultChecked={rolePermissions.some(
                                (rp) =>
                                  rp.permission_id === permission.permission_id
                              )}
                            />
                            {permission.name}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <Loading />
                  )}
                </div>

                <Button type="submit" label="Submit" loading={loading} />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      <Toast ref={toast} />
    </>
  );
}

export default AddRole;
