import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminLeaveManagementPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeaveRequests();
  }, [filterStatus]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const url = filterStatus
        ? `${import.meta.env.VITE_API_BASE_URL}/leave-requests?status=${filterStatus}`
        : `${import.meta.env.VITE_API_BASE_URL}/leave-requests`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeaveRequests(response.data.leaveRequests || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveRequestId) => {
    if (!window.confirm("Approve this leave request?")) return;

    setSubmitting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/leave-requests/${leaveRequestId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await fetchLeaveRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error approving request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (leaveRequestId) => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/leave-requests/${leaveRequestId}/reject`,
        { rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await fetchLeaveRequests();
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.response?.data?.error || "Error rejecting request");
    } finally {
      setSubmitting(false);
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Leave Request Management
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {["", "PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {request.student.user.fullName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {request.student.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {Math.ceil(
                          (new Date(request.endDate) -
                            new Date(request.startDate)) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Review */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Review Leave Request
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Student</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedRequest.student.user.fullName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Start Date
                  </p>
                  <p className="text-gray-800">
                    {new Date(selectedRequest.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    End Date
                  </p>
                  <p className="text-gray-800">
                    {new Date(selectedRequest.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Reason</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded">
                  {selectedRequest.reason}
                </p>
              </div>
            </div>

            {selectedRequest.status === "PENDING" && (
              <div className="space-y-4">
                {submitting && (
                  <div className="bg-yellow-50 p-3 rounded text-yellow-700">
                    Processing...
                  </div>
                )}

                {!submitting && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide reason if you're rejecting this request..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest.id)}
                        className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-4 w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagementPage;
