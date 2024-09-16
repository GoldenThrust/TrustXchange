import { Header } from "./header.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../auth/authActions.js';
import Form from "../../components/Form.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { response, loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const onSubmit = (data) => {
        dispatch(forgotPassword(data));
    };

    useEffect(() => {
        if (!loading && response) {
            navigate(`/status?query=${response}`, { replace: true });
        }

        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate, loading, isAuthenticated, response])

    const formData = [
        { register: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email address' },
    ]


    return (
        <>
            <Header />
            <Form title="Forgot Password" data={formData} onSubmit={onSubmit} error={error} />
        </>
    );
}