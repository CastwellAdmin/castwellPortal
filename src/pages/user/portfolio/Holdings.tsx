import { useEffect } from 'react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import type { PortfolioAsset } from '../../../types';

export default function Holdings() {
  const { portfolio, fetchPortfolio } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const columns = [
    {
      header: 'Symbol',
      accessor: 'symbol' as keyof PortfolioAsset,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Name',
      accessor: 'name' as keyof PortfolioAsset,
    },
    {
      header: 'Quantity',
      accessor: 'quantity' as keyof PortfolioAsset,
    },
    {
      header: 'Purchase Price',
      accessor: (row: PortfolioAsset) => `$${row.purchasePrice.toFixed(2)}`,
    },
    {
      header: 'Current Price',
      accessor: (row: PortfolioAsset) => `$${row.currentPrice.toFixed(2)}`,
    },
    {
      header: 'Total Value',
      accessor: (row: PortfolioAsset) =>
        `$${(row.quantity * row.currentPrice).toLocaleString()}`,
      className: 'font-medium',
    },
    {
      header: 'Gain/Loss',
      accessor: (row: PortfolioAsset) => {
        const gain = (row.currentPrice - row.purchasePrice) * row.quantity;
        const gainPercent =
          ((row.currentPrice - row.purchasePrice) / row.purchasePrice) * 100;
        return (
          <span className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
            {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent.toFixed(2)}%)
          </span>
        );
      },
    },
    {
      header: 'Sector',
      accessor: 'sector' as keyof PortfolioAsset,
      className: 'text-gray-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">
            ${portfolio?.totalValue.toLocaleString() || '0'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
          <p
            className={`text-2xl font-bold ${
              (portfolio?.totalGain || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {(portfolio?.totalGain || 0) >= 0 ? '+' : ''}$
            {portfolio?.totalGain.toLocaleString() || '0'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Return</p>
          <p
            className={`text-2xl font-bold ${
              (portfolio?.totalGainPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {(portfolio?.totalGainPercent || 0) >= 0 ? '+' : ''}
            {portfolio?.totalGainPercent.toFixed(2) || '0'}%
          </p>
        </Card>
      </div>

      <Card title="Holdings">
        <Table data={portfolio?.assets || []} columns={columns} />
      </Card>
    </div>
  );
}
