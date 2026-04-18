import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveRequestPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/leave-requests/my/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLeaveRequests(response.data.leaveRequests || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/leave-requests`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setFormData({ reason: "", startDate: "", endDate: "" });
      setShowForm(false);
      await fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.error || "Error submitting leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveRequestId) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/leave-requests/${leaveRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.error || "Error cancelling leave request");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Leave Requests</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "New Request"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Submit Leave Request
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  minLength="10"
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a detailed reason for your leave request..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {leaveRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Duration:{" "}
                      {Math.ceil(
                        (new Date(request.endDate) -
                          new Date(request.startDate)) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </p>
                  </div>
                  {request.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-2">
                  <strong>Reason:</strong> {request.reason}
                </p>

                {request.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-700">
                      <strong>Rejection Reason:</strong>{" "}
                      {request.rejectionReason}
                    </p>
                  </div>
                )}

                <p className="text-gray-500 text-sm mt-4">
                  Submitted: {new Date(request.requestedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestPage;
