/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verify } from '../Features/authSlice';
import { useEffect } from 'react';

const PrivateRoute = ({ element: Component }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(verify()).unwrap();
      } catch (error) {
        console.log('Failed to verify:', error);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (!user) {
    localStorage.removeItem("user")
    return <Navigate to="/login" replace />;
  }

  if (!user.profileSetup && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }
  
  return <Component />;
};

export default PrivateRoute;