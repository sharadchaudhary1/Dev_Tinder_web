import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../constant";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [skills, setSkills] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [images, setImages] = useState("");

 
  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setGender(user.gender || "");
      setAge(user.age || "");
      setSkills(user.skills?.join(", ") || "");
      setAbout(user.about || "");
      setProfilePicture(user.profilePicture || "");
      setImages(user.images?.join(", ") || "");
    }
  }, [user]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedUser = {
      firstname,
      lastname,
      gender,
      age: Number(age),
      about,
      skills: skills
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      profilePicture,
      images: images
        ? images.split(",").map((img) => img.trim()).filter(Boolean)
        : [],
    };

    try {
      await axios.patch(`${BASE_URL}/profile/update`, updatedUser, {
        withCredentials: true,
      });

      navigate("/profile");
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 py-10 px-4 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
      <div className="max-w-3xl mx-auto rounded-xl bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)] shadow-md p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)] ">

{/* First Name */}
<div>
  <label className="block text-sm text-gray-600 mb-1">First Name</label>
  <input
    type="text"
    value={firstname}
    onChange={(e) => setFirstname(e.target.value)}
    placeholder="Enter first name"
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* Last Name */}
<div>
  <label className="block text-sm text-gray-600 mb-1">Last Name</label>
  <input
    type="text"
    value={lastname}
    onChange={(e) => setLastname(e.target.value)}
    placeholder="Enter last name"
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* Gender */}
<div>
  <label className="block text-sm text-gray-600 mb-1">Gender</label>
  <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full border px-4 py-2 rounded"
  >
    <option value="">Select Gender</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="others">Others</option>
  </select>
</div>

{/* Age */}
<div>
  <label className="block text-sm text-gray-600 mb-1">Age</label>
  <input
    type="number"
    value={age}
    onChange={(e) => setAge(e.target.value)}
    placeholder="Enter age"
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* Skills */}
<div>
  <label className="block text-sm text-gray-600 mb-1">Skills</label>
  <input
    type="text"
    value={skills}
    onChange={(e) => setSkills(e.target.value)}
    placeholder="React, Node, MongoDB"
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* About */}
<div>
  <label className="block text-sm text-gray-600 mb-1">About</label>
  <textarea
    value={about}
    onChange={(e) => setAbout(e.target.value)}
    placeholder="Tell something about yourself..."
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* Profile Picture */}
<div>
  <label className="block text-sm text-gray-600 mb-1">
    Profile Picture URL
  </label>
  <input
    type="text"
    value={profilePicture}
    onChange={(e) => setProfilePicture(e.target.value)}
    placeholder="https://example.com/profile.jpg"
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* Images */}
<div>
  <label className="block text-sm text-gray-600 mb-1">
    Other Images (comma separated)
  </label>
  <input
    type="text"
    value={images}
    onChange={(e) => setImages(e.target.value)}
    placeholder="https://img1.com, https://img2.com"
    className="w-full border px-4 py-2 rounded"
  />
</div>

{/* Submit Button */}
<button
  type="submit"
  className="w-full bg-pink-300 text-white py-3 rounded-lg hover:bg-pink-400"
>
  Update Profile
</button>

</form>

      </div>
    </div>
  );
};

export default UpdateProfile;
