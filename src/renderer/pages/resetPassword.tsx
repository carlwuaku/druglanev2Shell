/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable prettier/prettier */
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import { Message } from 'primereact/message';
import { useAuthUser } from 'react-auth-kit';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import { postData } from '../utils/network';
import Header from '../components/Header';

export default function ResetPassword() {
  const auth = useAuthUser();
  const [loading, setLoading] = useState(false);
  const serverUrl = useRef('');
  const toast = useRef<Toast>(null);
  const history = useNavigate();

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
  const formik = useFormik<{
    password: string;
    confirm_password: string;
    reset_token: string;
  }>({
    initialValues: {
      password: '',
      confirm_password: '',
      reset_token: '',
    },
    validate: (values: {
      password: string;
      confirm_password: string;
      reset_token: string;
    }) => {
      const errors: FormikErrors<{
        password: string;
        confirm_password: string;
        reset_token: string;
      }> = {};
      if (!values.password) {
        errors.password = 'The password is required';
      }
      if (values.password !== values.confirm_password) {
        errors.confirm_password = 'The passwords must match';
      }
      if (!values.reset_token) {
        errors.reset_token = 'The reset token is required';
      }
      return errors;
    },
    onSubmit: async (data) => {
      try {
        setLoading(true);
        const response = await postData<string>({
          url: `${serverUrl.current}/api_admin/resetAdminPassword`,
          formData: data,
          token: auth()?.token,
        });
        showSuccess('Password reset successfully');
        setLoading(false);
        history('/login');
      } catch (error) {
        showError(`error occurred: ${error}`);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const handleServerUrlReceived = async (event: any, data: any) => {
      serverUrl.current = data;
    };

    window.electron.ipcRenderer.send(GET_SERVER_URL);

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);


  }, [serverUrl]);

  return (
    <>
      <Header showBackArrow />
      <div className="container">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex align-items-center justify-content-center">
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
              <div className="text-center mb-5">
                <img
                  src="/demo/images/blocks/logos/hyper.svg"
                  alt="hyper"
                  height={50}
                  className="mb-3"
                />
                <div className="text-900 text-3xl font-medium mb-3">
                  Reset the administrator password
                </div>
                <Message
                  severity="info"
                  text="Please check your email for the reset token that was sent to you"
                />
              </div>

              <div className="flex-column align-items-center justify-content-center">
                <label
                  htmlFor="password"
                  className="block text-900 font-medium mb-2"
                >
                  Enter Password
                </label>
                <InputText
                  id="password"
                  type="password"
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.setFieldValue('password', e.target.value);
                  }}
                  className={classNames({
                    'p-invalid':
                      formik.touched.password && formik.errors.password,
                  })}
                />

                <label
                  htmlFor="confirm_password"
                  className="block text-900 font-medium mb-2"
                >
                  Confirm Password
                </label>
                <InputText
                  id="confirm_password"
                  type="confirm_password"
                  value={formik.values.confirm_password}
                  onChange={(e) => {
                    formik.setFieldValue('confirm_password', e.target.value);
                  }}
                  className={classNames({
                    'p-invalid':
                      formik.touched.confirm_password &&
                      formik.errors.confirm_password,
                  })}
                />

                <label
                  htmlFor="reset_token"
                  className="block text-900 font-medium mb-2"
                >
                  Reset Token
                </label>
                <InputText
                  id="reset_token"
                  type="reset_token"
                  value={formik.values.reset_token}
                  onChange={(e) => {
                    formik.setFieldValue('reset_token', e.target.value);
                  }}
                  className={classNames({
                    'p-invalid':
                      formik.touched.reset_token && formik.errors.reset_token,
                  })}
                />

                <Button
                  loading={loading}
                  label="Submit"
                  icon="pi pi-user"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      <Toast ref={toast} />
    </>
  );
}
