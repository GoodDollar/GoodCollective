import React, { ReactNode } from 'react';
import Header from './Header';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const windowDimensions = useWindowDimensions();
  const scrollViewHeight = windowDimensions.height - 100;

  return (
    <View style={styles.body}>
      <Header />
      <ScrollView style={[styles.scrollView, { maxHeight: scrollViewHeight }]}>{children}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  scrollView: {
    padding: 15,
    flex: 1,
  },
});

export default Layout;
