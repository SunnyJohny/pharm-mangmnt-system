// UserInformation.js
import React from 'react';

const UserInformation = ({ user }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Circular Image */}
      <div className="bg-gray-500 w-12 h-12 rounded-full mb-2">
        {/* You can add an image here if needed */}
      </div>
      
      {/* User Information */}
      <div className="text-center">
        <p className="text-lg font-bold mb-2">{user.name}</p>
        <p className="text-sm mb-1">{user.role}</p>
        <p className="text-sm">User ID: {user.userID.substring(0, 4)}...</p>
                                                                                                                                          

      </div>
    </div>
  );
};

export default UserInformation;
