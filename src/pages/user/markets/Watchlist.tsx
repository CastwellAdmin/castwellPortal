import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketStore } from '../../../store/marketStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import type { StockTicker } from '../../../types';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function Watchlist() {
  const navigate = useNavigate();
  const { tickers, fetchTickers } = useMarketStore();

  useEffect(() => {
    fetchTickers();
  }, []);

  const columns = [
    {
      header: 'Symbol',
      accessor: 'symbol' as keyof StockTicker,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Name',
      accessor: 'name' as keyof StockTicker,
    },
    {
      header: 'Price',
      accessor: (row: StockTicker) => `$${row.price.toFixed(2)}`,
      className: 'font-medium',
    },
    {
      header: 'Change',
      accessor: (row: StockTicker) => {
        const isPositive = row.change >= 0;
        return (
          <div className="flex items-center">
            {isPositive ? (
              <FiTrendingUp className="text-green-600 mr-1" />
            ) : (
              <FiTrendingDown className="text-red-600 mr-1" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}${row.change.toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      header: '% Change',
      accessor: (row: StockTicker) => {
        const isPositive = row.changePercent >= 0;
        return (
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}
            {row.changePercent.toFixed(2)}%
          </span>
        );
      },
    },
    {
      header: 'Volume',
      accessor: (row: StockTicker) => row.volume.toLocaleString(),
      className: 'text-gray-600',
    },
    {
      header: 'Sector',
      accessor: 'sector' as keyof StockTicker,
      className: 'text-gray-600',
    },
    {
      header: 'Market',
      accessor: 'market' as keyof StockTicker,
      className: 'text-gray-600',
    },
  ];

  const handleRowClick = (ticker: StockTicker) => {
    navigate(`/dashboard/markets/watchlist/${ticker.symbol}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Stocks</p>
          <p className="text-2xl font-bold text-gray-900">{tickers.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Gainers</p>
          <p className="text-2xl font-bold text-green-600">
            {tickers.filter((t) => t.changePercent > 0).length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Losers</p>
          <p className="text-2xl font-bold text-red-600">
            {tickers.filter((t) => t.changePercent < 0).length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Unchanged</p>
          <p className="text-2xl font-bold text-gray-600">
            {tickers.filter((t) => t.changePercent === 0).length}
          </p>
        </Card>
      </div>

      <Card title="Watchlist">
        <Table data={tickers} columns={columns} onRowClick={handleRowClick} />
      </Card>
    </div>
  );
}
