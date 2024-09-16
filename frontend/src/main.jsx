import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { Toaster } from "react-hot-toast";
import store from './store/store.js'
import { Provider } from 'react-redux'
import App from './App';
import { registerSW } from 'virtual:pwa-register';

registerSW();

// axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" />
      <App />
    </Provider>
  </StrictMode>
)
