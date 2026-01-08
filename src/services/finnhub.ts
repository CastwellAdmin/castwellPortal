// Finnhub API Service
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export const finnhubService = {
  // Get real-time quote for a stock symbol
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch quote');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  },

  // Get company profile
  async getProfile(symbol: string): Promise<FinnhubProfile | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return null;
    }
  },

  // Get candles (historical data)
  async getCandles(
    symbol: string,
    resolution: 'D' | 'W' | 'M' = 'D',
    from: number,
    to: number
  ) {
    try {
      const response = await fetch(
        `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch candles');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      return null;
    }
  },

  // Batch fetch quotes for multiple symbols
  async getBatchQuotes(symbols: string[]) {
    const promises = symbols.map((symbol) => this.getQuote(symbol));
    return await Promise.all(promises);
  },
};
