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
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadMessages(selectedRoomId);
      loadDocuments(selectedRoomId);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    setError("");
    try {
      const res = await api.get("/academic/chat/rooms");
      setChatRooms(res.data.rooms || []);
      if (res.data.rooms?.length && !selectedRoomId) {
        setSelectedRoomId(res.data.rooms[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load chat rooms.",
      );
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

  const loadDocuments = async (roomId) => {
    try {
      const res = await api.get(`/academic/chat/rooms/${roomId}/documents`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
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
      setError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setError("");
    setSuccessMessage("");
    setCreatingRoom(true);

    try {
      await api.post("/academic/chat/rooms", {
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
      });
      setNewRoomName("");
      setNewRoomDescription("");
      setCreateRoomOpen(false);
      setSuccessMessage("Chat room created successfully.");
      await loadChatRooms();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create chat room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile || !docTitle.trim() || !selectedRoomId) return;

    const formData = new FormData();
    formData.append("document", docFile);
    formData.append("title", docTitle.trim());

    setUploadingDoc(true);
    try {
      await api.post(
        `/academic/chat/rooms/${selectedRoomId}/documents`,
        formData,
      );
      setDocTitle("");
      setDocFile(null);
      setUploadDocOpen(false);
      setSuccessMessage("Document uploaded successfully.");
      loadDocuments(selectedRoomId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
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
          Student Chat
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

      {successMessage && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Chat Rooms Sidebar */}
        <div className="md:col-span-1">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Chat Rooms
              </h2>
              {user?.role === "LECTURER" && (
                <button
                  type="button"
                  onClick={() => setCreateRoomOpen((open) => !open)}
                  className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {createRoomOpen ? "Close" : "Create"}
                </button>
              )}
            </div>

            {createRoomOpen && user?.role === "LECTURER" && (
              <form
                onSubmit={handleCreateRoom}
                className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="e.g., Week 3 Discussion"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    rows={2}
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Optional topic description"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingRoom}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {creatingRoom ? "Creating..." : "Create Room"}
                </button>
              </form>
            )}

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
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedRoom.name}
                    </h2>
                    {user?.role === "LECTURER" && (
                      <button
                        type="button"
                        onClick={() => setUploadDocOpen(!uploadDocOpen)}
                        className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        📄 Upload Notes
                      </button>
                    )}
                  </div>
                </div>

                {uploadDocOpen && user?.role === "LECTURER" && (
                  <div className="border-b border-slate-200 bg-slate-50 p-4">
                    <form onSubmit={handleUploadDocument} className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700">
                          Document Title
                        </label>
                        <input
                          type="text"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          required
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                          placeholder="e.g., Lecture Notes Week 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">
                          Select File
                        </label>
                        <input
                          type="file"
                          onChange={(e) =>
                            setDocFile(e.target.files?.[0] || null)
                          }
                          required
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={uploadingDoc}
                          className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {uploadingDoc ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadDocOpen(false)}
                          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {documents.length > 0 && (
                  <div className="border-b border-slate-200 bg-blue-50 p-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      📚 Room Resources ({documents.length})
                    </div>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm border border-blue-200"
                        >
                          <div>
                            <div className="font-medium text-slate-900">
                              {doc.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              by {doc.user?.fullName || "Unknown"}
                            </div>
                          </div>
                          <a
                            href={`/downloads/${doc.fileName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="min-h-[40vh] max-h-[65vh] overflow-y-auto p-4 space-y-4 md:h-96">
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
                          className={`max-w-full rounded-lg px-3 py-2 text-sm sm:max-w-xs ${
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
                  <form
                    onSubmit={handleSendMessage}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
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
                      className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
                    >
                      {sendingMessage ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500 md:h-96">
                Select a chat room to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
