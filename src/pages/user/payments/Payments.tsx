import { useEffect, useState } from 'react';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import { supabase } from '../../../lib/supabase';
import type { Payment } from '../../../types';
import { FiDownload, FiArrowUp, FiArrowDown, FiDollarSign } from 'react-icons/fi';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (!error && data) {
          setPayments(data.map((p) => ({
            id: p.id,
            date: p.date,
            amount: p.amount,
            type: p.type,
            status: p.status,
            description: p.description,
            reference: p.reference,
          })));
        }
      } catch (err) {
        console.error('Fetch payments error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusBadge = (status: Payment['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: Payment['type']) => {
    switch (type) {
      case 'deposit':
        return <FiArrowDown className="text-green-600" />;
      case 'withdrawal':
        return <FiArrowUp className="text-red-600" />;
      case 'dividend':
        return <FiDollarSign className="text-blue-600" />;
      case 'fee':
        return <FiDollarSign className="text-orange-600" />;
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row: Payment) => new Date(row.date).toLocaleDateString(),
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Type',
      accessor: (row: Payment) => (
        <div className="flex items-center">
          {getTypeIcon(row.type)}
          <span className="ml-2 capitalize">{row.type}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description' as keyof Payment,
      className: 'text-gray-600',
    },
    {
      header: 'Reference',
      accessor: 'reference' as keyof Payment,
      className: 'text-gray-500 text-sm',
    },
    {
      header: 'Amount',
      accessor: (row: Payment) => {
        const isPositive = row.type === 'deposit' || row.type === 'dividend';
        return (
          <span
            className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? '+' : '-'}${row.amount.toFixed(2)}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (row: Payment) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: () => (
        <button className="text-primary-600 hover:text-primary-700">
          <FiDownload size={18} />
        </button>
      ),
    },
  ];

  const totalDeposits = payments
    .filter((p) => p.type === 'deposit' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalWithdrawals = payments
    .filter((p) => p.type === 'withdrawal' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDividends = payments
    .filter((p) => p.type === 'dividend' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFees = payments
    .filter((p) => p.type === 'fee' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Deposits</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalDeposits.toLocaleString()}
              </p>
            </div>
            <FiArrowDown className="text-green-600" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalWithdrawals.toLocaleString()}
              </p>
            </div>
            <FiArrowUp className="text-red-600" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Dividends</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalDividends.toLocaleString()}
              </p>
            </div>
            <FiDollarSign className="text-blue-600" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Fees</p>
              <p className="text-2xl font-bold text-orange-600">
                ${totalFees.toLocaleString()}
              </p>
            </div>
            <FiDollarSign className="text-orange-600" size={32} />
          </div>
        </Card>
      </div>

      <Card title="Transaction History">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet.</p>
        ) : (
          <Table data={payments} columns={columns} />
        )}
      </Card>
    </div>
  );
}
