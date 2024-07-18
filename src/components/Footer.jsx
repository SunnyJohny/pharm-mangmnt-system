import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-gray-800 text-white py-2 text-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PIXELFORGE TECHNOLOGIES LTD- RC : 1737619. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
