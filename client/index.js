/* eslint-disable */
import React from 'react';
import {hydrate} from 'react-dom';
import App from './app';

hydrate(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
);
  