import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaTimes, FaChevronLeft, FaChevronRight,} from "react-icons/fa";
import ProfileCardSkeleton from "./FallbackUi";
import { BASE_URL } from "../constant";

const DEFAULT_PROFILE =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState({});
 



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/feed`, {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const removeUserFromFeed = (userId) => {
    setUsers((prev) => prev.filter((user) => user._id !== userId));
    setActiveImageIndex((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const handleInterested = async (userId) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/request/sent/interested/${userId}`,
      {},
      { withCredentials: true }
    );
    removeUserFromFeed(userId);
  };

  const handleReject = async (userId) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/request/sent/ignored/${userId}`,
      {},
      { withCredentials: true }
    );
    removeUserFromFeed(userId);
  };

  const nextImage = (userId, total) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [userId]: ((prev[userId] || 0) + 1) % total,
    }));
  };

  const prevImage = (userId, total) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [userId]:
        prev[userId] > 0 ? prev[userId] - 1 : total - 1,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-lg font-semibold">
        <ProfileCardSkeleton/>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-xl bg-gray-200 p-4 rounded-xl font-bold">
          No more profiles available
        </h2>
      </div>
    );
  }

  const user = users[0];
  // const photos = user.images?.length ? user.images : [DEFAULT_PROFILE];

  const photos = user.images?.length
  ? user.images
  : user.profilePicture
  ? [user.profilePicture]
  : [DEFAULT_PROFILE];

  const currentIndex = activeImageIndex[user._id] || 0;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white w-96 rounded-2xl shadow-xl overflow-hidden">
        {/* IMAGE SECTION */}
        <div className="relative h-80 bg-gray-200">
          <img
            src={photos[currentIndex]}
            alt="profile"
            className="w-full h-full object-cover"
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={() => prevImage(user._id, photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() => nextImage(user._id, photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                <FaChevronRight />
              </button>
            </>
          )}
        </div>

        {/* USER INFO */}
        <div className="p-5">
          <h2 className="text-2xl font-bold">
            {user.firstname} {user.lastname}, {user.age}
          </h2>

          <p className="text-gray-600 capitalize">{user.gender}</p>

          <p className="text-sm mt-2">
            <span className="font-semibold">Skills:</span>{" "}
            {user.skills?.join(", ")}
          </p>

          <p className="text-gray-500 line-clamp-2 mt-3">
            {user.about}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-10 mt-6">
            <button
              onClick={() => handleReject(user._id)}
              className="flex items-center justify-center w-14 h-14 bg-gray-300 hover:bg-gray-400 rounded-full"
            >
              <FaTimes size={22} />
            </button>

            <button
              onClick={() => handleInterested(user._id)}
              className="flex items-center justify-center w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              <FaHeart size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
