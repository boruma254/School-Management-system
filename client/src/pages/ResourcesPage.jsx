import React from 'react';

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">E-Resources</h1>
      <ul className="space-y-4 text-lg">
        <li><a href="#" className="text-blue-600 hover:underline">Student Portal</a></li>
        <li><a href="#" className="text-blue-600 hover:underline">Faculty Portal</a></li>
        <li><a href="#" className="text-blue-600 hover:underline">E-Learning Platform</a></li>
        <li><a href="#" className="text-blue-600 hover:underline">Digital Library</a></li>
        <li><a href="#" className="text-blue-600 hover:underline">WiFi Access</a></li>
        <li><a href="#" className="text-blue-600 hover:underline">Email Services</a></li>
        <li><a href="#" className="text-blue-600 hover:underline">Online Support</a></li>
      </ul>
    </div>
  );
}
