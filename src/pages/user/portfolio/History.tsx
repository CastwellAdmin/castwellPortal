import { useEffect } from 'react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { Card } from '../../../components/Card';
import { LineChart } from '../../../components/charts/LineChart';

export default function History() {
  const { performanceHistory, fetchPerformanceHistory } = usePortfolioStore();

  useEffect(() => {
    fetchPerformanceHistory();
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Performance History">
        <LineChart
          data={performanceHistory}
          xKey="date"
          yKey="value"
          height={500}
          color="#0ea5e9"
        />
      </Card>

      <Card title="Performance Metrics">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Starting Value</p>
            <p className="text-xl font-bold text-gray-900">
              ${performanceHistory[0]?.value.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Value</p>
            <p className="text-xl font-bold text-gray-900">
              $
              {performanceHistory[performanceHistory.length - 1]?.value.toLocaleString() ||
                '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Change</p>
            <p className="text-xl font-bold text-green-600">
              +$
              {(
                (performanceHistory[performanceHistory.length - 1]?.value || 0) -
                (performanceHistory[0]?.value || 0)
              ).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">% Change</p>
            <p className="text-xl font-bold text-green-600">
              +
              {performanceHistory.length > 0
                ? (
                    ((performanceHistory[performanceHistory.length - 1].value -
                      performanceHistory[0].value) /
                      performanceHistory[0].value) *
                    100
                  ).toFixed(2)
                : '0'}
              %
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
