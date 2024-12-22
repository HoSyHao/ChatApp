/* eslint-disable react/react-in-jsx-scope */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { resetPassword, setResetPasswordForm, clearError } from '../../Features/authSlice';
import AuthForm from './AuthForm';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
    const dispatch = useDispatch();
    const { token } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        dispatch(setResetPasswordForm());
        dispatch(clearError());
    }, [dispatch]);
    

    const handleSubmit = (values) => {
      dispatch(resetPassword({ token, password: values.password })).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          navigate('/login');
        }
        console.log(action);
      }).catch(err => {
        console.log(err);
      });
    };

  return (
    <AuthForm onSubmit={handleSubmit}/>
  );
};

export default ResetPassword;
