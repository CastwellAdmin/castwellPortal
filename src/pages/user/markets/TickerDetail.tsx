import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketStore } from '../../../store/marketStore';
import { Card } from '../../../components/Card';
import { LineChart } from '../../../components/charts/LineChart';
import { Button } from '../../../components/forms/Button';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function TickerDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { selectedTicker, priceHistory, fetchPriceHistory } = useMarketStore();

  useEffect(() => {
    if (symbol) {
      fetchPriceHistory(symbol);
    }
  }, [symbol]);

  if (!selectedTicker) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const isPositive = selectedTicker.changePercent >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/markets/watchlist')}
          className="mr-4"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedTicker.symbol}</h1>
          <p className="text-gray-600">{selectedTicker.name}</p>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Current Price</p>
          <p className="text-3xl font-bold text-gray-900">
            ${selectedTicker.price.toFixed(2)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Change</p>
          <div className="flex items-center">
            {isPositive ? (
              <FiTrendingUp className="text-green-600 mr-2" size={24} />
            ) : (
              <FiTrendingDown className="text-red-600 mr-2" size={24} />
            )}
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${selectedTicker.change.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">% Change</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}
            {selectedTicker.changePercent.toFixed(2)}%
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Volume</p>
          <p className="text-2xl font-bold text-gray-900">
            {selectedTicker.volume.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Price Chart */}
      <Card title="Price History (30 Days)">
        <LineChart
          data={priceHistory}
          xKey="date"
          yKey="close"
          height={400}
          color={isPositive ? '#10b981' : '#ef4444'}
        />
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Stock Information">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sector</span>
              <span className="font-medium text-gray-900">{selectedTicker.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Market</span>
              <span className="font-medium text-gray-900">{selectedTicker.market}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Symbol</span>
              <span className="font-medium text-gray-900">{selectedTicker.symbol}</span>
            </div>
          </div>
        </Card>

        <Card title="Price Statistics">
          <div className="space-y-3">
            {priceHistory.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">30-Day High</span>
                  <span className="font-medium text-green-600">
                    ${Math.max(...priceHistory.map((p) => p.high)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">30-Day Low</span>
                  <span className="font-medium text-red-600">
                    ${Math.min(...priceHistory.map((p) => p.low)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Volume</span>
                  <span className="font-medium text-gray-900">
                    {(
                      priceHistory.reduce((sum, p) => sum + p.volume, 0) /
                      priceHistory.length
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
