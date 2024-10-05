import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLoginForm, signin, clearError, setUserInfo } from '../../Features/authSlice';
import AuthForm from './AuthForm';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setLoginForm());
        dispatch(clearError());
    }, [dispatch]);

    const handleSubmit = (values) => {
      dispatch(signin(values))
          .unwrap()
          .then((data) => {
            dispatch(setUserInfo(data.users))
            if (data.users.id) {
              if(data.users.profileSetup) {navigate("/home")}
                else navigate("/profile")
            }
          })
          .catch((error) =>{
              console.error("Failed to sign in:",error);
          });
    };
   

  return (
    <AuthForm onSubmit={handleSubmit}/>
  )
}

export default Login