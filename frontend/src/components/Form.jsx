import FormField from "./FormField";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';

export default function Form({ title, data, onSubmit, SubmitLabel = 'Submit', error }) {
    const formHook = useForm();
    const { handleSubmit } = formHook;

    return (
        <form
            className="flex justify-center flex-col m-auto w-10/12 gap-8 my-32"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <FormField data={data} hook={formHook} />
            {error && <p role="alert" className="text-red-500">{error}</p>}

            <input
                type="submit"
                value={SubmitLabel}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
            />
        </form>
    );
}

Form.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    SubmitLabel: PropTypes.string,
    error: PropTypes.string
};
