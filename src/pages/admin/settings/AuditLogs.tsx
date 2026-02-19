import { useEffect, useState } from 'react';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import { supabase } from '../../../lib/supabase';
import type { AuditLog } from '../../../types';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (!error && data) {
          setLogs(data.map((log) => ({
            id: log.id,
            userId: log.user_id,
            userName: log.user_name,
            action: log.action,
            resource: log.resource,
            timestamp: log.timestamp,
            details: log.details,
          })));
        }
      } catch (err) {
        console.error('Fetch audit logs error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No audit logs yet.</p>
        ) : (
          <Table data={logs} columns={columns} />
        )}
      </Card>
    </div>
  );
}
