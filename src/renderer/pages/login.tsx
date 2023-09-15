/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-duplicates */
import { InputText } from 'primereact/inputtext';
import Button from '@mui/material/Button';
import React, { useEffect, useRef, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { useSignIn } from 'react-auth-kit';
import { useAuthUser } from 'react-auth-kit';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import { postData } from '../utils/network';
import Header from '../components/Header';
import LocalImage from '../components/Image';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function Login() {
  const auth = useAuthUser();
  const [loading, setLoading] = useState(false);
  const serverUrl = useRef('');
  const toast = useRef<Toast>(null);
  const history = useNavigate();
  const signIn = useSignIn();
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
  const formik = useFormik<{ password: string }>({
    initialValues: {
      password: '',
    },
    validate: (values: { password: string }) => {
      const errors: FormikErrors<{ password: string }> = {};
      if (!values.password) {
        errors.password = 'The password is required';
      }
      return errors;
    },
    onSubmit: async (data) => {
      try {
        setLoading(true);
        const res = await postData<string>({
          url: `${serverUrl.current}/api_admin/admin_login`,
          formData: data,
          token: auth()?.token,
        });
        if (
          signIn({
            token: res.data,
            expiresIn: 3600,
            tokenType: 'Bearer',
            authState: { token: res.data },
          })
        ) {
          showSuccess('Logged in successfully');
          setLoading(false);
          history('/');
        } else {
          throw new Error('Error signing in. Please try again');
        }

      } catch (error) {
        showError(`error occurred: ${error}`);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const handleServerUrlReceived = async ( data: any) => {
      serverUrl.current = data;
    };
    console.log("getting the server url")
    window.electron.ipcRenderer.send(GET_SERVER_URL);

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);


  }, [serverUrl]);

  const resetPassword = async () => {
    try {
      setLoading(true);
      const response = await postData<{ error: boolean; message: any }>({
        url: `${serverUrl.current}/api_admin/resetAdminLogin`,
        formData: {},
        token: auth()?.token,
      });
      if (response.data.error) {
        alert(
          "There was an error sending your token. Please check your connection and click on the 'Forgot Password' to try again"
        );
      } else {
        setLoading(false);
        showSuccess(
          'Email sent successfully. Please check your email for the reset token'
        );
        history('/resetPassword');
      }
    } catch (error) {
      showError(`error occurred: ${error}`);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex-column align-items-center justify-content-center">
            <div className=" w-full lg:w-6">
              <div className="text-center mb-5">
                <div className="text-900 text-3xl font-medium mb-3">
                  Log in as the administrator
                </div>
              </div>

              <div className="flex-column align-items-center justify-content-center">
                <label
                  htmlFor="password"
                  className="block text-900 font-medium mb-2"
                >
                  Admin Password
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
                    'w-full mb-3': true,
                    'center-input-text': true,
                  })}
                />

                <div className="flex align-items-center justify-content-between mb-6">
                  <a
                    onClick={resetPassword}
                    className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer"
                  >
                    Forgot your password?
                  </a>
                </div>

                <Button type='submit'
                variant="contained"
                  color='primary'
                  className="w-full"
                >Sign In</Button>
                <Button
            component={RouterLink}
            to="/"
            className="w-full"
          >
            Go Back Home
          </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Toast ref={toast} />
    </>
  );
}
