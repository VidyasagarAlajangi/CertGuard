import React from 'react';
import VerifyById from '../components/VerifyById';
import VerifyByQR from '../components/VerifyByQR';

const VerifyPage = () => {
  return (
    <div className="min-h-screen pb-20 pt-32 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
          Certificate Verification
        </h1>

        <div className="space-y-10">
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Verify by ID</h2>
            <VerifyById />
          </section>

          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Verify by QR Image</h2>
            <VerifyByQR />
          </section>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
