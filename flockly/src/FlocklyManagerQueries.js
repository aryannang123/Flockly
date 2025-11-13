// src/FlocklyManagerQueries.js
import React, { useEffect, useState } from "react";
import ChatModal from "./components/ChatModal";

export default function FlocklyManagerQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openQuery, setOpenQuery] = useState(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queries", { credentials: "include" });
      const data = await res.json();
      if (data.success) setQueries(data.queries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manager - Queries</h1>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : queries.length === 0 ? (
          <div>No queries yet.</div>
        ) : (
          queries.map((q) => (
            <div key={q._id} className="bg-white text-black rounded p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{q.eventName}</div>
                <div className="text-sm text-gray-600">From: {q.userName || "Unknown"}</div>
                <div className="text-xs text-gray-500">Messages: {q.messages ? q.messages.length : 0}</div>
              </div>

              <div>
                <button
                  onClick={() => setOpenQuery(q)}
                  className="px-3 py-2 rounded bg-blue-600 text-white"
                >
                  Open
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {openQuery && (
        <ChatModal
          event={{ _id: openQuery.eventId, eventName: openQuery.eventName }}
          initialQueryId={openQuery._id}
          isManager={true}
          onClose={() => {
            setOpenQuery(null);
            fetchQueries(); // refresh list for status / counts
          }}
        />
      )}
    </div>
  );
}
