import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Loader } from 'lucide-react';

const CertificateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get(`/certificates/public/verify/${id}`);
        if (res.data && res.data.success) {
          setCertificate(res.data.certificate);
        } else {
          setError('Certificate not found or not valid.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching the certificate.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-blue-600">
        <Loader className="animate-spin mr-2" size={24} />
        Loading certificate...
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex flex-col items-center py-20 justify-center min-h-[60vh]">
        <div className="text-red-600 mb-4">{error || 'Certificate not found.'}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-3 bg-gray-200 text-blue-700 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-32 min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Certificate Details</h2>
        <div className="mb-4">
          <div className="font-semibold text-blue-800 text-lg mb-2">{certificate.courseName}</div>
          <div className="text-blue-500 text-base mb-1">Recipient: {certificate.recipientName}</div>
          <div className="text-blue-500 text-base mb-1">Certificate ID: {certificate.certId}</div>
          <div className="text-gray-500 text-sm mb-1">
            Issued: {new Date(certificate.issuedDate).toLocaleDateString()}
          </div>
          {certificate.remarks && (
            <div className="text-gray-600 text-sm mt-2">Remarks: {certificate.remarks}</div>
          )}
        </div>
        <div className="flex gap-4 mt-6 justify-center">
          {certificate.pdfUrl && (
            <a
              href={certificate.pdfUrl}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Certificate
            </a>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 bg-gray-200 text-blue-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetails; 