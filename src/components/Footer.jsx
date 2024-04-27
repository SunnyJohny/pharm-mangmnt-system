import React from 'react';
import { FaYoutube, FaWhatsapp, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';

const socialMediaLinks = [
  {
    name: 'YouTube',
    icon: <FaYoutube />,
    url: 'https://youtu.be/jUwiJsCTOlI?si=_j3zxkHA3w_aJZqM', // Replace '#' with your YouTube URL
  },
  {
    name: 'WhatsApp',
    icon: <FaWhatsapp />,
    url: 'https://wa.me/2348038554441', // Replace '#' with your WhatsApp URL
  },
  {
    name: 'Facebook',
    icon: <FaFacebook />,
    url: 'https://www.facebook.com/victor.imoni?mibextid=kFxxJD', // Replace '#' with your Facebook URL
  },
  {
    name: 'LinkedIn',
    icon: <FaLinkedin />,
    url: '#', // Replace '#' with your LinkedIn URL
  },
  {
    name: 'Instagram',
    icon: <FaInstagram />,
    url: '#', // Replace '#' with your Instagram URL
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white w-full ">
      <div className="container mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          {/* <div className="mb-8 md:mb-0">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p>Email:johnsunday803@gmail.com.com</p>
            <p>Phone: +234 8030611606</p>
            <p>Address: 123 Kubwa, FCT, Nigeria</p>
          </div> */}

          {/* Quick Links
          <div className="mb-8 md:mb-0">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <ul className="list-disc pl-4">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/properties">Properties</a>
              </li>
            </ul>
          </div> */}

          {/* Social Media */}
          {/* <div> */}
            {/* <h2 className="text-xl font-bold mb-4">Follow Us</h2>
            <div className="flex space-x-4">
              {socialMediaLinks.map((socialMedia, index) => (
                <a
                  key={index}
                  href={socialMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  {socialMedia.icon}
                </a>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t border-gray-600 pt-4 text-center w-full">  {/* Added w-full class */}
  <p className="text-sm">
    &copy; {new Date().getFullYear()} PIXELFORGE TECHNOLOGIES LTD- RC : 1737619. All rights reserved.
  </p>
</div>

    </footer>
  );
};

export default Footer;
