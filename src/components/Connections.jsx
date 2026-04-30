import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant";
import { BsChatDotsFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const Connections = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/connections`, {
        withCredentials: true
      });
      setFriends(res.data.friends || res.data);
    } catch (err) {
      console.log(err.message)
      setError("Failed to load connections",err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading friends...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 ">
      <h2 className="text-2xl font-semibold mb-6">👥 My Connections</h2>

      {friends.length === 0 && (
        <p className="text-gray-500">No connections found</p>
      )}

      <div className="grid gap-4">
        {friends.map(friend => (
          <div
            key={friend._id}
            className=" flex justify-between border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div>
            <h4 className="text-lg font-medium">
              {friend.firstname} {friend.lastname}
            </h4>

            <p className="text-sm text-gray-600">Age: {friend.age}</p>
            <p className="text-sm text-gray-600">Gender: {friend.gender}</p>

            <p className="text-sm mt-1">
              <span className="font-medium">Skills:</span>{" "}
              {friend.skills?.join(", ") || "N/A"}
            </p>

            <p className="text-sm text-gray-700 mt-2">
              {friend.about}
            </p>
          </div>
             <div className="flex items-end">
              <Link className="text-2xl" to={`/chat/${friend._id}`}> <BsChatDotsFill /> </Link>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connections;
