// CareerPage.js
import React from "react";

const realEstateJobListings = [
  { title: "Real Estate Agent", location: "Multiple Locations", description: "Lorem ipsum..." },
  { title: "Property Manager", location: "City, State", description: "Lorem ipsum..." },
  // Add more real estate job listings as needed
];

const companyValues = {
  title: "Our Values",
  description: "At Imoni Properties, we are committed to integrity, customer satisfaction, and excellence in the real estate industry.",
};

const CareerPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-8">Join the Imoni Properties Team</h1>

      {/* Real Estate Job Listings */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Real Estate Job Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realEstateJobListings.map((job, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-700 mb-4">{job.location}</p>
              <p className="text-gray-700">{job.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company Values */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{companyValues.title}</h2>
        <p className="text-gray-700">{companyValues.description}</p>
      </section>

      {/* How to Apply */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">How to Apply</h2>
        <p className="text-gray-700">
          Interested in joining the Imoni Properties team? Submit your resume and cover letter to careers@imoniproperties.com.
        </p>
      </section>
    </div>
  );
};

export default CareerPage;
