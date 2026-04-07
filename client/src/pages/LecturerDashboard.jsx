import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState("");
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGrade, setSavingGrade] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [chatRoomName, setChatRoomName] = useState("");
  const [chatRoomDescription, setChatRoomDescription] = useState("");
  const [chatRoomUnitId, setChatRoomUnitId] = useState("");
  const [creatingChatRoom, setCreatingChatRoom] = useState(false);
  const [chatRoomSuccess, setChatRoomSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoadingUnits(true);
    api
      .get("/academic/units")
      .then((res) => {
        if (!isMounted) return;
        const unitsList = res.data.units || [];
        setUnits(unitsList);
        if (!selectedUnitId && unitsList.length) {
          setSelectedUnitId(unitsList[0].id);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoadingUnits(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedUnitId) {
      setEnrollments([]);
      return;
    }

    let isMounted = true;
    setLoadingEnrollments(true);
    setError("");

    api
      .get(`/academic/units/${selectedUnitId}/enrollments`)
      .then((res) => {
        if (!isMounted) return;
        const items = res.data.enrollments || [];
        setEnrollments(items);
        const initialInputs = {};
        items.forEach((enrollment) => {
          initialInputs[enrollment.id] = {
            catScore: enrollment.grade?.catScore ?? "",
            examScore: enrollment.grade?.examScore ?? "",
          };
        });
        setGradeInputs(initialInputs);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted)
          setError(
            err.response?.data?.message || "Unable to load enrollments.",
          );
      })
      .finally(() => {
        if (isMounted) setLoadingEnrollments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUnitId]);

  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);

  const dashboard = useMemo(() => {
    const totalUnits = units.length;
    const totalStudents = enrollments.length;
    return {
      totalUnits,
      totalStudents,
      todayClasses: 0,
    };
  }, [units.length, enrollments.length]);

  const handleGradeChange = (enrollmentId, field, value) => {
    setGradeInputs((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (enrollmentId) => {
    setError("");
    setSavingGrade(enrollmentId);
    const input = gradeInputs[enrollmentId] || {};

    if (input.catScore === "" || input.examScore === "") {
      setError("Enter both CAT and Exam scores before saving.");
      setSavingGrade("");
      return;
    }

    try {
      await api.post("/academic/grades", {
        enrollmentId,
        catScore: Number(input.catScore),
        examScore: Number(input.examScore),
      });
      const res = await api.get(
        `/academic/units/${selectedUnitId}/enrollments`,
      );
      setEnrollments(res.data.enrollments || []);
      setSavingGrade("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save grade.");
      setSavingGrade("");
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setError("");
    setUploadingDocument(true);

    const formData = new FormData();
    formData.append("title", documentTitle);
    formData.append("description", documentDescription);
    formData.append("document", e.target.document.files[0]);

    try {
      await api.post("/academic/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setDocumentTitle("");
      setDocumentDescription("");
      e.target.reset();
      setUploadingDocument(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to upload document.");
      setUploadingDocument(false);
    }
  };

  const handleCreateChatRoom = async (e) => {
    e.preventDefault();
    setError("");
    setChatRoomSuccess("");
    setCreatingChatRoom(true);

    try {
      await api.post("/academic/chat/rooms", {
        name: chatRoomName,
        description: chatRoomDescription,
        unitId: chatRoomUnitId || undefined,
      });
      setChatRoomName("");
      setChatRoomDescription("");
      setChatRoomUnitId("");
      setChatRoomSuccess("Chat room created successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create chat room.");
    } finally {
      setCreatingChatRoom(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Lecturer Portal
        </h1>
        <p className="text-sm text-slate-600">
          Welcome, {user?.fullName || "Lecturer"}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">
              Assigned Units
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {loadingUnits ? "-" : dashboard.totalUnits}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">
              Students in Selected Unit
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {loadingEnrollments ? "-" : dashboard.totalStudents}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">
              Today's Classes
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {dashboard.todayClasses}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Course Management
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-800">
              Assigned Units
            </div>
            {loadingUnits ? (
              <div className="text-sm text-slate-500">Loading units...</div>
            ) : units.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {units.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <span className="font-medium">
                      {u.code} - {u.name}
                    </span>
                    <span className="text-slate-500">Sem {u.semester}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-slate-500">No units found.</div>
            )}
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-800">
              Upload Document to Students
            </div>
            <form onSubmit={handleDocumentUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="e.g., Lecture Notes - Week 1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Brief description of the document"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Select Document
                </label>
                <input
                  type="file"
                  name="document"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingDocument}
                className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {uploadingDocument ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Grading</h2>
            <p className="text-sm text-slate-600">
              Enter CAT and Exam marks for enrolled students. The backend
              calculates final grades automatically.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="text-sm font-medium text-slate-700">
              Select Unit
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.code} - {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-slate-800">
            Class List & Grades
          </div>
          {loadingEnrollments ? (
            <div className="text-sm text-slate-500">Loading class list...</div>
          ) : selectedUnit ? (
            <div className="space-y-3">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="font-semibold">Unit</div>
                  <div>
                    {selectedUnit.code} - {selectedUnit.name}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="font-semibold">Program</div>
                  <div>{selectedUnit.program?.name || "-"}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="font-semibold">Enrolled Students</div>
                  <div>{enrollments.length}</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">
                        Student
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">
                        Admission
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">
                        CAT
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">
                        Exam
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">
                        Final Grade
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.length ? (
                      enrollments.map((enrollment) => {
                        const input = gradeInputs[enrollment.id] || {};
                        return (
                          <tr key={enrollment.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2">
                              {enrollment.student?.user?.fullName || "Unknown"}
                            </td>
                            <td className="px-4 py-2">
                              {enrollment.student?.admissionNumber}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={input.catScore ?? ""}
                                min={0}
                                step={1}
                                onChange={(e) =>
                                  handleGradeChange(
                                    enrollment.id,
                                    "catScore",
                                    e.target.value,
                                  )
                                }
                                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={input.examScore ?? ""}
                                min={0}
                                step={1}
                                onChange={(e) =>
                                  handleGradeChange(
                                    enrollment.id,
                                    "examScore",
                                    e.target.value,
                                  )
                                }
                                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-2 font-semibold text-slate-900">
                              {enrollment.grade?.grade || "Pending"}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                disabled={savingGrade === enrollment.id}
                                onClick={() => handleSaveGrade(enrollment.id)}
                                className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                              >
                                {savingGrade === enrollment.id
                                  ? "Saving..."
                                  : "Save"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          className="px-4 py-6 text-center text-sm text-slate-500"
                          colSpan={6}
                        >
                          No students enrolled in this unit yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No unit selected.</div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Attendance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Record Attendance
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Attendance tracking is not yet available in the backend. Once
              attendance logs are added, this card can become interactive.
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Attendance Reports
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Reporting will appear after attendance records are stored by the
              system.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Communication</h2>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-slate-800">
            Create Chat Room for Students
          </div>
          <div className="text-sm text-slate-600">
            Lecturers create chat rooms here. Students can join and discuss
            class matters from the chat portal.
          </div>

          {chatRoomSuccess && (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {chatRoomSuccess}
            </div>
          )}

          <form onSubmit={handleCreateChatRoom} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Chat Room Name
              </label>
              <input
                type="text"
                value={chatRoomName}
                onChange={(e) => setChatRoomName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g., Week 3 Discussion"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={chatRoomDescription}
                onChange={(e) => setChatRoomDescription(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Optional room purpose or topic"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Unit (optional)
              </label>
              <select
                value={chatRoomUnitId}
                onChange={(e) => setChatRoomUnitId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">All students</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} - {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creatingChatRoom}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {creatingChatRoom ? "Creating..." : "Create Chat Room"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
