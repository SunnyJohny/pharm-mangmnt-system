import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white w-full ">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        <p className="text-sm">
          &copy; {new Date().getFullYear()} PIXELFORGE TECHNOLOGIES LTD- RC : 1737619. All rights reserved.
        </p>
      </div>

    </footer>
  );
};

export default Footer;
