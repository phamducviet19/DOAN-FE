import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, List, Users, ShoppingCart, Truck, Inbox, Computer } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: List },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/admin/imports', label: 'Imports', icon: Inbox },
];

const Sidebar: React.FC = () => {
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-blue-700 hover:text-white transition-colors duration-200 rounded-md";
  const activeLinkClasses = "bg-blue-600 text-white";

  return (
    <div className="w-64 bg-gray-800 flex-shrink-0 p-4 flex flex-col shadow-lg">
      <div className="flex items-center mb-8">
        <Computer className="w-8 h-8 text-blue-500 mr-3" />
        <h1 className="text-2xl font-bold text-gray-100">PC Admin</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map(item => (
            <li key={item.to} className="mb-2">
              <NavLink 
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-center text-xs text-gray-500">
        <p>&copy; 2024 PC Components</p>
      </div>
    </div>
  );
};

export default Sidebar;