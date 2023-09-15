/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TabPanel, TabView } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { useFormik, FormikErrors } from 'formik';
import ActivationFailed from '../components/ActivationFailed';
import ActivationSuccess from '../components/ActivationSuccess';
import Settings from '../components/settings';
import { ACTIVATION_RESULT, ADMIN_PASSWORD_SET, CALL_ACTIVATION, SETUP_FINISHED } from '../utils/stringKeys';
import SetAdminPassword from '../components/SetAdminPassword';

function Activate() {
  // define the url. since the https version fails
  // sometimes, retry with the http version when
  // necessary

  const [loading, setLoading] = useState(false);
  const keyField = useRef<HTMLInputElement>();
    const [activeIndex, setActiveIndex] = useState(0);

  const [requestStatus, setRequestStatus] = useState<{
    status: string;
    data: any;
  }>({ status: '', data: {} });
  const toast = useRef(null);
  const [errorVisible, setErrorVisible] = useState(false);

  const [settingsData, setSettingsData] = useState({
    number_of_shifts: '',
    restrict_zero_stock_sales: '',
    tax: '',
    logo: '',
    receipt_logo: '',
    tax_title: '',
    show_tax_on_receipt: '',
    receipt_show_credits: '',
    receipt_extra_info: '',
    receipt_footer: '',
    receipt_show_customer: '',
    receipt_product_data: '',
    receipt_font_size: '',
    receipt_show_borders: '',
    duplicate_record_timeout: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    digital_address: '',
    admin_password: '',
    company_id: '',
  });

  const settingsSubmitted = () => {
    // navigate to next tab
    setActiveIndex(2);
  };

  const adminPasswordSet = (password: string) => {
    //send the call to activate the application
          window.electron.ipcRenderer.send(SETUP_FINISHED);

  };

  const formik = useFormik({
    initialValues: {
      code: '',
    },
    validate: (values: { code: string }) => {
      const errors: FormikErrors<{ code: string }> = {};
      if (!values.code) {
        errors.code = 'Required';
      }
      return errors;
    },
    onSubmit: (data) => {
      // validate and emit data to parent
      setLoading(true);
      window.electron.ipcRenderer.send(CALL_ACTIVATION, data.code);
    },
  });
  // function sendValidation() {
  //   if (keyField.current.value) {
  //     setLoading(true)
  //     ipcRenderer.send(CALL_ACTIVATION, keyField.current.value)
  //   }
  // }

  useEffect(() => {
    window.electron.ipcRenderer.on(ACTIVATION_RESULT, ( data) => {
      setLoading(false);

      console.log(data.data);
      if (data.data.status === '1') {
        setRequestStatus(data.data);
        setSettingsData({
          number_of_shifts: data.data.data.number_of_shifts,
          restrict_zero_stock_sales: data.data.data.restrict_zero_stock_sales,
          tax: '0',
          logo: '',
          receipt_logo: 'no',
          tax_title: 'Local Sales Tax',
          show_tax_on_receipt: 'no',
          receipt_show_credits: 'yes',
          receipt_extra_info: '',
          receipt_footer: '',
          receipt_show_customer: 'yes',
          receipt_product_data: '',
          receipt_font_size: '13px',
          receipt_show_borders: 'no',
          duplicate_record_timeout: '',
          company_name: data.data.data.name,
          phone: data.data.data.phone,
          email: data.data.data.email,
          address: data.data.data.address,
          digital_address: data.data.data.digital_address,
          admin_password: '',
          company_id: data.data.data.id,
        });

        console.log(settingsData);

        setActiveIndex(1);
      } else {
        // show dialog for error
        setErrorVisible(true);
      }
    });
  }, []);

  return (
    <div className="flex flex-column gap-3 justify-content-center align-items-center ">
      <h2>Activate Your System</h2>

      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Enter Activation Code" disabled>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-column gap-3 justify-content-center align-items-center">
              <div>
                <b>
                  Please enter your activation code. If you do not have one,
                  please contact us via our form at
                  <a href="http://calronsoftwares.com">
                    {' '}
                    http://calronsoftwares.com
                  </a>
                </b>
              </div>

              <label htmlFor="location">Activation Code</label>
              <InputText
                id="code"
                className="wide-input"
                aria-describedby="code-help"
                value={formik.values.code}
                onChange={(e) => {
                  formik.setFieldValue('code', e.target.value);
                }}
              />

              <Button type="submit" label="Submit" loading={loading} />
              {requestStatus && requestStatus.data.status === '-1' ? (
                <ActivationFailed />
              ) : null}
            </div>
          </form>
        </TabPanel>
        <TabPanel header="Settings" disabled>
          <div className="flex flex-column justify-content-center align-items-center">
            {requestStatus && requestStatus.status === '1' ? (
              <div>
                <ActivationSuccess name={requestStatus.data.name} />
                <Settings
                  data={settingsData}
                  onSubmit={settingsSubmitted}
                 />
              </div>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel header="Set Administrator Password" disabled>
          <div className="flex flex-column justify-content-center align-items-center">
            <SetAdminPassword onSubmit={adminPasswordSet} />
          </div>
        </TabPanel>
      </TabView>

      <Dialog
        visible={errorVisible}
        style={{ width: '50vw' }}
        footer={
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={() => setErrorVisible(false)}
            className="p-button-text"
          />
        }
        onHide={() => setErrorVisible(false)}
      >
        <p className="m-0">
          Your activation key is invalid. Please check and try again
        </p>
      </Dialog>
    </div>
  );
}

export default Activate;
