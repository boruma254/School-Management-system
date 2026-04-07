import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const schoolImages = [
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1427504494820-7dda7e0456ca?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=600&fit=crop",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeFonts: false,
    dyslexiaFont: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % schoolImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleLogin = (role) => {
    navigate("/login", { state: { defaultRole: role } });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % schoolImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + schoolImages.length) % schoolImages.length,
    );
  };

  return (
    <div
      className={`min-h-screen ${accessibility.highContrast ? "bg-black text-white" : "bg-gray-50"}`}
      style={{
        fontSize: accessibility.largeFonts ? "18px" : "16px",
        fontFamily: accessibility.dyslexiaFont
          ? "OpenDyslexic, sans-serif"
          : "inherit",
      }}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 ${accessibility.highContrast ? "bg-black border-yellow-400" : "bg-white border-blue-600"} shadow-md border-b-4`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo & School Name */}
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-lg ${accessibility.highContrast ? "bg-yellow-400" : "bg-blue-600"} shadow-md`}
            >
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kisii National Polytechnic</h1>
              <p
                className={`text-sm ${accessibility.highContrast ? "text-gray-300" : "text-slate-600"}`}
              >
                Technical Vocational Education & Training
              </p>
            </div>
          </div>

          {/* Right Side: Accessibility & Login */}
          <div className="flex items-center gap-4">
            {/* Accessibility Button */}
            <div className="relative">
              <button
                onClick={() => setShowAccessibility(!showAccessibility)}
                className={`relative h-12 w-12 rounded-full border-3 flex items-center justify-center transition-all hover:shadow-lg ${accessibility.highContrast ? "bg-yellow-400 text-black border-black" : "bg-blue-600 text-white border-blue-600"}`}
                title="Accessibility Options"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </button>

              {showAccessibility && (
                <div
                  className={`absolute right-0 top-full mt-2 w-72 rounded-lg shadow-2xl overflow-hidden border-2 ${accessibility.highContrast ? "bg-black border-yellow-400" : "bg-white border-gray-200"}`}
                >
                  <div
                    className={`px-5 py-4 ${accessibility.highContrast ? "bg-yellow-400 text-black" : "bg-blue-50"} font-bold`}
                  >
                    Accessibility Options
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                      <input
                        type="checkbox"
                        checked={accessibility.highContrast}
                        onChange={(e) =>
                          setAccessibility({
                            ...accessibility,
                            highContrast: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">High Contrast Mode</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                      <input
                        type="checkbox"
                        checked={accessibility.largeFonts}
                        onChange={(e) =>
                          setAccessibility({
                            ...accessibility,
                            largeFonts: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Large Fonts</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                      <input
                        type="checkbox"
                        checked={accessibility.dyslexiaFont}
                        onChange={(e) =>
                          setAccessibility({
                            ...accessibility,
                            dyslexiaFont: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">
                        Dyslexia-Friendly Font
                      </span>
                    </label>
                    <button
                      onClick={() =>
                        setAccessibility({
                          highContrast: false,
                          largeFonts: false,
                          dyslexiaFont: false,
                        })
                      }
                      className={`w-full mt-4 px-4 py-2 rounded font-semibold transition-all ${accessibility.highContrast ? "bg-black text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`relative rounded-lg ${accessibility.highContrast ? "bg-yellow-400 text-black" : "bg-blue-600 text-white"} px-6 py-2.5 font-semibold transition-all hover:shadow-lg shadow-md`}
            >
              Portal Access
              {showRoleMenu && (
                <div
                  className={`absolute right-0 top-full mt-2 w-56 rounded-lg shadow-2xl overflow-hidden border z-50 ${accessibility.highContrast ? "bg-black border-yellow-400" : "bg-white border-gray-200"}`}
                >
                  <button
                    onClick={() => handleRoleLogin("ADMIN")}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 border-b transition-colors ${accessibility.highContrast ? "hover:bg-yellow-400 hover:text-black border-gray-600 text-white" : "text-black hover:bg-blue-50 border-gray-100"}`}
                  >
                    <span className="text-2xl">👨‍💼</span>
                    <div className="text-left">
                      <div className="font-semibold">Admin</div>
                      <div className="text-xs opacity-70">Staff Management</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleLogin("STUDENT")}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 border-b transition-colors ${accessibility.highContrast ? "hover:bg-yellow-400 hover:text-black border-gray-600 text-white" : "text-black hover:bg-blue-50 border-gray-100"}`}
                  >
                    <span className="text-2xl">👨‍🎓</span>
                    <div className="text-left">
                      <div className="font-semibold">Student</div>
                      <div className="text-xs opacity-70">
                        Grades & Documents
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleLogin("LECTURER")}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 border-b transition-colors ${accessibility.highContrast ? "hover:bg-yellow-400 hover:text-black border-gray-600 text-white" : "text-black hover:bg-blue-50 border-gray-100"}`}
                  >
                    <span className="text-2xl">👨‍🏫</span>
                    <div className="text-left">
                      <div className="font-semibold">Lecturer</div>
                      <div className="text-xs opacity-70">Class Management</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleLogin("FINANCE")}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 transition-colors ${accessibility.highContrast ? "hover:bg-yellow-400 hover:text-black text-white" : "text-black hover:bg-blue-50"}`}
                  >
                    <span className="text-2xl">💰</span>
                    <div className="text-left">
                      <div className="font-semibold">Finance</div>
                      <div className="text-xs opacity-70">
                        Financial Services
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative h-96 overflow-hidden bg-slate-800">
        {/* Carousel */}
        <div className="relative h-full w-full">
          <img
            src={schoolImages[currentImageIndex]}
            alt="School Campus"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/30 to-slate-900/60"></div>

          {/* Carousel Controls */}
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 hover:bg-white/50 p-2.5 text-white transition-all shadow-lg backdrop-blur-sm"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 hover:bg-white/50 p-2.5 text-white transition-all shadow-lg backdrop-blur-sm"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {schoolImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-5xl font-bold text-white drop-shadow-xl">
              Kisii National Polytechnic
            </h2>
            <p className="text-xl text-gray-100 drop-shadow-lg font-medium">
              Empowering Skilled Professionals for Kenya's Future
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-blue-600 rounded"></div>
            <h2 className="text-4xl font-bold text-slate-900">
              About Our Institution
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <p className="text-lg text-slate-700 leading-relaxed">
                The Kisii National Polytechnic is one of Kenya's premier
                technical and vocational education and training (TVET)
                institutions, established with a mission to develop skilled
                technicians and professionals required in the rapidly growing
                job market.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                With over two decades of excellence in education, we have
                graduated thousands of competent professionals who have
                significantly contributed to Kenya's industrial and economic
                development.
              </p>
            </div>
            <div className="bg-slate-50 border-l-4 border-blue-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Key Highlights
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-slate-700">
                    2500+ Active Students across multiple programs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-slate-700">
                    150+ Experienced Faculty Members
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-slate-700">
                    30+ Academic and Professional Programs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-slate-700">
                    95% Graduate Employment Rate
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mb-20 grid gap-8 md:grid-cols-2">
          <div className="border-2 border-blue-600 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">
              Our Mission
            </h3>
            <p className="text-slate-700 leading-relaxed">
              To provide quality, accessible, and market-responsive technical
              and vocational education and training that develops competent,
              enterprising, and responsible citizens equipped with relevant
              skills and knowledge for employment and self-reliance.
            </p>
          </div>
          <div className="border-2 border-slate-300 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">
              Our Vision
            </h3>
            <p className="text-slate-700 leading-relaxed">
              To be a center of excellence in technical and vocational
              education, recognized both nationally and internationally, for
              producing globally competitive, innovative, and ethical
              professionals who drive economic growth and social development.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-blue-600 rounded"></div>
            <h3 className="text-3xl font-bold text-slate-900">Core Values</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border-t-4 border-blue-600 shadow-md">
              <h4 className="font-bold text-slate-900 mb-2 text-lg">
                Integrity
              </h4>
              <p className="text-slate-600">
                We uphold highest standards of honesty and transparency in all
                our operations
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-t-4 border-slate-400 shadow-md">
              <h4 className="font-bold text-slate-900 mb-2 text-lg">
                Excellence
              </h4>
              <p className="text-slate-600">
                We strive for continuous improvement in teaching, learning and
                service delivery
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-t-4 border-slate-400 shadow-md">
              <h4 className="font-bold text-slate-900 mb-2 text-lg">
                Innovation
              </h4>
              <p className="text-slate-600">
                We embrace new ideas and technologies to enhance education
                quality
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-t-4 border-slate-400 shadow-md">
              <h4 className="font-bold text-slate-900 mb-2 text-lg">
                Inclusivity
              </h4>
              <p className="text-slate-600">
                We welcome and support learners from diverse backgrounds and
                abilities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-1 w-12 bg-blue-600 rounded"></div>
            <h2 className="text-4xl font-bold text-slate-900">
              Academic Programs
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-600">
              <h4 className="mb-4 text-2xl font-bold text-slate-900">
                Engineering & Technology
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Civil Engineering
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Mechanical Engineering
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Electrical Engineering
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Electronics
                  Engineering
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-slate-400">
              <h4 className="mb-4 text-2xl font-bold text-slate-900">
                Business & Information Technology
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Information Technology
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Business Management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Accounting
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Digital Marketing
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-slate-400">
              <h4 className="mb-4 text-2xl font-bold text-slate-900">
                Health & Applied Sciences
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Clinical Medicine
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Public Health
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Laboratory Technology
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>Environmental Science
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-1 w-12 bg-blue-600 rounded"></div>
          <h2 className="text-4xl font-bold text-slate-900">
            World-Class Facilities
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-blue-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏫</span>
              <h4 className="font-bold text-slate-900 text-lg">
                Modern Classrooms
              </h4>
            </div>
            <p className="text-slate-600">
              State-of-the-art lecture halls equipped with modern teaching aids
              and ICT facilities
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-slate-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔬</span>
              <h4 className="font-bold text-slate-900 text-lg">
                Advanced Laboratories
              </h4>
            </div>
            <p className="text-slate-600">
              Well-equipped technical and IT laboratories for hands-on practical
              training
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-slate-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📚</span>
              <h4 className="font-bold text-slate-900 text-lg">
                Digital Library
              </h4>
            </div>
            <p className="text-slate-600">
              Extensive collection of physical and digital resources including
              e-books and journals
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-slate-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏥</span>
              <h4 className="font-bold text-slate-900 text-lg">
                Medical Center
              </h4>
            </div>
            <p className="text-slate-600">
              Fully staffed health center providing comprehensive medical
              services to students and staff
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-slate-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏐</span>
              <h4 className="font-bold text-slate-900 text-lg">
                Sports Complex
              </h4>
            </div>
            <p className="text-slate-600">
              Complete athletic facilities including courts, fields, and
              gymnasium for student wellness
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-slate-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏠</span>
              <h4 className="font-bold text-slate-900 text-lg">
                Student Accommodation
              </h4>
            </div>
            <p className="text-slate-600">
              Safe and comfortable on-campus hostels with modern amenities for
              student residents
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Start Your Journey
          </h2>
          <p className="mb-8 text-lg text-blue-50">
            Join thousands of graduates who have achieved success in their
            technical careers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-lg bg-white text-blue-600 px-8 py-3 font-bold transition-all hover:bg-slate-100 hover:shadow-lg cursor-pointer"
            >
              Apply Now
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border-2 border-white text-white px-8 py-3 font-bold transition-all hover:bg-white/10 cursor-pointer"
            >
              Existing Users
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`${accessibility.highContrast ? "bg-black text-white" : "bg-slate-900 text-slate-100"} py-16 border-t-4 border-blue-600`}
      >
        <div className="mx-auto max-w-7xl px-6">
          {/* Four Column Footer Grid */}
          <div className="grid gap-12 md:grid-cols-4 mb-12">
            {/* Column 1: Newsletter */}
            <div
              className={`${accessibility.highContrast ? "border-l-4 border-yellow-400" : "border-l-4 border-green-500"} pl-6`}
            >
              <h4
                className={`mb-4 text-lg font-bold ${accessibility.highContrast ? "text-yellow-400" : "text-green-400"} uppercase tracking-wide`}
              >
                Newsletter
              </h4>
              <p className="text-sm text-slate-300 mb-4">
                Subscribe to get updates about academic calendars, news, and
                events.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for subscribing!");
                }}
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 rounded bg-slate-800 text-white placeholder-slate-500 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className={`w-full px-4 py-2 rounded font-semibold text-sm transition-all ${accessibility.highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Column 2: Get In Touch */}
            <div
              className={`${accessibility.highContrast ? "border-l-4 border-yellow-400" : "border-l-4 border-green-500"} pl-6`}
            >
              <h4
                className={`mb-4 text-lg font-bold ${accessibility.highContrast ? "text-yellow-400" : "text-green-400"} uppercase tracking-wide`}
              >
                Get In Touch
              </h4>
              <ul className="text-sm text-slate-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span>📞</span>
                  <div>
                    <strong>Main:</strong> +254 20 8703000
                    <br />
                    <strong>Admissions:</strong> +254 870 3200
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span>✉️</span>
                  <div>
                    <a
                      href="mailto:info@kisiipolytechnic.ac.ke"
                      className={`hover:text-blue-400 transition-all ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                    >
                      info@kisiipolytechnic.ac.ke
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔐</span>
                  <div>
                    <strong>Security:</strong> +254 725 471 487
                  </div>
                </li>
                <li>
                  <a
                    href="#"
                    className={`flex items-center gap-2 hover:text-blue-400 transition-all ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    💬 Contact a Specific Office
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: E-Resources */}
            <div
              className={`${accessibility.highContrast ? "border-l-4 border-yellow-400" : "border-l-4 border-green-500"} pl-6`}
            >
              <h4
                className={`mb-4 text-lg font-bold ${accessibility.highContrast ? "text-yellow-400" : "text-green-400"} uppercase tracking-wide`}
              >
                E-Resources
              </h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → Student Portal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → Faculty Portal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → E-Learning Platform
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → Digital Library
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → WiFi Access
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → Email Services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-blue-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    → Online Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Other Links */}
            <div
              className={`${accessibility.highContrast ? "border-l-4 border-yellow-400" : "border-l-4 border-green-500"} pl-6`}
            >
              <h4
                className={`mb-4 text-lg font-bold ${accessibility.highContrast ? "text-yellow-400" : "text-green-400"} uppercase tracking-wide`}
              >
                Publications
              </h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>
                  <a
                    href="#"
                    className={`hover:text-red-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    » STUDENT HANDBOOK
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-red-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    » ACADEMIC CALENDAR
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-red-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    » ANNUAL REPORT
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-red-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    » PROSPECTUS
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-red-400 transition-all flex items-center gap-1 ${accessibility.highContrast ? "hover:text-yellow-300" : ""}`}
                  >
                    » NEWS & MEDIA
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div
            className={`border-t ${accessibility.highContrast ? "border-yellow-400" : "border-slate-700"} my-8`}
          ></div>

          {/* Social Media & Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <p className="font-bold text-white mb-4">Follow Us</p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className={`w-10 h-10 rounded-full ${accessibility.highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 hover:bg-blue-700"} flex items-center justify-center transition-all text-xl`}
                >
                  
                </a>
                <a
                  href="#"
                  className={`w-10 h-10 rounded-full ${accessibility.highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 hover:bg-blue-700"} flex items-center justify-center transition-all text-xl`}
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className={`w-10 h-10 rounded-full ${accessibility.highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 hover:bg-blue-700"} flex items-center justify-center transition-all text-xl`}
                >
                  in
                </a>
                <a
                  href="#"
                  className={`w-10 h-10 rounded-full ${accessibility.highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 hover:bg-blue-700"} flex items-center justify-center transition-all text-xl`}
                >
                  📷
                </a>
                <a
                  href="#"
                  className={`w-10 h-10 rounded-full ${accessibility.highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-blue-600 hover:bg-blue-700"} flex items-center justify-center transition-all text-xl`}
                >
                  ▶
                </a>
              </div>
            </div>
            <div className="text-sm text-slate-400 text-center md:text-right">
              <p>Data Privacy & Accessibility</p>
              <p>© 2026 Kisii National Polytechnic</p>
            </div>
          </div>

          {/* Copyright */}
          <div
            className={`text-center text-xs ${accessibility.highContrast ? "border-t border-yellow-400 pt-4 text-yellow-300" : "border-t border-slate-700 pt-4 text-slate-500"}`}
          >
            <p>
              All rights reserved. Terms of Use | Privacy Policy | Complaints |
              Feedback
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
