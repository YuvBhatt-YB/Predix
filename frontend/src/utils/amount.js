export const formatAmount = (value,type="buy") => {
  const [intPart, decPart] = value.toString().split(".");

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatted =  decPart !== undefined
    ? `${formattedInt}.${decPart}`
    : `${formattedInt}`;

  return type === "buy" ? `$${formatted}` : formatted
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

export const calculateSellAmount = (shares,option,currentPrice) => {
  const price = option === "yes" ? currentPrice.yes : currentPrice.no;
  const payout = (shares * price).toFixed(1)

  return payout;
}