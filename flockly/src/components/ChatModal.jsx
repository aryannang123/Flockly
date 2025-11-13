// src/components/ChatModal.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Chat modal that talks to the server queries endpoints.
 * - Uses REACT_APP_API_URL or falls back to http://localhost:5000
 * - Sends credentials (cookies) so your passport/session works
 *
 * Props:
 * - event : { _id, eventName, title }
 * - onClose: function
 * - initialQueryId: optional
 * - isManager: boolean
 */
export default function ChatModal({ event, onClose, initialQueryId = null, isManager = false }) {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [queryId, setQueryId] = useState(initialQueryId);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (queryId) {
      fetchQuery();
      startPolling();
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      fetchQuery();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  async function fetchQuery() {
    if (!queryId) return;
    const url = `${API_BASE}/api/queries/${queryId}`;
    console.log("[ChatModal] GET ->", url);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("[ChatModal] GET failed:", res.status, txt);
        return;
      }
      const data = await res.json();
      if (data && data.success && data.query) {
        setMessages(data.query.messages || []);
      }
    } catch (err) {
      console.error("[ChatModal] fetchQuery error:", err);
    }
  }

  async function createQueryAndSend(firstMessage) {
    const url = `${API_BASE}/api/queries`;
    const payload = {
      eventId: event._id,
      eventName: event.eventName || event.title,
      initialMessage: firstMessage,
    };
    console.log("[ChatModal] POST create query ->", url, payload);
    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const textRes = await res.text();
      let data = null;
      try { data = JSON.parse(textRes); } catch (e) { /* ignore parse error */ }

      if (!res.ok) {
        console.warn("[ChatModal] create query failed:", res.status, textRes);
        return;
      }
      if (data && data.success && data.query) {
        setQueryId(data.query._id);
        setMessages(data.query.messages || []);
        startPolling();
      } else {
        console.warn("[ChatModal] unexpected create query response:", data || textRes);
      }
    } catch (err) {
      console.error("[ChatModal] createQueryAndSend error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!queryId) {
      // create new conversation
      await createQueryAndSend(trimmed);
      setText("");
      return;
    }

    const url = `${API_BASE}/api/queries/${queryId}/messages`;
    const payload = { sender: isManager ? "manager" : "user", text: trimmed };
    console.log("[ChatModal] POST message ->", url, payload);
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textRes = await res.text();
      let data = null;
      try { data = JSON.parse(textRes); } catch (e) {}

      if (!res.ok) {
        console.warn("[ChatModal] send message failed:", res.status, textRes);
        return;
      }

      if (data && data.success && data.message) {
        setMessages(m => [...m, data.message]);
        setText("");
      } else {
        console.warn("[ChatModal] unexpected send message response:", data || textRes);
      }
    } catch (err) {
      console.error("[ChatModal] sendMessage error:", err);
    }
  }

  const handleClose = () => {
    stopPolling();
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-70" onClick={handleClose} />
      <div className="relative bg-white text-black w-11/12 md:w-96 rounded-lg shadow-lg z-10">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <strong>Chat with Event Manager</strong>
            <div className="text-sm text-gray-600">{event.eventName || event.title}</div>
          </div>
          <button onClick={handleClose} className="text-gray-700 px-2">Close</button>
        </div>

        <div ref={scrollRef} className="p-4 h-64 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500">No messages yet. Ask your question!</div>
          ) : (
            messages.map((m) => (
              <div key={m._id || m.id || Math.random()} className={`mb-3 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block px-3 py-2 rounded ${m.sender === "user" ? "bg-blue-200" : "bg-white border"}`}>
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt || m.created_at || m.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 rounded px-3 py-2 border"
            placeholder={loading ? "Sending..." : "Type your question..."}
            disabled={loading}
          />
          <button onClick={sendMessage} className="px-3 py-2 rounded bg-blue-600 text-white">{isManager ? "Send (Manager)" : "Send"}</button>
        </div>
      </div>
    </div>
  );
}
