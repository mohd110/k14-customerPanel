// Prices are stored in whole rupees in the DB.
export const money = (rupees: number) => `₹${rupees.toLocaleString('en-IN')}`
