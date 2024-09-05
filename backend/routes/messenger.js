import { Router } from "express";

const messengerRoute = Router();


messengerRoute.get("/getoffering", async (req, res) => {
    const response = [];
    for (const key in pfiDids) {
        const offerings = await TbdexHttpClient.getOfferings({ pfiDid: pfiDids[key] });

        response.push({
            key,
            offerings
        })
    }

    res.json(response);
});


export default messengerRoute;