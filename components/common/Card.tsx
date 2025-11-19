import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'bg-blue-600' }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
      <div className={`p-4 rounded-full mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
      </div>
    </div>
  );
};

export default Card;