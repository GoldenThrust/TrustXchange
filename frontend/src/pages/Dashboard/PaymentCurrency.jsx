import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import { useEffect, useRef } from "react";
import { filterOffer } from "../../messages/messageActions";
import { useDispatch } from "react-redux";

export default function PaymentCurrency({ data, error }) {
    const formHook = useForm();
    const formRef = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const handleChange = () => {
            const payinCurrency = formRef.current?.elements?.payinCurrencyCode?.value;
            const payoutCurrency = formRef.current?.elements?.payoutCurrencyCode?.value;

            if (payinCurrency && payoutCurrency) {
                const payment = {
                    'payinCurrencyCode': payinCurrency,
                    'payoutCurrencyCode': payoutCurrency
                };
                dispatch(filterOffer(payment));
            }
        };

        const formElements = formRef.current?.elements;
        if (formElements) {
            formElements.payinCurrencyCode?.addEventListener("change", handleChange);
            formElements.payoutCurrencyCode?.addEventListener("change", handleChange);
        }

        return () => {
            formElements?.payinCurrencyCode?.removeEventListener("change", handleChange);
            formElements?.payoutCurrencyCode?.removeEventListener("change", handleChange);
        };
    }, [formHook, data, error, dispatch]);

    return (
        <>
            <form
                className="grid grid-cols-2 justify-between gap-10 mt-4"
                ref={formRef}
            >
                <FormField data={data} hook={formHook} />
                {error && <p role="alert" className="text-red-500">{error}</p>}
            </form>
        </>
    );
}

PaymentCurrency.propTypes = {
    data: PropTypes.array.isRequired,
    error: PropTypes.string,
};
