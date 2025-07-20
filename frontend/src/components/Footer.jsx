import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-100 shadow-inner mt-12 py-5 text-center text-blue-700 text-base rounded-t-xl">
      &copy; {new Date().getFullYear()} CertGuard. Made with <span role="img" aria-label="love">💙</span> All rights reserved.
    </footer>
  );
};

export default Footer; 