import React, { useState, useEffect } from "react";
import axios from "axios";

const TimetablePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("MONDAY");

  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const dayLabels = {
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/schedules/student/timetable`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setSchedules(response.data.schedules || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching timetable");
    } finally {
      setLoading(false);
    }
  };

  const schedulesByDay = schedules
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading timetable...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">My Timetable</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No classes scheduled yet</p>
          </div>
        ) : (
          <div>
            {/* Day Selector */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Select Day
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-2 px-4 rounded-lg font-semibold transition duration-200 ${
                      selectedDay === day
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {dayLabels[day]}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Display */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-600 text-white p-6">
                <h2 className="text-2xl font-bold">{dayLabels[selectedDay]}</h2>
                <p className="text-blue-100">
                  {schedulesByDay.length} class(es)
                </p>
              </div>

              {schedulesByDay.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No classes on {dayLabels[selectedDay]}
                </div>
              ) : (
                <div className="divide-y">
                  {schedulesByDay.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-6 hover:bg-gray-50 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold uppercase">
                            Time
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-semibold uppercase">
                            Unit
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {schedule.unit.code}
                          </p>
                          <p className="text-gray-600">{schedule.unit.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-semibold uppercase">
                            Room
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {schedule.room || "TBA"}
                          </p>
                        </div>
                        <div className="md:text-right">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            View Unit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Overview */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Weekly Overview
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-2 text-left font-semibold text-gray-700"
                        >
                          {dayLabels[day]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {days.map((day) => {
                        const daySchedules = schedules.filter(
                          (s) => s.dayOfWeek === day,
                        );
                        return (
                          <td key={day} className="px-4 py-4 border-t">
                            {daySchedules.length > 0 ? (
                              <div className="space-y-2">
                                {daySchedules.map((schedule) => (
                                  <div
                                    key={schedule.id}
                                    className="bg-blue-100 text-blue-800 p-2 rounded text-sm"
                                  >
                                    <p className="font-semibold">
                                      {schedule.unit.code}
                                    </p>
                                    <p className="text-xs">
                                      {schedule.startTime}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">
                                No classes
                              </p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetablePage;
