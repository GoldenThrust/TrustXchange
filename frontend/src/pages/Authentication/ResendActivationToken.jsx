import { Header } from "../../components/Header.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { sendAccountActivationToken } from '../../auth/authActions.js';
import Form from "../../components/Form.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";



export default function ResendActivationEmail() {
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const { isAuthenticated, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        dispatch(sendAccountActivationToken(data));
    };

    const formData = [
        { register: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email address' },
    ]

    return (
        <>
            <Header />
            <Form title="Resend Activation Token" data={formData} onSubmit={onSubmit} error={error} />
        </>
    );
}
