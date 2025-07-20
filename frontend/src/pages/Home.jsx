import React from 'react';
import { Link } from 'react-router-dom';
import VerifyById from '../components/VerifyById';
import VerifyByQR from '../components/VerifyByQR';
import Features from '../components/Features';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="inline-block bg-indigo-600 text-white text-xs px-3 py-2  rounded-full mb-10 animate-pulse">
            TRUSTED BY HUNDREDS OF INSTITUTIONS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Welcome to <span className="text-indigo-600">CertGuard</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Blockchain-powered digital certificate verification platform. Instantly validate credentials with military-grade security.
          </p>
          
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
              <div>
                <h3 className="text-4xl font-bold text-slate-800">10K+</h3>
                <p className="text-base mt-2 text-slate-600">Certificates Verified</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-slate-800">100+</h3>
                <p className="text-base mt-2 text-slate-600">Institutions Onboard</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-slate-800">20+</h3>
                <p className="text-base mt-2 text-slate-600">Countries Reached</p>
              </div>
            </div>
          </div>

          
          
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Verify a Certificate
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto pb-10">
            Ensure the authenticity of any certificate with a single click. Our platform offers a quick and secure way to validate credentials, providing peace of mind for employers and institutions.
            </p>
            <Link
            to="/verify"
            className="inline-block bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 shadow-lg"
          >
            Verify Now
          </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch max-w-6xl mx-auto">
            {/* Verification components can be added here */}
          </div>
        </div>
      </section>
      {/* Verification Section */}
     
      
      
      {/* Features Section */}
      <Features />
      
      
    </div>
  );
};

export default Home;