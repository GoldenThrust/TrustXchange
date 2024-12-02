import fs from 'fs';
import PFI from '../models/pfi.js';
import User from '../models/user.js';
import db from './db.js';
import Transactions from '../models/transactions.js';

await db().catch(console.dir);

// Find the user by email
const user = await User.findOne({ email: 'adenijiolajid01@gmail.com' });

// Read and parse the PFI data from the JSON file
const pfiData = JSON.parse(fs.readFileSync('pfi.json', {
    encoding: 'utf8'
}));

// Fetch all transactions
const transactions = await Transactions.find({}).populate('pfi');

// Loop through the transactions to update each one with the correct PFI
for (const t of transactions) {
    const pfi = await PFI.findOne({ name: t.quote.pfiName });
    console.log(t.pfi.name)
    
    if (pfi) {
        // Assign the found PFI's ObjectId to the transaction's pfi field
        t.pfi = pfi;

        // Save the updated transaction
        await t.save();

    } else {
        console.log(`PFI not found for transaction ${t._id}`);
    }
}
// const distinctPFIs = await Transactions.distinct('pfi');
// console.log(distinctPFIs);
