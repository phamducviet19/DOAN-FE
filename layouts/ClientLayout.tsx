import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import Chatbot from '../components/client/Chatbot';

const ClientLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default ClientLayout;
