import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { useMarketStore } from '../../../store/marketStore';
import { useDocumentStore } from '../../../store/documentStore';
import { Card } from '../../../components/Card';
import { LineChart } from '../../../components/charts/LineChart';
import { FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';

export default function Overview() {
  const { portfolio, performanceHistory, fetchPortfolio, fetchPerformanceHistory } =
    usePortfolioStore();
  const { tickers, fetchTickers } = useMarketStore();
  const { documents, fetchDocuments } = useDocumentStore();

  useEffect(() => {
    fetchPortfolio();
    fetchPerformanceHistory();
    fetchTickers();
    fetchDocuments();
  }, []);

  const pendingDocuments = documents.filter((doc) => doc.status === 'pending');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <p className="text-3xl font-bold text-gray-900">
              ${portfolio?.totalValue.toLocaleString() || '0'}
            </p>
            <div className="flex items-center text-sm">
              {portfolio && portfolio.totalGain >= 0 ? (
                <>
                  <FiTrendingUp className="text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">
                    +${portfolio.totalGain.toLocaleString()} (
                    {portfolio.totalGainPercent.toFixed(2)}%)
                  </span>
                </>
              ) : (
                <>
                  <FiTrendingDown className="text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">
                    -${Math.abs(portfolio?.totalGain || 0).toLocaleString()} (
                    {portfolio?.totalGainPercent.toFixed(2)}%)
                  </span>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Assets</p>
            <p className="text-3xl font-bold text-gray-900">
              {portfolio?.assets.length || 0}
            </p>
            <Link
              to="/dashboard/portfolio"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View Portfolio <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Pending Documents</p>
            <p className="text-3xl font-bold text-gray-900">{pendingDocuments.length}</p>
            {pendingDocuments.length > 0 && (
              <Link
                to="/dashboard/documents"
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
              >
                Review Documents <FiArrowRight className="ml-1" />
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card title="Portfolio Performance (30 Days)">
        <LineChart
          data={performanceHistory}
          xKey="date"
          yKey="value"
          height={350}
          color="#0ea5e9"
        />
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Top Holdings">
          <div className="space-y-3">
            {portfolio?.assets.slice(0, 5).map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{asset.symbol}</p>
                  <p className="text-sm text-gray-600">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${asset.currentPrice.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm ${
                      asset.currentPrice >= asset.purchasePrice
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {asset.currentPrice >= asset.purchasePrice ? '+' : ''}
                    {(
                      ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Market Movers">
          <div className="space-y-3">
            {tickers.slice(0, 5).map((ticker) => (
              <div
                key={ticker.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{ticker.symbol}</p>
                  <p className="text-sm text-gray-600">{ticker.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${ticker.price.toFixed(2)}</p>
                  <p
                    className={`text-sm ${
                      ticker.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {ticker.changePercent >= 0 ? '+' : ''}
                    {ticker.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
