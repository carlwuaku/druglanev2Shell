/* eslint-disable prettier/prettier */
import { Message } from 'primereact/message';
import React from 'react';

function ActivationFailed() {
  const message = `Check that your code is correct and try again. The code is comprised of 20 digits separated by
    dashes.E.g.ABCDE - FGHIJ - KLMNO - PQRST`;
  return <Message severity="error" text={message} />;
}

export default ActivationFailed;
