// React entry file, renders POpupView

import React from 'react';
import ReactDOM from 'react-dom/client';
import PopupView from './PopupView';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupView />
  </React.StrictMode>
);

