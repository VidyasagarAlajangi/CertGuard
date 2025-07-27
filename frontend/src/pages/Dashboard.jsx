import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/certificates/user/certificates')
      .then(res => {
        setCertificates(res.data.certificates || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load certificates');
      setLoading(false);
        console.log(err);
      });
  }, [user, navigate]);

  const handleDownload = async (certId) => {
    try {
      const res = await api.get(`certificates/download-url/${certId}`);
      console.log(res);
      if (res.data && res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      alert('Failed to get download link.');
    }
  };

  if (!user) return null;

  const filteredCertificates = certificates.filter(cert =>
    cert.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    cert.companyId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] pt-32">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">My Certificates</h2>
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search by course or company name..."
            className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-blue-600 text-center">Loading certificates...</div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-gray-500 text-center">No certificates found.</div>
        ) : (
          <ul className="space-y-4">
            {filteredCertificates.map((cert) => (
              <li key={cert.certId} className="border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50">
                <div>
                  <div className="font-semibold text-blue-800 text-lg">{cert.courseName}</div>
                  <div className="text-blue-500 text-sm">Company: {cert.companyId?.name || 'N/A'}</div>
                  <div className="text-blue-500 text-sm">ID: {cert.certId}</div>
                  <div className="text-gray-500 text-xs">Issued: {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div className="mt-2 md:mt-0 flex gap-2">
                 <button
                    onClick={() => handleDownload(cert.certId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    View & Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
