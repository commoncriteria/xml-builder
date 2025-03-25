// Imports
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../index.css'
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { Provider } from "react-redux";
import store from "./app/store.js";

// Constants
let persistor = persistStore(store);

// Call to App class for running the XML Builder application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
              <App/>
          </PersistGate>
      </Provider>
  </React.StrictMode>
)