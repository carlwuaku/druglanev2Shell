/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import Header from '../components/Header';

import SetAdminPassword from '../components/SetAdminPassword';

function SetAdminPasswordPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const formSubmitted = () => {
    console.log('form submitted');
  };
  return (
    <>
      <Header />
      <div className="container">
        <SetAdminPassword
          onSubmit={() => {
            formSubmitted();
          }}
        />
      </div>
    </>
  );
}

export default SetAdminPasswordPage;
