import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GraduationImg from "../assets/bg-education.jpg";

const Homepage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-textDark flex flex-col overflow-x-hidden selection:bg-accent selection:text-white">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand shadow-lg py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center group cursor-pointer">
              <span className={`font-bold text-2xl tracking-wide transition-colors duration-300 ${scrolled ? 'text-white' : 'text-brand'}`}>
                EduManage
              </span>
            </div>
            <div className="flex space-x-6 items-center">
              <Link
                to="/choose"
                className={`relative text-sm font-bold transition-colors py-2 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-2 ${scrolled ? 'text-white hover:text-background' : 'text-brand hover:text-accent'}`}
              >
                Login
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
              </Link>
              <Link
                to="/Adminregister"
                className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/40"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-grow flex items-center justify-center w-full mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 bg-surface rounded-xl shadow-xl overflow-hidden border border-black/5 animate-fade-in relative z-10">

          {/* Left Typography / Actions */}
          <div className="flex flex-col gap-6 justify-center z-10 text-center lg:text-left items-center lg:items-start">
            <div className="inline-block px-5 py-2 rounded-xl bg-background text-brand text-sm font-extrabold w-max animate-slide-up shadow-sm cursor-default">
              🎉 Welcome to the Future of Education
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand leading-[1.15] tracking-tight animate-slide-up-delayed">
              The Complete <br />
              <span className="text-textDark">
                College Management
              </span> <br />
              System
            </h1>

            <p className="text-lg sm:text-xl text-textDark/80 max-w-lg leading-relaxed animate-slide-up-delayed opacity-0 font-medium" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
              Streamline your campus administration, manage students, faculty, classes, and fees seamlessly all in one modern, accessible platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up-delayed-2 opacity-0" style={{ animationFillMode: 'forwards' }}>
              <Link
                to="/choose"
                className="group relative bg-accent text-white font-bold py-4 px-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden transition-all duration-300 text-center flex-1 focus:outline-none focus:ring-4 focus:ring-accent/50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Log In
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out z-0"></div>
              </Link>
              <Link
                to="/Adminregister"
                className="group bg-brand text-white font-bold py-4 px-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex-1 focus:outline-none focus:ring-4 focus:ring-brand/50"
              >
                Register Institute
              </Link>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="relative h-72 sm:h-96 lg:h-[500px] w-full rounded-xl overflow-hidden shadow-2xl animate-fade-in z-10 group bg-background flex items-center justify-center" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <img
              src={GraduationImg}
              alt="Graduation success"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 mix-blend-multiply"
            />
          </div>
        </div>
      </main>

      {/* Feature Cards Grid */}
      <section className="py-16 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-extrabold text-brand">Everything You Need To Run Your Institute</h2>
            <p className="text-textDark/80 mt-4 max-w-2xl mx-auto font-medium">A powerful suite of tools designed to automate everything from admissions to graduation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out border border-black/5 group animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
              <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-textDark mb-3">Admin Control</h3>
              <p className="text-textDark/80 leading-relaxed font-medium">Oversee all institution activities, manage fees, handle complaints, and dispatch notices instantly from a central dashboard.</p>
            </div>

            <div className="bg-surface p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out border border-black/5 group animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
              <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-textDark mb-3">Student Portal</h3>
              <p className="text-textDark/80 leading-relaxed font-medium">Empower students to access real-time examination results, check everyday attendance, and view study materials directly.</p>
            </div>

            <div className="bg-surface p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out border border-black/5 group animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.6s' }}>
              <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-textDark mb-3">Faculty Sync</h3>
              <p className="text-textDark/80 leading-relaxed font-medium">Faculty monitor class rosters, track daily attendance sheets seamlessly, and grade students effortlessly on any device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-black text-xl shadow-sm">E</span>
            <span className="font-bold text-xl text-white">EduManage</span>
          </div>
          <div className="flex space-x-6 text-sm font-bold text-white/80">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
          <p className="text-white/60 text-sm font-semibold">
            &copy; {new Date().getFullYear()} EduManage Solutions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
