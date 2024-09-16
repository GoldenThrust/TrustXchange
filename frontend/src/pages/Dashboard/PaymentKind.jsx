import FormField from "../../components/FormField.jsx";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { selectPaymentsDetails } from "../../messages/messageActions.js";

export default function PaymentKindsForm({ data, error }) {
    const formHook = useForm();
    const { handleSubmit } = formHook;
    const dispatch = useDispatch();
    const { selectedOfferings } = useSelector((state) => state.xchange);

    const onSubmit = (data) => {
        let value = Object.values(data);
        if (value[0] && value[1]) {
            const paymentDetails = {
                "kind": data,
                "details": {
                    "payIn": [],
                    "payOut": [],
                    "estimatedSettlementTime": '',
                },
            }

            selectedOfferings.data.payin.methods.forEach((method) => {
                if (method.kind === data.payinKind) {
                    paymentDetails.details.payIn = method.requiredPaymentDetails.required;
                }
            })
            selectedOfferings.data.payout.methods.forEach((method) => {
                if (method.kind === data.payoutKind) {
                    paymentDetails.details.payOut = method.requiredPaymentDetails.required
                    paymentDetails.details.estimatedSettlementTime = method.estimatedSettlementTime
                }
            })


            dispatch(selectPaymentsDetails(paymentDetails));
        }
    }



    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 justify-between gap-10 mt-4">
                <FormField data={data} hook={formHook} />
                {error && <p role="alert" className="text-red-500">{error}</p>}
                <div className="col-span-2">
                    <input
                        type="submit"
                        value="Next Step"
                        className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    />
                </div>
            </form>

        </>
    );
}

PaymentKindsForm.propTypes = {
    data: PropTypes.array.isRequired,
    error: PropTypes.string,
};
