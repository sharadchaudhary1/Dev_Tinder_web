
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/request/recieved`, {
        withCredentials: true
      });
      console.log(res)
      setRequests( res.data);
    } catch (err) {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    await axios.post(`${BASE_URL}/request/review/accepted/${id}`, {}, {
      withCredentials: true
    });
    fetchRequests();
  };

  const handleReject = async (id) => {
    await axios.post(`${BASE_URL}/request/review/rejected/${id}`, {}, {
      withCredentials: true
    });
    fetchRequests();
  };

  if (loading) return <p className="text-center mt-10">Loading requests...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6">📩 Friend Requests</h2>

      {requests.length === 0 && (
        <p className="text-gray-500">No pending requests</p>
      )}

      <div className="grid gap-4">
        {requests.map(req => (
          <div
            key={req._id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h4 className="text-lg font-medium">
              {req.fromUserId.firstname} {req.fromUserId.lastname}
            </h4>

            <p className="text-sm text-gray-600">
              Age: {req.fromUserId.age}
            </p>
            <p className="text-sm text-gray-600">
              Gender: {req.fromUserId.gender}
            </p>

            <p className="text-sm mt-1">
              <span className="font-medium">Skills:</span>{" "}
              {req.fromUserId.skills?.join(", ") || "N/A"}
            </p>

            <p className="text-sm text-gray-700 mt-2">
              {req.fromUserId.about}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAccept(req._id)}
                className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Accept
              </button>

              <button
                onClick={() => handleReject(req._id)}
                className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Requests;
