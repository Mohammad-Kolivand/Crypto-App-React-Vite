const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = "CG-s7qzVP5JkqcViucWRDNHhY2z";

const getCoinList = (page, currency) => {
  return `${BASE_URL}/coins/markets?vs_currency=${currency}&per_page=20&page=${page}&x_cg_api_key=${API_KEY}`;
};

const searchCoin = (query) =>
  `${BASE_URL}/search?query=${query}&x_cg_api_key=${API_KEY}`;

const marketChart = (coin) =>
  `${BASE_URL}/coins/${coin}/market_chart?vs_currency=usd&days=7`;

export { getCoinList, searchCoin, marketChart };
