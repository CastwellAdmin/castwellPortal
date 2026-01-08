import { useState } from 'react';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import type { AuditLog } from '../../../types';

const MOCK_LOGS: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Admin User',
    action: 'Created User',
    resource: 'users',
    timestamp: '2025-01-08T10:30:00',
    details: { email: 'newuser@example.com' },
  },
  {
    id: '2',
    userId: '1',
    userName: 'Admin User',
    action: 'Uploaded Document',
    resource: 'documents',
    timestamp: '2025-01-08T09:15:00',
    details: { title: 'Investment Agreement 2025' },
  },
  {
    id: '3',
    userId: '1',
    userName: 'Admin User',
    action: 'Added Ticker',
    resource: 'markets',
    timestamp: '2025-01-07T16:45:00',
    details: { symbol: 'TSLA' },
  },
  {
    id: '4',
    userId: '1',
    userName: 'Admin User',
    action: 'Updated Settings',
    resource: 'settings',
    timestamp: '2025-01-07T14:20:00',
    details: { setting: 'maxUploadSize' },
  },
  {
    id: '5',
    userId: '1',
    userName: 'Admin User',
    action: 'Deleted Article',
    resource: 'learning',
    timestamp: '2025-01-06T11:00:00',
    details: { title: 'Old Article' },
  },
];

export default function AuditLogs() {
  const [logs] = useState<AuditLog[]>(MOCK_LOGS);

  const columns = [
    {
      header: 'Timestamp',
      accessor: (row: AuditLog) =>
        new Date(row.timestamp).toLocaleString(),
      className: 'font-medium text-gray-900',
    },
    {
      header: 'User',
      accessor: 'userName' as keyof AuditLog,
      className: 'text-gray-900',
    },
    {
      header: 'Action',
      accessor: 'action' as keyof AuditLog,
      className: 'font-medium',
    },
    {
      header: 'Resource',
      accessor: (row: AuditLog) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 capitalize">
          {row.resource}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (row: AuditLog) => (
        <code className="text-xs text-gray-600">
          {JSON.stringify(row.details, null, 2).slice(0, 50)}...
        </code>
      ),
    },
  ];

  const today = new Date();
  const todayLogs = logs.filter(
    (log) =>
      new Date(log.timestamp).toDateString() === today.toDateString()
  ).length;

  const thisWeek = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logDate >= weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Logs</p>
          <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Today</p>
          <p className="text-3xl font-bold text-primary-600">{todayLogs}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">This Week</p>
          <p className="text-3xl font-bold text-green-600">{thisWeek}</p>
        </Card>
      </div>

      <Card title="Recent Activity">
        <Table data={logs} columns={columns} />
      </Card>
    </div>
  );
}
