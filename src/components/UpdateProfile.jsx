import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../constant";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate=useNavigate()

   const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    age: "",
    skills: "",
    about: "",
  });

 
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        gender: user.gender || "",
        age: user.age || "",
        skills: user.skills?.join(", ") || "",
        about: user.about || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try{
       const res=await axios.patch(`${BASE_URL}/profile/update`,formData,{withCredentials:true})
       
       navigate("/profile")
       
    }
    catch(err){
     console.log(err)
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-gray-100 rounded-xl shadow-md p-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* First Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-1 focus:ring-green-400"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Skills
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node, MongoDB"
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>

          {/* About */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
              placeholder="Tell something about yourself..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg
                       font-semibold hover:bg-green-600 transition"
          >
            Update Profile
          </button>

        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
