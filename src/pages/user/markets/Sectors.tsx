import { useEffect } from 'react';
import { useMarketStore } from '../../../store/marketStore';
import { Card } from '../../../components/Card';
import { BarChart } from '../../../components/charts/BarChart';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function Sectors() {
  const { sectors, fetchSectors } = useMarketStore();

  useEffect(() => {
    fetchSectors();
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Sector Performance">
        <BarChart
          data={sectors}
          xKey="name"
          yKey="performance"
          height={350}
          color="#0ea5e9"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map((sector) => {
          const isPositive = sector.performance >= 0;
          return (
            <Card key={sector.name}>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{sector.name}</h3>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance</span>
                  <div className="flex items-center">
                    {isPositive ? (
                      <FiTrendingUp className="text-green-600 mr-1" />
                    ) : (
                      <FiTrendingDown className="text-red-600 mr-1" />
                    )}
                    <span
                      className={`font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {sector.performance.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Volume</span>
                  <span className="font-medium text-gray-900">
                    {sector.volume.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
