import { Header } from '../../components/Header.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { accountActivation } from '../../auth/authActions.js';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPFIsOffering, fetchTransactions, getActiveQuotes } from "../../messages/messageActions.js";

export default function AccountActivate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getActiveQuotes())
            dispatch(getPFIsOffering())
            dispatch(fetchTransactions())
            const timer = setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, navigate, dispatch]);

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
                ) : (error ? <p role="alert" className="text-red-500 font-thin text-4xl text-center">{error}</p> : <>
                    <h1 className='font-extrabold text-4xl text-center'>Account Activated</h1>
                    <p className='font-thin text-4xl text-center'>
                        Your account has been successfully activated. You will be redirected in 3 seconds.
                    </p>
                </>
                )
            }
        </div>
    );
}
