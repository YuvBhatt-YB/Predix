export const formatAmount = (value,type="BUY") => {
  const [intPart, decPart] = value.toString().split(".");

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatted =  decPart !== undefined
    ? `${formattedInt}.${decPart}`
    : `${formattedInt}`;

  return type === "BUY" ? `$${formatted}` : formatted
};

export const formatCurrency = (value) => {
  const num = Number(value || 0);

  return `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
export const formatLimitPriceAmount = (value) => {
  return `${value}¢`
}


export const parseAmount = (value) => {
  return Number(value.replace(/[$,]/g, "") || 0);
};
export const parseLimitPrice = (value) => {
  return Number(value.replace(/[,¢]/g, "") || 0);
};

export const calculatePayout = (amount, option, currentPrice) => {
  const price = option === "YES" ? currentPrice.YES : currentPrice.NO;
  const shares = amount / price;
  const payout = (shares * 1).toFixed(1);

  return payout;
};

export const calculateTotalLimitAmount =(price,shares) =>{
  const finalPrice = price/100
  const total = finalPrice * shares

  return total
}

export const calculateTotalLimitPayout = (price,shares) => {
  const finalPrice = price/100
  const total = shares * finalPrice
  const toWin = shares * 1

  const profit = toWin - total

  return profit
}

export const calculateSellAmount = (shares,option,currentPrice) => {
  const price = option === "YES" ? currentPrice.YES : currentPrice.NO;
  const payout = (shares * price).toFixed(1)

  return payout;
}

export const formatVolume = (volume) => {
    if (volume < 1000) {
        return volume.toFixed(2)
    }

    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(volume)
}

export const roundQuantity = (value) => {
  return Math.floor(value*100)/100
}

