import { Platform } from 'react-native';
import AppWeb from './App.web';
import AppNative from './App';

export const App = Platform.select({
  web: AppWeb,
  default: AppNative,
});