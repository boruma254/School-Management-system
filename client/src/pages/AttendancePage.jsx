import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    if (user.role === "STUDENT") {
      loadMyAttendance();
    }
    if (user.role === "LECTURER") {
      loadAttendanceSheets();
    }
  }, [user]);

  const loadAttendanceSheets = async () => {
    setSheetsLoading(true);
    try {
      const res = await api.get("/academic/attendance/sheets");
      setSheets(res.data.sheets || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance sheets.");
    } finally {
      setSheetsLoading(false);
    }
  };

  const loadMyAttendance = async () => {
    try {
      const res = await api.get("/academic/attendance/my");
      setAttendance(res.data.attendance || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAttendance = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const normalizeHeader = (header) =>
        header
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

      // Parse CSV file to extract attendance data
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/);
      const headers = lines[0].split(",").map((h) => normalizeHeader(h));

      if (!headers.length || !headers.some((h) => h.includes("student"))) {
        throw new Error(
          "CSV must include a studentId column (e.g. studentId or student_id)",
        );
      }

      const attendanceData = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim());
        const record = {};

        headers.forEach((header, idx) => {
          record[header] = values[idx];
        });

        const rawStudentId =
          record.studentid ||
          record.student_id ||
          record.student ||
          record.admissionnumber ||
          record.admission_number ||
          record.email;
        const studentId = rawStudentId
          ? String(rawStudentId)
              .trim()
              .replace(/^['"]|['"]$/g, "")
          : "";
        const rawStatus = String(record.status || "PRESENT")
          .trim()
          .replace(/^['"]|['"]$/g, "")
          .toUpperCase();
        const dateValue = String(
          record.date || new Date().toISOString().split("T")[0],
        )
          .trim()
          .replace(/^['"]|['"]$/g, "");

        if (!studentId) {
          throw new Error(
            `Invalid CSV row ${i}: missing studentId/admissionNumber/email value.`,
          );
        }

        const status = ["PRESENT", "ABSENT", "LATE"].includes(rawStatus)
          ? rawStatus
          : "PRESENT";
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
          throw new Error(`Invalid date value on row ${i}: ${dateValue}`);
        }

        attendanceData.push({
          studentId,
          status,
          date: date.toISOString(),
        });
      }

      if (!attendanceData.length) {
        throw new Error("No attendance records found in the uploaded CSV.");
      }

      await api.post("/academic/attendance/upload", {
        attendanceData,
        sheetTitle,
        fileName: csvFile.name,
      });

      setCsvFile(null);
      setSheetTitle("");
      setUploadOpen(false);
      setSuccessMessage("Attendance records uploaded successfully.");
      loadAttendanceSheets();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload attendance records.",
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadAttendanceTemplate = async () => {
    try {
      const response = await api.get("/academic/attendance/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_template.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to download attendance template.",
      );
    }
  };

  const statusColor = {
    PRESENT: "bg-emerald-100 text-emerald-700",
    ABSENT: "bg-rose-100 text-rose-700",
    LATE: "bg-amber-100 text-amber-700",
  };

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE").length;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-slate-900">
            Attendance
          </h1>
          <p className="text-sm text-slate-600">
            {user.role === "STUDENT"
              ? "View your attendance records"
              : "Manage student attendance"}
          </p>
        </div>
        {user.role === "LECTURER" && (
          <button
            onClick={() => setUploadOpen(!uploadOpen)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {uploadOpen ? "Cancel" : "📤 Upload Attendance"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {uploadOpen && user.role === "LECTURER" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Upload Attendance Sheet
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            CSV Format: studentId/admissionNumber/email, status
            (PRESENT/ABSENT/LATE), date (YYYY-MM-DD)
          </p>
          <form onSubmit={handleUploadAttendance} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Sheet Title (optional)
                </label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  placeholder="e.g. Week 3 Attendance"
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  required
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={downloadAttendanceTemplate}
                className="h-fit rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Download All-Students Template
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || !csvFile}
                className="rounded-md bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="rounded-md border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {user.role === "LECTURER" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 shadow-sm">
              <div className="text-sm font-medium text-slate-700">
                Attendance Sheets
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {sheets.length}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 shadow-sm">
              <div className="text-sm font-medium text-slate-700">
                Most Recent Sheet
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {sheets[0]?.title || "—"}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 shadow-sm">
              <div className="text-sm font-medium text-slate-700">
                Last Uploaded
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {sheets[0]
                  ? new Date(sheets[0].createdAt).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>

          {sheetsLoading ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              Loading attendance sheets...
            </div>
          ) : sheets.length ? (
            <div className="rounded-xl bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Created At
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Student Records
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheets.map((sheet) => (
                      <tr
                        key={sheet.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {sheet.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {new Date(sheet.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {sheet.studentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-6 text-center">
              <p className="text-sm text-slate-500">
                No attendance sheets uploaded yet.
              </p>
            </div>
          )}
        </div>
      )}

      {user.role === "STUDENT" && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4 shadow-sm">
              <div className="text-sm font-medium text-emerald-700">
                Present
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-900">
                {presentCount}
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 p-4 shadow-sm">
              <div className="text-sm font-medium text-rose-700">Absent</div>
              <div className="mt-2 text-3xl font-bold text-rose-900">
                {absentCount}
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 shadow-sm">
              <div className="text-sm font-medium text-amber-700">Late</div>
              <div className="mt-2 text-3xl font-bold text-amber-900">
                {lateCount}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-sm text-slate-500">
              Loading attendance records...
            </div>
          ) : attendance.length ? (
            <div className="rounded-xl bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Recorded By
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              statusColor[record.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {record.lecturer?.user?.fullName || "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-6 text-center">
              <p className="text-sm text-slate-500">
                No attendance records yet.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
