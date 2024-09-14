import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import { useEffect, useRef } from "react";
import { getPFIsOffering } from "../../messages/messageActions";
import { useDispatch } from "react-redux";

export default function PaymentCurrency({ data, error }) {
    const formHook = useForm();
    const formRef = useRef(null);
    const dispatch = useDispatch();


    useEffect(() => {
        const handleChange = (e) => {
            const payinCurrency = formRef.current?.elements?.payinCurrencyCode?.value;
            const payoutCurrency = formRef.current?.elements?.payoutCurrencyCode?.value;
            const minUnit = formRef.current?.elements?.minUnit?.value;
            const maxUnit = formRef.current?.elements?.maxUnit?.value;
    
            const payment = {
                payinCurrencyCode: payinCurrency,
                payoutCurrencyCode: payoutCurrency,
                minUnit,
                maxUnit,
            };
    
            if (e.target.name === 'payinCurrencyCode') {
                payment.payoutCurrencyCode = null;
            }
    
            dispatch(getPFIsOffering(payment));
        };
    
        const formElements = formRef.current?.elements;
    
        if (formElements) {
            formElements.payinCurrencyCode?.addEventListener("change", handleChange);
            formElements.payoutCurrencyCode?.addEventListener("change", handleChange);
            formElements.minUnit?.addEventListener("input", handleChange);
            formElements.maxUnit?.addEventListener("input", handleChange);
        }
    
        return () => {
            if (formElements) {
                formElements.payinCurrencyCode?.removeEventListener("change", handleChange);
                formElements.payoutCurrencyCode?.removeEventListener("change", handleChange);
                formElements.minUnit?.removeEventListener("input", handleChange);
                formElements.maxUnit?.removeEventListener("input", handleChange);
            }
        };
    }, [dispatch, data]);

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
