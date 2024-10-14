import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./Store/index.js";
import axios from "axios";
import { Toaster } from "./Components/ui/sonner.jsx";
import { SocketProvider } from "./context/SocketContext.jsx"; // Cập nhật đường dẫn nhập khẩu

axios.defaults.withCredentials = true; // Bật gửi cookies trong Axios

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <App />
      <Toaster closeButton />
    </SocketProvider>
  </Provider>
);