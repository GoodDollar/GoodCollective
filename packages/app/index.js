// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';
if (!global.navigator) {
  global.navigator = {};
}
global.navigator.userAgent = 'React Native';
import 'fast-text-encoding';

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { Providers } from './src/Providers';
const Main = () => (
  <Providers>
    <App />
  </Providers>
);
AppRegistry.registerComponent(appName, () => Main);
