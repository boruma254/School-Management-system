import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend or email service
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">Contact Us</h1>
      <p className="mb-8 text-lg text-slate-700">Have a question or need support? Fill out the form below and our team will get back to you as soon as possible.</p>
      {submitted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">Thank you for contacting us! We'll respond soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition-all">Send Message</button>
        </form>
      )}
    </div>
  );
}
