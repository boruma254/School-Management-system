import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadRecentChatMessages();
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

  const loadRecentChatMessages = async () => {
    try {
      const res = await api.get("/academic/chat/rooms");
      const rooms = res.data.rooms || [];

      // Fetch latest messages from each room
      const allMessages = [];
      for (const room of rooms) {
        try {
          const msgRes = await api.get(
            `/academic/chat/rooms/${room.id}/messages`,
          );
          const messages = msgRes.data.messages || [];
          if (messages.length > 0) {
            allMessages.push({
              ...messages[messages.length - 1],
              roomName: room.name,
              roomId: room.id,
            });
          }
        } catch (err) {
          // Skip rooms with fetch errors
        }
      }

      // Sort by most recent first
      allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setChatMessages(allMessages.slice(0, 5)); // Show latest 5
    } catch (err) {
      console.error(err);
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

  const unreadCount =
    notifications.filter((n) => !n.isRead).length + chatMessages.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative rounded-md bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300"
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-lg bg-white shadow-lg">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Notifications & Messages
            </h3>
          </div>

          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-rose-500">{error}</div>
          ) : notifications.length || chatMessages.length ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Announcements */}
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
                      className="ml-2 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Recent Chat Messages */}
              {chatMessages.map((msg) => (
                <div
                  key={`${msg.roomId}-${msg.id}`}
                  className="border-b border-slate-100 p-4 bg-amber-50 hover:bg-amber-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-xs font-bold text-white">
                      {msg.user?.fullName
                        ? msg.user.fullName.split(" ")[0][0]
                        : "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {msg.user?.fullName || "Unknown"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            in {msg.roomName}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700\">
                        \n {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No notifications or messages yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
