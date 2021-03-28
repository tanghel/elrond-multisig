import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import ConfirmModalContainer from '../ConfirmModal/ConfirmModalContainer';

const Layout = ({ children, page }: { children: React.ReactNode; page: string }) => {
  return (
    <div className={`layout d-flex flex-column min-vh-100 ${page}`}>
      <ConfirmModalContainer />
      {page !== 'home' && <Navbar />}
      <main className="container flex-grow-1 d-flex p-3 p-sm-spacer">{children}</main>
      <Footer />

    </div>
  );
};

export default Layout;
