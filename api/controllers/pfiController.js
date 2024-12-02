import PFI from "../models/pfi.js";

class PfiController {
    async register(req, res) {
        const user = req.user;
        const { name, did } = req.body;

        const pfi = new PFI({ user, name, pfiDid: did })
        await pfi.save();

        res.status(201).json({ message: pfi, status: 'OK' });
    }

    subscribe(req, res) {}
}