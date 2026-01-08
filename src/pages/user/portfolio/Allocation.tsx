import { useEffect } from 'react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { Card } from '../../../components/Card';
import { PieChart } from '../../../components/charts/PieChart';

export default function Allocation() {
  const { portfolio, fetchPortfolio } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Calculate allocation by sector
  const sectorAllocation = portfolio?.assets.reduce((acc, asset) => {
    const value = asset.quantity * asset.currentPrice;
    if (acc[asset.sector]) {
      acc[asset.sector] += value;
    } else {
      acc[asset.sector] = value;
    }
    return acc;
  }, {} as Record<string, number>);

  const sectorData = Object.entries(sectorAllocation || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate allocation by asset
  const assetData =
    portfolio?.assets.map((asset) => ({
      name: asset.symbol,
      value: asset.quantity * asset.currentPrice,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Allocation by Sector">
          <PieChart data={sectorData} nameKey="name" valueKey="value" height={400} />
          <div className="mt-4 space-y-2">
            {sectorData.map((sector) => (
              <div key={sector.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{sector.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  ${sector.value.toLocaleString()} (
                  {((sector.value / (portfolio?.totalValue || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Allocation by Asset">
          <PieChart data={assetData} nameKey="name" valueKey="value" height={400} />
          <div className="mt-4 space-y-2">
            {assetData.slice(0, 5).map((asset) => (
              <div key={asset.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{asset.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  ${asset.value.toLocaleString()} (
                  {((asset.value / (portfolio?.totalValue || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
