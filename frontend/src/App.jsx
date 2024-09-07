
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Home from './pages/Home/Home.jsx'
import Login from './pages/Authentication/Login.jsx'
import './styles/index.css'
import ErrorPage from "./404";
import { useDispatch } from 'react-redux'
import Status from './pages/status.jsx';
import SignUp from './pages/Authentication/SignUp.jsx';
import Logout from './pages/Authentication/Logout.jsx';
import ForgotPassword from './pages/Authentication/ForgotPassword.jsx';
import ResendActivationEmail from './pages/Authentication/ResendActivationToken.jsx';
import ResetPassword from './pages/Authentication/ResetPassword.jsx'
import AccountActivate from './pages/Authentication/AccountActivation.jsx';
import DashBoard from './pages/Dashboard/Dashboard.jsx';
import { useEffect } from "react";
import { verify } from "./auth/authActions.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        errorElement: <ErrorPage />,
    }, {
        path: "/login",
        element: <Login />,
    }, {
        path: "/signup",
        element: <SignUp />,
    }, {
        path: "/logout",
        element: <Logout />
    }, {
        path: "/forgot-Password",
        element: <ForgotPassword />
    }, {
        path: "/resend-activation-token",
        element: <ResendActivationEmail />
    }, {
        path: "/reset-password",
        element: <ResetPassword />
    }, {
        path: "/activate-account",
        element: <AccountActivate />
    }, {
        path: "/dashboard",
        element: <DashBoard />
    }, {
        path: "/status",
        element: <Status />
    }
])

export default function App() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(verify())
    }, [dispatch])
    return (
        <RouterProvider router={router} />
    )
}
