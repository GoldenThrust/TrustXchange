import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { baseUrl } from "../../utils/constant.js";

export default function Headers() {
    const { user } = useSelector((state) => state.auth);
    const { pfiOfferings } = useSelector((state) => state.xchange);

    const profileImage = useRef();

    useEffect(() => {
        if (user) {
            profileImage.current.src = baseUrl + user.image
        }
    }, [user, pfiOfferings])

    return (
        <header aria-label="Global" className="flex items-center justify-between p-4 lg:px-8">
            <a href="/" className="m-1.5 p-1.5">
                <span className="m-auto sr-only">TrustXchange</span>
                <img
                    alt="logo"
                    src="logo.svg"
                    className="m-auto h-8 w-auto"
                />
            </a>
            <div className="flex flex-row place-items-center gap-2 sm:gap:10">
                <Link to='/transactions' className="text-nowrap hover:text-orange-600 border-solid border-y-2">Transactions History</Link>
                <Link to='#'>
                    <img
                        ref={profileImage}
                        alt="profile"
                        className="rounded-full object-cover w-10 sm:w-12 border-2 border-stone-700"
                        style={{ borderRadius: '50%', aspectRatio: '1' }}
                        src="https://via.placeholder.com/150"
                    />
                </Link>
            </div>
        </header >
    )
}
