import React, { ReactNode } from 'react';
import { NativeBaseProvider } from '@gooddollar/good-design';
import { nbTheme } from './theme/theme';

type Props = {
  children?: ReactNode;
};

export const Providers = ({ children }: Props) => {
  return <NativeBaseProvider theme={nbTheme}>{children}</NativeBaseProvider>;
};
