import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketStore } from '../../../store/marketStore';
import { useDocumentStore } from '../../../store/documentStore';
import { Card } from '../../../components/Card';
import { BarChart } from '../../../components/charts/BarChart';
import { FiUsers, FiFileText, FiTrendingUp, FiActivity } from 'react-icons/fi';
import type { PlatformMetrics } from '../../../types';

export default function AdminOverview() {
  const { tickers, fetchTickers } = useMarketStore();
  const { documents, fetchDocuments } = useDocumentStore();

  const [metrics] = useState<PlatformMetrics>({
    totalUsers: 156,
    activeUsers: 142,
    totalDocuments: 234,
    pendingDocuments: 12,
    totalTransactions: 1543,
    totalVolume: 2450000,
  });

  useEffect(() => {
    fetchTickers();
    fetchDocuments();
  }, []);

  const userActivityData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 52 },
    { name: 'Wed', value: 48 },
    { name: 'Thu', value: 61 },
    { name: 'Fri', value: 55 },
    { name: 'Sat', value: 32 },
    { name: 'Sun', value: 28 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers}</p>
              <p className="text-sm text-green-600 mt-1">
                {metrics.activeUsers} active
              </p>
            </div>
            <FiUsers className="text-primary-600" size={40} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Documents</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalDocuments}</p>
              <p className="text-sm text-orange-600 mt-1">
                {metrics.pendingDocuments} pending
              </p>
            </div>
            <FiFileText className="text-primary-600" size={40} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Market Tickers</p>
              <p className="text-3xl font-bold text-gray-900">{tickers.length}</p>
              <Link
                to="/admin/markets"
                className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block"
              >
                Manage
              </Link>
            </div>
            <FiTrendingUp className="text-primary-600" size={40} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalTransactions}</p>
              <p className="text-sm text-gray-600 mt-1">
                ${(metrics.totalVolume / 1000000).toFixed(1)}M volume
              </p>
            </div>
            <FiActivity className="text-primary-600" size={40} />
          </div>
        </Card>
      </div>

      {/* User Activity Chart */}
      <Card title="User Activity (Last 7 Days)">
        <BarChart
          data={userActivityData}
          xKey="name"
          yKey="value"
          height={350}
          color="#0ea5e9"
        />
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Recent Documents">
          <div className="space-y-3">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{doc.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.status === 'signed'
                      ? 'bg-green-100 text-green-800'
                      : doc.status === 'viewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Performing Tickers">
          <div className="space-y-3">
            {tickers
              .sort((a, b) => b.changePercent - a.changePercent)
              .slice(0, 5)
              .map((ticker) => (
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
