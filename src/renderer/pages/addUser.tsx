/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card, CardContent, FormControlLabel } from '@mui/material';
import { classNames } from 'primereact/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import Switch from '@mui/material/Switch';
import { useAuthUser } from 'react-auth-kit';
import { IUser } from '../models/user';
import { Permissions } from '../models/permissions';
import Header from '../components/Header';
import { genericAxiosPostResponse } from '../models/axiosResponse';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import { getData, postData } from '../utils/network';
import { IRoles } from '../models/roles';

function AddUser() {
  const auth = useAuthUser();
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const serverUrl = useRef('');
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [roles, setRoles] = useState<IRoles[]>([]);
  const { id } = useParams();
  const [updatePassword, setUpdatePassword] = useState(false);
  const showUpdatePassword = useRef(false);
  const [rolePermissions, setRolePermissions] = useState<Permissions[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permissions[]>([]);

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
 const formik = useFormik({
    initialValues: {
      username: '',
      phone: '',
      password: '',
      confirm_password: '',
      email: '',
      display_name: '',
      role_id: '',
      active: 0,
      id: '',
      updatePassword: 'no',
    },
    validate: (values: IUser) => {
      const errors: FormikErrors<IUser> = {};
      if (!values.username) {
        errors.username = 'The username is required';
      }
      if (values.username.includes(' ')) {
        errors.username = 'The username must not contain spaces';
      }
      if (!values.phone) {
        errors.phone = 'A phone is required';
      }
      if (!values.email) {
        errors.email = 'An email address is required';
      }
      if (!values.display_name) {
        errors.display_name = 'A display name is required';
      }
      if (!values.role_id) {
        errors.role_id = 'Please select a role';
      }

      return errors;
    },
    onSubmit: async (data) => {
      // validate and emit data to parent
      try {
        setLoading(true);
        const response = await postData<genericAxiosPostResponse>({
          url: `${serverUrl.current}/api_admin/saveUser`,
          formData: data,
          token: auth()?.token,
        });
        showSuccess('User modified successfully');
        setLoading(false);
        history('/users');
        // go back to roles
      } catch (error) {
        console.log(error);
        showError(`error occurred: ${error}`);
        setLoading(false);
      }
      // ipcRenderer.send(CALL_ACTIVATION, data.code)
    },
  });
  const loadRolePermissions = async () => {
    try {
      setLoadingRoles(true);
      const response = await getData<Permissions[]>({
        url: `${serverUrl.current}/api_admin/rolePermissions/${formik.values.role_id}`,
        token: auth()?.token,
      });
      setRolePermissions(response.data);
      setLoadingRoles(false);
    } catch (error) {
      showError(`error occurred getting permissions: ${error}`);
      setLoadingRoles(false);
    }
  };

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await getData<IRoles[]>({
        url: `${serverUrl.current}/api_admin/getRoles`,
        token: auth()?.token,
      });
      setRoles(response.data);
      setLoadingRoles(false);
    } catch (error) {
      showError(`error occurred getting permissions: ${error}`);
      setLoadingRoles(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setLoadingRoles(true);
      const response = await getData<Permissions[]>({
        url: `${serverUrl.current}/api_admin/allPermissions`,
        token: auth()?.token,
      });
      setAllPermissions(response.data);
    } catch (error) {
      showError(`error occurred getting permissions: ${error}`);
      setLoadingRoles(false);
    }
  };

  const loadExistingUser = async () => {
    try {
      setLoadingRoles(true);
      const response = await getData<IUser>({
        url: `${serverUrl.current}/api_admin/user/${id}`,
        token: auth()?.token,
      });
      formik.setValues(response.data);
      setLoadingRoles(false);
    } catch (error) {
      showError(`error occurred getting permissions: ${error}`);
      setLoadingRoles(false);
    }
  };

  const activeStates = [
    {
      label: 'Active',
      value: 1,
    },
    {
      label: 'Inactive',
      value: 0,
    },
  ];

  // const previousRoleId = usePrevious(formik.values.role_id);

  const handleUpdatePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUpdatePassword(event.target.checked);
    console.log('updatepassword', updatePassword);
    formik.setFieldValue('updatePassword', updatePassword ? 'yes' : 'no');
  };

  useEffect(() => {
    if (!id) {
      setUpdatePassword(true);
      showUpdatePassword.current = false;
    } else {
      setUpdatePassword(false);

      showUpdatePassword.current = true;
    }

    const handleServerUrlReceived = (data: any) => {
      serverUrl.current = data;
      loadRoles();
      loadPermissions();
      if (id) {
        loadExistingUser();
      }
    };

    window.electron.ipcRenderer.send(GET_SERVER_URL);

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);

  }, [id, serverUrl]);

  useEffect(() => {
    if (formik.values.role_id) {
      loadRolePermissions();
    }
  }, [formik.values.role_id]);

  return (
    <>
      <Header showBackArrow />
      <div className="container">
        <h4 className="pageTitle">Add a New User</h4>
        <form onSubmit={formik.handleSubmit}>
          <Card>
            <CardContent>
              <div className="flex flex-column gap-3 justify-content-center centeredField">
                <div className="flex flex-column gap-2 ">
                  <label htmlFor="username">Username</label>
                  <InputText
                    id="username"
                    aria-describedby="username-help"
                    value={formik.values.username}
                    onChange={(e) => {
                      formik.setFieldValue('username', e.target.value);
                    }}
                    required
                    className={classNames({
                      'p-invalid':
                        formik.touched.username && formik.errors.username,
                    })}
                  />
                  <small id="username-help">
                    The user will login with this username. There should be no
                    spaces
                  </small>
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="display_name">Full Name</label>
                  <InputText
                    id="display_name"
                    aria-describedby="display_name-help"
                    value={formik.values.display_name}
                    onChange={(e) => {
                      formik.setFieldValue('display_name', e.target.value);
                    }}
                    required
                    className={classNames({
                      'p-invalid':
                        formik.touched.display_name &&
                        formik.errors.display_name,
                    })}
                  />
                  <small id="display_name-help">
                    The person's full name, for identification
                  </small>
                </div>

                {/* password */}
                <div className="flex flex-column gap-2 ">
                  {showUpdatePassword.current ? (
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={handleUpdatePasswordChange}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                      }
                      label="Update the password"
                    />
                  ) : (
                    ''
                  )}
                  <label htmlFor="password">Password</label>
                  <Password
                    value={formik.values.password}
                    onChange={(e) => {
                      formik.setFieldValue('password', e.target.value);
                    }}
                    className={classNames({
                      'p-invalid':
                        formik.touched.password && formik.errors.password,
                    })}
                    aria-describedby="password-help"
                    promptLabel="Choose a password"
                    weakLabel="Too simple"
                    mediumLabel="Average complexity"
                    toggleMask
                    required={updatePassword}
                    disabled={!updatePassword}
                    strongLabel="Complex password"
                  />

                  <small id="password-help" />
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="confirm_password">Confirm Password</label>
                  <Password
                    value={formik.values.confirm_password}
                    onChange={(e) => {
                      formik.setFieldValue('confirm_password', e.target.value);
                    }}
                    className={classNames({
                      'p-invalid':
                        formik.touched.confirm_password &&
                        formik.errors.confirm_password,
                    })}
                    aria-describedby="confirm_password-help"
                    required={updatePassword}
                    disabled={!updatePassword}
                    toggleMask
                  />

                  <small id="confirm_password-help">
                    Type the password again
                  </small>
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="email">Email</label>
                  <InputText
                    id="email"
                    aria-describedby="email-help"
                    value={formik.values.email}
                    required
                    onChange={(e) => {
                      formik.setFieldValue('email', e.target.value);
                    }}
                    className={classNames({
                      'p-invalid': formik.touched.email && formik.errors.email,
                    })}
                  />
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="phone">Phone Number</label>
                  <InputText
                    id="phone"
                    aria-describedby="phone-help"
                    value={formik.values.phone}
                    required
                    onChange={(e) => {
                      formik.setFieldValue('phone', e.target.value);
                    }}
                    className={classNames({
                      'p-invalid': formik.touched.phone && formik.errors.phone,
                    })}
                  />
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="role_id">User Role</label>
                  <Dropdown
                    inputId="role_id"
                    name="role_id"
                    value={formik.values.role_id}
                    options={roles}
                    optionLabel="role_name"
                    optionValue="role_id"
                    placeholder="Select a Role"
                    className={classNames({
                      'p-invalid':
                        formik.touched.role_id && formik.errors.role_id,
                    })}
                    onChange={(e) => {
                      formik.setFieldValue('role_id', e.value);
                    }}
                  />

                  {formik.values.role_id ? (
                    <div>
                      {rolePermissions.length} of {allPermissions.length}{' '}
                      permissions available to this role.{' '}
                      {rolePermissions.map((permission) => (
                        <span key={permission.name} className="chip light-blue">
                          {permission.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <small id="role_id-help">
                      Select a role for the user. The permissions available to
                      that role will be displayed below
                    </small>
                  )}
                </div>

                <div className="flex flex-column gap-2 ">
                  <label htmlFor="active">Active</label>
                  <Dropdown
                    inputId="active"
                    name="active"
                    value={formik.values.active}
                    options={activeStates}
                    optionLabel="label"
                    optionValue="value"
                    className={classNames({
                      'p-invalid':
                        formik.touched.active && formik.errors.active,
                    })}
                    onChange={(e) => {
                      formik.setFieldValue('active', e.value);
                    }}
                  />
                  <small id="active-help">
                    An inactive user will not be able to login to the system.
                  </small>
                </div>
                {formik.touched.username && formik.errors.username ? (
                  <div className="p-error">{formik.errors.username}</div>
                ) : (
                  ''
                )}
                {formik.touched.display_name && formik.errors.display_name ? (
                  <div className="p-error">{formik.errors.display_name}</div>
                ) : (
                  ''
                )}
                {formik.touched.password && formik.errors.password ? (
                  <div className="p-error">{formik.errors.password}</div>
                ) : (
                  ''
                )}
                {formik.touched.confirm_password &&
                formik.errors.confirm_password ? (
                  <div className="p-error">
                    {formik.errors.confirm_password}
                  </div>
                ) : (
                  ''
                )}
                {formik.touched.email && formik.errors.email ? (
                  <div className="p-error">{formik.errors.email}</div>
                ) : (
                  ''
                )}
                {formik.touched.role_id && formik.errors.role_id ? (
                  <div className="p-error">{formik.errors.role_id}</div>
                ) : (
                  ''
                )}
                {formik.touched.phone && formik.errors.phone ? (
                  <div className="p-error">{formik.errors.phone}</div>
                ) : (
                  ''
                )}
                {formik.touched.active && formik.errors.active ? (
                  <div className="p-error">{formik.errors.active}</div>
                ) : (
                  ''
                )}

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

export default AddUser;
