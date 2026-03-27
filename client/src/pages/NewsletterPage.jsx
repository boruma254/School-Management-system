import React from 'react';

export default function NewsletterPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">University Newsletter</h1>
      <div className="mb-8">
        <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600" alt="Newsletter" className="rounded shadow mb-4" />
        <p className="text-lg text-slate-700">Stay updated with the latest news, events, and academic highlights from Kisii National Polytechnic. Download the latest newsletter below.</p>
      </div>
      <a href="#" className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 transition-all">Download PDF Version</a>
    </div>
  );
}
