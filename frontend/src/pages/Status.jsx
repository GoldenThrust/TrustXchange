import { Navigate, useLocation } from 'react-router-dom';
import { Header } from './Authentication/header.jsx';

export default function Status() {
    const location = useLocation();

    // Extract query parameters from the URL
    const queryParams = new URLSearchParams(location.search);

    // Get the value of the 'query' parameter
    const message = queryParams.get('query');

    if (!message) {
        return <Navigate to="/" />
    }

    return (
        <>
        <Header/>
            <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 align-middle">
                <div className="text-center">
                    <h1 className="mt-4 text-1xl font-medium tracking-tight text-gray-900 sm:text-4xl">{message}</h1>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <a
                            href="/"
                            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Go back home
                        </a>
                    </div>
                </div>
            </main>
        </>
    )
}