import React from 'react';

export default function PublicationsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">Publications</h1>
      <ul className="space-y-4 text-lg">
        <li><a href="#" className="text-red-600 hover:underline">Student Handbook</a></li>
        <li><a href="#" className="text-red-600 hover:underline">Academic Calendar</a></li>
        <li><a href="#" className="text-red-600 hover:underline">Annual Report</a></li>
        <li><a href="#" className="text-red-600 hover:underline">Prospectus</a></li>
        <li><a href="#" className="text-red-600 hover:underline">News & Media</a></li>
      </ul>
    </div>
  );
}
