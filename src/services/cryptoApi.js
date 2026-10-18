const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = "CG-s7qzVP5JkqcViucWRDNHhY2z";

const getCoinList = (page, currency) => {
  return `${BASE_URL}/coins/markets?vs_currency=${currency}&per_page=20&page=${page}&x_cg_api_key=${API_KEY}`;
};

const searchCoin = (query) =>
  `${BASE_URL}/search?query=${query}&x_cg_api_key=${API_KEY}`;

const marketChart = (coin, days = 7, currency = "usd") =>
  `${BASE_URL}/coins/${encodeURIComponent(coin)}/market_chart?vs_currency=${encodeURIComponent(currency)}&days=${days}&x_cg_api_key=${API_KEY}`;

export { getCoinList, searchCoin, marketChart };
