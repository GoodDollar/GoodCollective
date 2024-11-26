import { View } from 'native-base';
import { ReactNode } from 'react';

interface DesktopPageContentContainerProps {
  children: ReactNode;
}

export const DesktopPageContentContainer = ({ children }: DesktopPageContentContainerProps) => {
  return (
    <View width={'100%'} flexDirection={'column'}>
      <View maxWidth={1280} width={'100%'} alignSelf={'center'}>
        {children}
      </View>
    </View>
  );
};
