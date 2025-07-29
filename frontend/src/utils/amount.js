export const formatAmount = (value) => {
  const [intPart, decPart] = value.toString().split(".");

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decPart !== undefined
    ? `$${formattedInt}.${decPart}`
    : `$${formattedInt}`;
};
export const parseAmount = (value) => {
  return Number(value.replace(/[$,]/g, "") || 0);
};

export const calculatePayout = (amount, option, currentPrice) => {
  const price = option === "yes" ? currentPrice.yes : currentPrice.no;
  const shares = amount / price;
  const payout = (shares * 1).toFixed(1);

  return payout;
};
