import { selectedOffer } from "../../messages/messageActions.jsx";
import { useDispatch, useSelector } from "react-redux";
import { formattedDate } from "../../utils/functions.jsx";
import { useEffect, useMemo, useState } from "react";

export default function Offer() {
    const { pfiOfferings, selectedOfferings, filtering } = useSelector((state) => state.xchange);

    const [pfiOfferingsData, setPfiOfferingsData] = useState({});
    const dispatch = useDispatch();

    
    const memoizedOfferingsData = useMemo(() => {
        return pfiOfferings;
    }, [pfiOfferings]);


    const getOfferingId = (id) => () => {
        if (selectedOfferings?.id === id) {
            dispatch(selectedOffer(null));
        } else {
            const filteredOffering = Object.values(pfiOfferings)
                .flatMap((offerings) => offerings.filter((offer) => offer.metadata.id === id))[0];

            dispatch(selectedOffer({ id: filteredOffering.metadata.id, ...filteredOffering }));
        }
    };

    useEffect(()=> {
        setPfiOfferingsData(memoizedOfferingsData);
    }, [memoizedOfferingsData])

    return (
        <>
            <h3 className="mt-4 font-bold text-xl my-5 ">Offering</h3>
            <div className="grid gap-3 grid-cols-1 xl:grid-cols-2
                        max-h-80 sm:h-auto sm:border-hidden border-solid border-2 border-indigo-400 rounded-lg sm:shadow-none shadow-xl
                        overflow-x-hidden  
                        sm:overflow-x-visible">
                            {console.log(filtering)}
                {pfiOfferingsData && Object.keys(pfiOfferingsData).length ? (
                    Object.entries(pfiOfferingsData).map(([pfiName, offerings]) =>
                        offerings.map((offering) => {
                            const isSelected = selectedOfferings?.id === offering.metadata.id;

                            return (
                                <div
                                    key={offering.metadata.id}
                                    id={offering.metadata.id}
                                    onClick={getOfferingId(offering.metadata.id)}
                                    className={`p-2 text-zinc-50 rounded-lg h-20 flex flex-col place-content-center ${offering.verificationFailed ? 'bg-red-500' : 'bg-indigo-500'} ${isSelected ? 'border border-green-600 shadow-md bg-violet-600 animate-bounce' : ''}`}
                                >
                                    <div className="flex justify-between">
                                        <span className="text-sm font-bold">{pfiName}</span>
                                        <span className="font-light text-xs">Created at: {formattedDate(offering.metadata.createdAt)}</span>
                                    </div>
                                    <div className="text-xs"><b>Payout per pay-in unit:</b> {offering.data.payoutUnitsPerPayinUnit}</div>
                                    <div className="font-thin text-xs">{offering.data.description}</div>
                                    {offering.verificationFailed && <span className="text-red-600 float-right">Invalid Credential</span>}
                                </div>
                            );
                        })
                    )
                ) : filtering ? (
                    <div className="animate-bounce">No offerings match your filter criteria. Please adjust your filters.</div>
                ) : 'loading.....'}
            </div></>
    )
}