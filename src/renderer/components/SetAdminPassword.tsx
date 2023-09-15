/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-duplicates */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useAuthUser } from 'react-auth-kit';
import { Toast } from 'primereact/toast';
import { SET_ADMIN_PASSWORD } from '../utils/stringKeys';
import { getData, postData } from '../utils/network';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import { saveSettingsResponse } from '../models/axiosResponse';

function SetAdminPassword({ onSubmit }: { onSubmit: Function }) {
  const auth = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState(null);
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
      password: '',
      confirm_password: '',
    },
    validate: (values: { password: string; confirm_password: string }) => {
      const errors: FormikErrors<{ password: string; confirm_password: string }> =
        {};
      if (!values.password) {
        errors.password = 'Required';
      }
      if (!values.confirm_password) {
        errors.confirm_password = 'Required';
      }
      return errors;
    },
    onSubmit: async (data) => {
      if (data.confirm_password !== data.password) {
        alert('Please make sure the passwords match');
        return;
      }
      // validate and emit data to parent
      try {
        setLoading(true);
        const response = await postData<saveSettingsResponse>({
          url: `${serverUrl}/api_admin/saveSettings`,
          formData: { admin_password: data.password },
          token: auth()?.token,
        });
        if (!response.data.data) {
          showSuccess('Password saved successfully');
        } else {
          response.data.data.forEach((item) => {
            showError(item);
          });
        }
        setLoading(false);
        onSubmit();
      } catch (error) {
        showError(`error occurred: ${error}`);
      }
      // ipcRenderer.send(CALL_ACTIVATION, data.code)
    },
  });

  useEffect(() => {
    window.electron.ipcRenderer.send(GET_SERVER_URL);
    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, async (data: any) => {
      setServerUrl(data);
    });
  }, []);



  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-column gap-3 justify-content-center align-items-center">
          <label htmlFor="password">
            Enter the administrator password. Please make sure you save it
            somewhere safe
          </label>
          <div>
            <Password
              id="password"
              required
              className="wide-input"
              feedback={false}
              value={formik.values.password}
              onChange={(e) => {
                formik.setFieldValue('password', e.target.value);
              }}
            />
            {formik.errors.password ? (
              <div>{formik.errors.password}</div>
            ) : null}
          </div>

          <label htmlFor="password">Type the password again.</label>
          <div>
            <Password
              required
              id="confirm_password"
              className="wide-input"
              feedback={false}
              value={formik.values.confirm_password}
              onChange={(e) => {
                formik.setFieldValue('confirm_password', e.target.value);
              }}
            />
            {formik.values.confirm_password !== formik.values.password ? (
              <div>Make sure the passwords match</div>
            ) : null}
          </div>

          <Button type="submit" label="Submit" loading={loading} />
        </div>
      </form>
      <Toast ref={toast} />
    </>
  );
}

export default SetAdminPassword;
