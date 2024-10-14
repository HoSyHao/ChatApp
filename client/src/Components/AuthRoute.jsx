/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthRoute = ({ element: Component }) => {
  const { user } = useSelector((state) => state.auth);

  // Nếu người dùng đã đăng nhập, điều hướng đến home
  return user ? <Navigate to="/home" replace /> : <Component />;
};

export default AuthRoute;