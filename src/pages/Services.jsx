// ServicePage.js
import React from "react";
import { useSpring, animated } from "react-spring";

const servicesData = [
  {
    title: "Declutter",
    description: "Our professional decluttering services will organize your space and create a stress-free environment.",
  },
  {
    title: "Trust Funds",
    description: "Explore our trust fund services to secure your financial future and ensure peace of mind.",
  },
  {
    title: "Auto Mobile",
    description: "Get premium automobile services, including repairs, maintenance, and more, for a smooth driving experience.",
  },
  {
    title: "Cleaning Services",
    description: "Experience top-notch cleaning services tailored to meet your specific needs and preferences.",
  },
  {
    title: "Academy",
    description: "Join our academy for personalized learning experiences and skill development programs.",
  },
  {
    title: "Logistics",
    description: "Efficient logistics solutions to streamline your supply chain and enhance your business operations.",
  },
];


const ServiceCard = ({ title, description }) => {
    const fade = useSpring({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { duration: 500 },
    });
  
    return (
      <animated.div style={fade} className="bg-white rounded-lg overflow-hidden shadow-lg m-4 p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </animated.div>
    );
  };
  
  const ServicePage = () => {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-semibold mb-8">Our Services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    );
  };
  
  export default ServicePage;
