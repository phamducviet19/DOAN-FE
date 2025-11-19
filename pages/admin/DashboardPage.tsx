import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import api from '../../services/api';
import { RevenueData, TopProductData, OrderStatusData, TopCustomerData, OrderPercentageData, OrderStatus } from '../../types';
import Card from '../../components/common/Card';

const COLORS = ['#38b2ac', '#a0aec0', '#f6ad55', '#f56565'];

const DashboardPage: React.FC = () => {
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerData[]>([]);
  const [orderPercentage, setOrderPercentage] = useState<{ status: OrderStatus; percentage: number; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          revenueRes,
          topProductsRes,
          orderStatusRes,
          topCustomersRes,
          orderPercentageRes,
        ] = await Promise.all([
          api.get<{data: RevenueData[]}>('/statistics/revenue'),
          api.get<{data: TopProductData[]}>('/statistics/top-products'),
          api.get<{data: OrderStatusData[]}>('/statistics/orders-status'),
          api.get<{data: TopCustomerData[]}>('/statistics/top-customers'),
          api.get<{data: OrderPercentageData[]}>('/statistics/order-percentage'),
        ]);

        setRevenue(revenueRes.data);
        setTopProducts(topProductsRes.data);
        setOrderStatus(orderStatusRes.data);
        setTopCustomers(topCustomersRes.data);
        setOrderPercentage(orderPercentageRes.data.map(d => ({...d, percentage: parseFloat(d.percentage)})));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const totalRevenue = revenue.reduce((acc, item) => acc + parseFloat(item.total_revenue), 0);
  const totalOrders = orderStatus.reduce((acc, item) => acc + parseInt(item.count), 0);


  if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;
  if (error) return <div className="text-center p-10 text-red-400">{error}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Total Revenue" value={`${Math.round(totalRevenue).toLocaleString('vi-VN')} ₫`} icon={<DollarSign className="text-white"/>} color="bg-green-500"/>
        <Card title="Total Orders" value={totalOrders} icon={<ShoppingCart className="text-white"/>} color="bg-blue-500"/>
        <Card title="Top Products" value={topProducts.length} icon={<Package className="text-white"/>} color="bg-yellow-500"/>
        <Card title="Top Customers" value={topCustomers.length} icon={<Users className="text-white"/>} color="bg-purple-500"/>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="date" stroke="#a0aec0" />
              <YAxis stroke="#a0aec0" tickFormatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
              <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
              <Legend />
              <Line type="monotone" dataKey="total_revenue" name="Revenue" stroke="#38b2ac" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={110}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="status"
              >
                {orderPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Top Selling Products</h2>
            <ResponsiveContainer width="100%" height={300}>
               <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568"/>
                    <XAxis type="number" stroke="#a0aec0" />
                    <YAxis dataKey="Product.name" type="category" stroke="#a0aec0" width={150} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
                    <Legend />
                    <Bar dataKey="total_sold" fill="#38b2ac" name="Units Sold" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map(customer => (
                  <tr key={customer.user_id} className="border-b border-gray-700/50 hover:bg-gray-700">
                    <td className="py-3 px-4">{customer.User.name}</td>
                    <td className="py-3 px-4">{customer.User.email}</td>
                    <td className="py-3 px-4 text-right">{parseFloat(customer.total_spent).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DashboardPage;