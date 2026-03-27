import React from 'react';

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">How do I apply for admission?</h2>
          <p className="text-slate-700">Visit the Admissions page and follow the online application process. You can also contact our admissions office for guidance.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Where can I access the student portal?</h2>
          <p className="text-slate-700">The student portal is available under E-Resources. Use your registration credentials to log in.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">How do I get technical support?</h2>
          <p className="text-slate-700">Contact our IT support team via the Online Support link in E-Resources or use the contact form.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Is there on-campus accommodation?</h2>
          <p className="text-slate-700">Yes, we offer safe and comfortable hostels for students. See the Facilities section for more info.</p>
        </div>
      </div>
    </div>
  );
}
