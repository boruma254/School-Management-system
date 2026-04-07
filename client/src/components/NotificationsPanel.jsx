import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative rounded-md bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300"
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-96 rounded-lg bg-white shadow-lg">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Notifications
            </h3>
          </div>

          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-rose-500">{error}</div>
          ) : notifications.length ? (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`border-b border-slate-100 p-4 ${
                    notif.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {notif.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {notif.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        {notif.lecturer?.user?.fullName && (
                          <span className="text-slate-600">
                            From: {notif.lecturer.user.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="ml-2 text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No notifications yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
