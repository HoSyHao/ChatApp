import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setRegisterForm , clearError, signup} from '../../Features/authSlice';
import AuthForm from './AuthForm';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
        dispatch(setRegisterForm());
        dispatch(clearError());
    }, [dispatch]);

    const handleSubmit = (values) => {
      dispatch(signup(values))
      .then((action) =>{
        if( action.meta.requestStatus === 'fulfilled' && action.payload.status) {
          navigate('/profile');
        }
      }).catch(err => {
        console.log("Failed to sign in:",err);
      })
    }

  return (
    <AuthForm onSubmit={handleSubmit}/>
  )
}

export default Register