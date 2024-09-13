import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { formattedTime } from "../../utils/functions";
import { requestForQuote } from "../../messages/messageActions";


export default function PaymentDetailsForm({ data, error }) {
    const formHook = useForm();
    const { handleSubmit } = formHook;
    const { selectedOfferings, selectedPaymentsKind, paymentsDetails } = useSelector((state) => state.xchange);
    const dispatch = useDispatch();

    const onSubmit = (formData) => {
        const payIn = {};
        const payOut = {};

        // Iterate over formData entries
        Object.entries(formData).forEach(([key, value]) => {
            if (key.startsWith('payin')) {
                payIn[key.slice(5)] = value;
            } else if (key.startsWith('payout')) {
                payOut[key.slice(6)] = value;
            }
        });

        const quoteInfo = {
            offering: JSON.stringify(selectedOfferings),
            amount: formData.amount,
            payinPaymentDetails: JSON.stringify(payIn),
            payoutPaymentDetails: JSON.stringify(payOut),
            payinKind: selectedPaymentsKind.payinKind,
            payoutKind: selectedPaymentsKind.payoutKind,
        };

        dispatch(requestForQuote(quoteInfo));
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white shadow-md rounded-lg p-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
            <div className="sm:col-span-2">
                <FormField data={data?.[2] || []} hook={formHook} />
            </div>

            {data?.[0]?.length !== 0 && (
                <div>
                    <span>
                        <div className="text-lg font-semibold text-gray-700 mb-2">
                            Payment Details
                        </div>
                        <FormField data={data?.[0] || []} hook={formHook} />
                    </span>
                </div>
            )}

            <div>
                <span>
                    {data?.[1]?.length !== 0 && (
                        <div className="text-lg font-semibold text-gray-700 mb-2">
                            {"Recipient's Payment Details"}
                        </div>
                    )}
                    <FormField data={data?.[1] || []} hook={formHook} />
                </span>
            </div>
            <span className="col-span-2">
                <p>{`Estimated Pay Out Time: ${formattedTime(paymentsDetails.estimatedSettlementTime)}`}</p>
            </span>
            {error && (
                <p role="alert" className="text-red-500 sm:col-span-2">
                    {error}
                </p>
            )}

            <div className="sm:col-span-2">
                <input
                    type="submit"
                    value="Request For Quote"
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-sm 
                    hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-gray-400"
                />
            </div>
        </form>
    );
}



PaymentDetailsForm.propTypes = {
    data: PropTypes.array.isRequired,
    error: PropTypes.string,
};
