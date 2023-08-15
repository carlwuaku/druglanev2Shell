/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-boolean-value */
import React, { useEffect, useState } from 'react';
import { useAuthUser } from 'react-auth-kit';
import { getData } from '../utils/network';
import { GET_SERVER_URL, SERVER_URL_RECEIVED } from '../utils/stringKeys';
import Header from '../components/Header';
import Loading from '../components/Loading';
import Settings from '../components/settings';

function SettingsPage() {
  const auth = useAuthUser();
  const [isLoaded, setIsLoaded] = useState(false);

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
    window.history.back();
  };

  useEffect(() => {
    const handleServerUrlReceived = async (event: any, data: any) => {
      const serverUrl = data;
      const getSettings = await getData<any>({
        url: `${serverUrl}/api_admin/settings`,
        token: auth()?.token,
      });
      console.log('settings get settings', getSettings);
      setSettingsData(getSettings.data);
      setIsLoaded(true);
    };
    window.electron.ipcRenderer.send(GET_SERVER_URL);

    window.electron.ipcRenderer.on(SERVER_URL_RECEIVED, handleServerUrlReceived);


  }, []);

  return (
    <>
      <Header showBackArrow={true} />
      <div className="container">
        <h3>System Settings</h3>
        {isLoaded ? (
          <Settings data={settingsData} onSubmit={settingsSubmitted} />
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default SettingsPage;
