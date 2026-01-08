import { useEffect, useState } from 'react';
import { useMarketStore } from '../../../store/marketStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import { Button } from '../../../components/forms/Button';
import { Modal } from '../../../components/modals/Modal';
import { Input } from '../../../components/forms/Input';
import type { StockTicker } from '../../../types';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function MarketManagement() {
  const { tickers, fetchTickers, addTicker, removeTicker } = useMarketStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    price: '',
    sector: '',
    market: '',
  });

  useEffect(() => {
    fetchTickers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTicker({
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      price: parseFloat(formData.price),
      change: 0,
      changePercent: 0,
      sector: formData.sector,
      market: formData.market,
      volume: 0,
    });
    setIsModalOpen(false);
    setFormData({
      symbol: '',
      name: '',
      price: '',
      sector: '',
      market: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this ticker?')) {
      removeTicker(id);
    }
  };

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
    {
      header: 'Volume',
      accessor: (row: StockTicker) => row.volume.toLocaleString(),
      className: 'text-gray-600',
    },
    {
      header: 'Actions',
      accessor: (row: StockTicker) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.id);
          }}
          className="text-red-600 hover:text-red-700"
        >
          <FiTrash2 size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Market Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Add Ticker
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Tickers</p>
          <p className="text-3xl font-bold text-gray-900">{tickers.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Gainers</p>
          <p className="text-3xl font-bold text-green-600">
            {tickers.filter((t) => t.changePercent > 0).length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Losers</p>
          <p className="text-3xl font-bold text-red-600">
            {tickers.filter((t) => t.changePercent < 0).length}
          </p>
        </Card>
      </div>

      <Card title="All Tickers">
        <Table data={tickers} columns={columns} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Ticker"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Symbol"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="AAPL"
            required
          />

          <Input
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Apple Inc."
            required
          />

          <Input
            label="Current Price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="150.00"
            required
          />

          <Input
            label="Sector"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            placeholder="Technology"
            required
          />

          <Input
            label="Market"
            value={formData.market}
            onChange={(e) => setFormData({ ...formData, market: e.target.value })}
            placeholder="NASDAQ"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Ticker</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
