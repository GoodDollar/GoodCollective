import React from 'react';
import ReactDOM from 'react-dom';
import App from '../src/App';
import { Providers } from '../src/Providers';

ReactDOM.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
  document.getElementById('root')
);
