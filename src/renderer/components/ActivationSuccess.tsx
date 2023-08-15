/* eslint-disable prettier/prettier */
import { Message } from 'primereact/message';

function ActivationSuccess({ name }: { name: string }) {
  const content = (
    <div className="flex align-items-center">
      <i className="pi pi-check-circle" />
      <div className="ml-2">
        Activation key confirmed successfully for {name} !.
      </div>
    </div>
  );
  return (
    <Message
      className="border-primary w-full justify-content-start"
      severity="success"
      content={content}
    />
  );
}

export default ActivationSuccess;
