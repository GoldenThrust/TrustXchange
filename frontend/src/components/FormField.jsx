export default function FormField({ data, hook }) {
    const {
        register,
        formState: { errors },
    } = hook;


    return (
        data.map((data, key) => (
            <label
                htmlFor={data.register}
                className="text-gray-700 font-medium mb-1 gap-4 flex flex-col"
                key={key}
            >
                {data.label}
                <input
                    {...register(data.register, { required: true })}
                    type={data.type}
                    placeholder={data.placeholder}
                    defaultValue={data.defaultValue || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focusa:ring-2 focus:ring-blue-500"
                />
                {errors[data.register] && <p role="alert" className="text-red-500">This field is required</p>}
            </label>
        ))
    )
}