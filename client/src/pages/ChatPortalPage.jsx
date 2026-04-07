import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ChatPortalPage() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadMessages(selectedRoomId);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      const res = await api.get("/academic/chat/rooms");
      setChatRooms(res.data.rooms || []);
      if (res.data.rooms?.length && !selectedRoomId) {
        setSelectedRoomId(res.data.rooms[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load chat rooms.");
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMessages = async (roomId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/academic/chat/rooms/${roomId}/messages`);
      const msgs = res.data.messages || [];
      setMessages(
        msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) return;

    setSendingMessage(true);
    try {
      await api.post(`/academic/chat/rooms/${selectedRoomId}/messages`, {
        content: newMessage.trim(),
      });
      setNewMessage("");
      loadMessages(selectedRoomId);
    } catch (err) {
      console.error(err);
      setError("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedRoom = chatRooms.find((room) => room.id === selectedRoomId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Student Chat Portal
        </h1>
        <p className="text-sm text-slate-600">
          Discuss class matters with fellow students
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Chat Rooms Sidebar */}
        <div className="md:col-span-1">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Chat Rooms
            </h2>
            {loadingRooms ? (
              <div className="text-sm text-slate-500">Loading rooms...</div>
            ) : chatRooms.length ? (
              <div className="space-y-2">
                {chatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      selectedRoomId === room.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-xs opacity-75">{room.description}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                No chat rooms available.
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="md:col-span-2">
          <div className="rounded-xl bg-white shadow-sm">
            {selectedRoom ? (
              <>
                <div className="border-b border-slate-200 p-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedRoom.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {selectedRoom.description}
                  </p>
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="text-center text-sm text-slate-500">
                      Loading messages...
                    </div>
                  ) : messages.length ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.user?.id === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                            message.user?.id === user?.id
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-900"
                          }`}
                        >
                          <div className="font-medium text-xs mb-1">
                            {message.user?.fullName || "Unknown"}
                          </div>
                          <div>{message.message}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-slate-500">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {sendingMessage ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex h-96 items-center justify-center text-sm text-slate-500">
                Select a chat room to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
