import React, { ReactNode } from 'react';
import { NativeBaseProvider } from 'native-base';

type Props = {
  children?: ReactNode;
};

export const Providers = ({ children }: Props) => {
  return <NativeBaseProvider>{children}</NativeBaseProvider>;
};
