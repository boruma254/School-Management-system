import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .get('/students/me/documents')
      .then((res) => {
        if (!isMounted) return;
        setDocuments(res.data.documents || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load documents.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDownload = async (docId) => {
    try {
      setError('');
      const res = await api.get(`/students/me/documents/${docId}`, {
        responseType: 'blob',
      });

      // Best-effort filename; backend sends doc filename.
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `${docId}.txt`;

      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-600">
          Download important documents once your admission request is approved.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading documents...</div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && !documents.length ? (
            <div className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
              No documents available.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 text-sm font-semibold text-slate-800">
                    {d.title}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(d.id)}
                    className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

