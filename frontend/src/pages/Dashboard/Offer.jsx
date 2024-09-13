import { selectedOffer } from "../../messages/messageActions";
import { useDispatch, useSelector } from "react-redux";
import { formattedDate } from "../../utils/functions";
import { useEffect, useMemo, useState } from "react";

export default function Offer() {
    const { filterOfferings, selectedOfferings } = useSelector((state) => state.xchange);

    const [pfiOfferingsData, setPfiOfferingsData] = useState({});
    const dispatch = useDispatch();

    
    const memoizedOfferingsData = useMemo(() => {
        return filterOfferings;
    }, [filterOfferings]);


    const getOfferingId = (id) => () => {
        if (selectedOfferings?.id === id) {
            dispatch(selectedOffer(null));
        } else {
            const filteredOffering = Object.values(filterOfferings)
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
            <div className="grid gap-3 grid-cols-1 xl:grid-cols-2 w-full justify-between
                        h-80 sm:h-auto sm:border-hidden border-solid border-2 border-indigo-400 rounded-lg sm:shadow-none shadow-xl
                        overflow-x-hidden  
                        sm:overflow-x-visible">
                {pfiOfferingsData && Object.keys(pfiOfferingsData).length ? (
                    Object.entries(pfiOfferingsData).map(([pfiName, offerings]) =>
                        offerings.map((offering) => {
                            const isSelected = selectedOfferings?.id === offering.metadata.id;

                            return (
                                <div
                                    key={offering.metadata.id}
                                    id={offering.metadata.id}
                                    onClick={getOfferingId(offering.metadata.id)}
                                    className={`bg-indigo-500 p-2 text-zinc-50 rounded-lg  h-20 flex flex-col place-content-center ${isSelected ? 'border border-red-600 bg-slate-600 animate-bounce' : ''}`}
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
                ) : (
                    <div className="animate-bounce">loading......</div>
                )}
            </div></>
    )
}