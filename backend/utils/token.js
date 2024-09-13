import axios from 'axios';

export async function getVCTokens(customerName, countryCode, customerDID) {
    const vcToken = await axios.get(`https://mock-idv.tbddev.org/kcc?name=${customerName}&country=${countryCode}&did=${customerDID}`);

    return vcToken.data;
}