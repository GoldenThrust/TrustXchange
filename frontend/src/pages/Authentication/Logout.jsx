import { useDispatch, useSelector } from 'react-redux';
import { Header } from '../../components/Header.jsx';
import { useEffect } from 'react';
import { logoutAction } from '../../auth/authActions.js';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const dispatch = useDispatch()
  const { isAuthenticated, error } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(logoutAction())
    if (!isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, dispatch, navigate])

  return (
    <div>
      <Header />
      <h1 className='font-extrabold text-4xl text-center'>Signing Out</h1>
      {error && <p role="alert" className="text-red-500 font-thin text-4xl text-center">{error}</p>}
    </div>
  )
};
