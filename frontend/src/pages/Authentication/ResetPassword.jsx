import { Header } from "../../components/Header.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../auth/authActions.js';
import Form from "../../components/Form.jsx";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const dispatch = useDispatch();
    const [passwordMatch, setPasswordMatch] = useState(true);
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');
    const navigate = useNavigate()
    const { error, isAuthenticated, response, loading } = useSelector((state) => state.auth)
    
    const onSubmit = (data) => {
        if (data.password !== data['c-password']) {
            setPasswordMatch(false)
        } else {
            setPasswordMatch(true);
            dispatch(resetPassword(token, { password: data.password }));
        }
    };


    useEffect(() => {
        if (!loading && response) {
            navigate(`/status?query=${response}`, { replace: true });
        }

        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate, isAuthenticated, response, loading, dispatch])


    const formData = [
        { register: 'password', label: 'Password', type: 'password', placeholder: 'Create a secure password' },
        { register: 'c-password', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter your password' },
    ]

    return (
        <>
            <Header />
            <Form
                title="Reset Password"
                data={formData}
                onSubmit={onSubmit}
                error={error ? error : !passwordMatch ? "Passwords do not match. Please try again" : ''}
            />
        </>
    );
}