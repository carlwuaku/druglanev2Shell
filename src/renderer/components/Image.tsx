/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable prettier/prettier */
/* eslint-disable react/require-default-props */
import React from 'react';

function LocalImage({
  image,
  height,
  className,
}: {
  image: string;
  height: string;
  className?: string;
}) {
  // const imageObject = require(`@/app/assets/${image}`);

  return (
    <img
      src=""
      className={className}
      alt="none"
      height={height}
    />
  );
}

export default LocalImage;
