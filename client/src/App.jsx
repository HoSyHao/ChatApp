import React from 'react';
import './assets/App.css';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import ResetPassword from './Pages/auth/ResetPassword';
import ForgotPassword from './Pages/auth/ForgotPassword';
import Home from './Pages/chat/Home';
import PrivateRoute from './Components/PrivateRoute';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import Profile from './Pages/profile/Profile';
import AuthRoute from './Components/AuthRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - người dùng chưa đăng nhập mới truy cập được */}
        <Route path="/login" element={<AuthRoute element={Login} />} />
        <Route path="/register" element={<AuthRoute element={Register} />} />
        <Route path="/forgotPassword" element={<AuthRoute element={ForgotPassword} />} />
        <Route path="/resetPassword/:token" element={<AuthRoute element={ResetPassword} />} />
        
        {/* Điều hướng mặc định tới trang login nếu không có user */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Private routes - chỉ cho người dùng đã đăng nhập truy cập */}
        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route path="/profile" element={<PrivateRoute element={Profile} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;