// import { useEffect } from "react";
import { Header } from "../../components/Header.jsx";
import { useDispatch } from 'react-redux';
import { login } from '../../auth/authActions.js';
import Form from "../../components/Form.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
      if (isAuthenticated) {
          navigate('/dashboard', { replace: true });
      }
  }, [isAuthenticated, navigate]);


  const formData = [
    { register: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
    { register: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
  ];

  const onSubmit = (data) => {
    dispatch(login(data));
  };


  const { loginerror } = useSelector((state) => state.auth);


  return (
    <>
      <Header />
      <Form title="Sign In" data={formData} onSubmit={onSubmit} error={loginerror} SubmitLabel='Login' />
      <div className="flex justify-between m-auto w-10/12 my-10">
        <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800">
          Forgot password?
        </Link>
        <Link to="/signup" className="text-indigo-600 hover:text-indigo-800">
          {"Don't have an account? Sign Up"}
        </Link>
      </div>
    </>
  );
}
