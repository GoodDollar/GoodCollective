import { StyleSheet, View } from 'react-native';
import { ReactNode } from 'react';

interface DesktopPageContentContainerProps {
  children: ReactNode;
}

export const DesktopPageContentContainer = ({ children }: DesktopPageContentContainerProps) => {
  return (
    <View style={styles.desktopContentContainer}>
      <View style={styles.desktopContentBody}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopContentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  desktopContentBody: {
    width: '100%',
  },
});
