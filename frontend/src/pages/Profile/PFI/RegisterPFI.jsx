import { Header } from '../../../components/Header.jsx';
import FormField from "../../../components/FormField.jsx";
import { useForm } from "react-hook-form";
import { useAuth } from '../../../hook/auth.js';

export default function RegisterPFI() {
    useAuth();
    const formHoot = useForm();

    const {
        register,
        handleSubmit,
    } = formHoot;

    const formData = [
        { register: 'name', label: 'PFI Name', type: 'text', placeholder: 'Enter your PFI name' },
        { register: 'pfiDid', label: 'Pfi Did', type: 'text', placeholder: 'Enter your PFI DID URI' }
    ];
    const onSubmit = (data) => {
        console.log('Form data:', data);
    };

    return (
        <>
            <Header />
            <form
                className="flex justify-center flex-col m-auto w-10/12 gap-8"
                encType="multipart/form-data"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h2 className="text-3xl font-bold text-gray-900">Sign Up as PFI</h2>
                <FormField data={formData} hook={formHoot} />

                <label
                    htmlFor="file"
                    className="text-gray-700 font-medium mb-1 gap-4 flex flex-col"
                >
                    Upload ID Card Picture
                    <input
                        type="file"
                        {...register("image")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*"
                        capture="environment"
                    />
                </label>

                <input
                    type="submit"
                    value="Create Account"
                    className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
                />
            </form>
        </>
    );
}
