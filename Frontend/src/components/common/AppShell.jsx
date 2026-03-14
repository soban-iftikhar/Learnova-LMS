import React from 'react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const AppShell = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppShell;
