import { Header } from './header.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { accountActivation } from '../../auth/authActions.jsx';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AccountActivate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            const timer = setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (token) {
            dispatch(accountActivation(token));
        }
    }, [dispatch, token]);

    return (
        <div>
            <Header />
            {
                loading ? (
                    <h1 className='font-extrabold text-4xl text-center'>Activating Account</h1>
                ) : (
                    <>
                        <h1 className='font-extrabold text-4xl text-center'>Account Activated</h1>
                        <p className='font-thin text-4xl text-center'>
                            Your account has been successfully activated. You will be redirected in 3 seconds.
                        </p>
                    </>
                )
            }
            {error && <p role="alert" className="text-red-500 font-thin text-4xl text-center">{error}</p>}
        </div>
    );
}
