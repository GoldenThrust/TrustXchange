import { Header } from "./header.jsx";
import { useForm } from "react-hook-form";
import { countryCode } from "../../utils/constant.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../../auth/authActions.jsx';
import { useEffect, useState } from "react";
import FormField from "../../components/FormField.jsx";
import { Link, useNavigate } from "react-router-dom";


export default function SignUp() {
  const formHoot = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formHoot;
  const dispatch = useDispatch();

  const { isAuthenticated, loading, response, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }

    if (!loading && !error && response) {
      navigate(`/status?query=${response}`, { replace: true });
    }
  }, [isAuthenticated, loading, error, navigate, response]);


  const formData = [
    { register: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
    { register: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email address' },
    { register: 'password', label: 'Password', type: 'password', placeholder: 'Create a secure password' },
    { register: 'c-password', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter your password' },
    { register: 'phonenumber', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number with country code' },
    { register: 'address', label: 'Street Address', type: 'text', placeholder: 'Enter your street address' },
    { register: 'city', label: 'City', type: 'text', placeholder: 'Enter your city' },
    { register: 'state', label: 'State/Province', type: 'text', placeholder: 'Enter your state or province' },
    { register: 'zip', label: 'Postal/Zip Code', type: 'number', placeholder: 'Enter your postal or zip code' },
  ];


  const onSubmit = async (data) => {
    if (data.password !== data['c-password']) {
      setPasswordMatch(false)
    } else {
      const form = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image') {
          form.append(key, value[0])
        } else {
          form.append(key, value)
        }
      });

      dispatch(signup(form));
      setPasswordMatch(true)
    }
  };


  return (
    <>
      <Header />
      <form
        className="flex justify-center flex-col m-auto w-10/12 gap-8"
        encType="multipart/form-data"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-3xl font-bold text-gray-900">Sign Up</h2>
        <FormField data={formData} hook={formHoot} />

        <label
          htmlFor="countrycode"
          className="text-gray-700 font-medium mb-1 gap-4 flex flex-col"
        >
          Country
          <select
            {...register("countrycode", { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(countryCode).map((data, key) => (
              <option value={data[0]} key={key}>{data[1]}</option>
            ))}
          </select>
          {errors.countrycode && <p role="alert" className="text-red-500">This field is required</p>}
        </label>

        <label
          htmlFor="file"
          className="text-gray-700 font-medium mb-1 gap-4 flex flex-col"
        >
          Profile Picture
          <input
            type="file"
            {...register("image")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {!passwordMatch && <p role="alert" className="text-red-500">Passwords do not match. Please try again.</p>}
        {error && <p role="alert" className="text-red-500">{error}</p>}


        <input
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
        />
      </form>
      <div className="m-auto w-10/12 my-10">
        <Link to="/login" className="text-indigo-600">
          Already have an account? Sign in
        </Link>
      </div>
    </>
  )
};
