import React, { ReactNode } from 'react';
import Header from './Header';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import ImpactButton from './ImpactButton';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const windowDimensions = useWindowDimensions();
  const scrollViewHeight = windowDimensions.height - 90;

  return (
    <View style={styles.body}>
      <Header />
      <ScrollView style={[styles.scrollView, { maxHeight: scrollViewHeight }]}>{children}</ScrollView>
      {/* <ImpactButton title="SEE YOUR IMPACT"/> */}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default Layout;
