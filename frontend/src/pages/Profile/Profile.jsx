import { useSelector } from "react-redux";
import { Header } from "../../components/Header.jsx";
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form";
import { baseUrl } from "../../utils/constant.js";
import { useAuth } from "../../hook/auth.js";
import { useRef, useEffect } from "react";
import axios from 'axios';
import toast from 'react-hot-toast';
export default function Profile() {
    useAuth();
    const { user } = useSelector((state) => state.auth);
    const {
        register,
        handleSubmit,
    } = useForm();

    const onSubmit = async (data) => {
        const form = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'image') {
                form.append(key, value[0])
            } else {
                form.append(key, value)
            }
        });

        form.append('img', user.image);

        try {
            toast.loading("Updating your Profile...", { id: "updateprofile" })
            await axios.post('auth/update-profile', form);
            toast.success("Profile updated successfully!", { id: "updateprofile" })
          } catch (error) {
            console.error(error);
            toast.error("Failed to update Profile", { id: "updateprofile" })
          }
    }

    const onProfilePicsChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                profileImage.current.src = e.target.result;
            };
            fileReader.readAsDataURL(file);
        }
    };


    const profileImage = useRef();

    useEffect(() => {
        if (user) {
            profileImage.current.src = baseUrl + user.image
        }
    }, [user])



    console.log(user)
    return (
        <div>
            <Header className="flex justify-between px-10" >
                <Link to="/dashboard" className="hover:text-cyan-400 text-cyan-700 border-y-4">Dashboard</Link>
            </Header>
            <main>
                {
                    user && <>
                        <div className="block space-y-5 font-mono">
                            <div className="w-1/6 m-auto overflow-hidden relative" style={{ borderRadius: '50%', aspectRatio: '1' }}>
                                <input type='file' {...register('image')} form="profileForm" className="absolute w-full h-full opacity-0" onChange={onProfilePicsChange} />
                                <img ref={profileImage}
                                    alt="profile" className="hover:bg-slate-700 hover:opacity-95 transition-opacity object-cover" accept="image/*">
                                </img>
                            </div>
                            <div className="text-center text-3xl font-semibold my-5">
                                {user.name}
                            </div>
                            <div className="flex justify-evenly flex-wrap">
                                <span><span className="font-semibold">DID: </span>{user.did}</span> <span><span className="font-semibold">VC: </span>{user.vc}</span> <span><span className="font-semibold">Email: </span>{user.email}</span> <span><span className="font-semibold">Phone Number: </span>{user.phonenumber}</span>
                            </div>
                            <div className="flex justify-evenly flex-wrap">
                                <span><span className="font-semibold">Address</span> {user.address}</span>
                                <span><span className="font-semibold">City</span> {user.city}</span>
                                <span><span className="font-semibold">State</span> {user.state}</span>
                                <span><span className="font-semibold">Zip Code</span> {user.zip}</span>
                            </div>
                            <label htmlFor="vc" className="text-center block font-extrabold" > Add VC: </label>
                            <textarea form="profileForm" {...register('vc')} className="resize-none w-5/6 m-auto block border-2"></textarea>

                            <form id="profileForm" onSubmit={handleSubmit(onSubmit)}>
                                <input
                                    type="submit"
                                    value="Save Changes"
                                    className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
                                />
                            </form>
                        </div>
                    </>
                }

            </main>
        </div>
    );
}