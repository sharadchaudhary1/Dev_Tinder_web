import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../constant";
export const Register = () => {
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [images, setImages] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const newUser = {
      firstname,
      lastname,
      email,
      password,
      age: Number(age),
      gender,
      skills: skills
        ? skills.split(",").map((s) => s.trim())
        : [],
      about,
      profilePicture: profilePicture || null,

      images: images
        ? images.split(",").map((img) => img.trim())
        : [],
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/auth/register`,
        newUser
      );

      if (res.status === 200) {
        navigate("/login");
      }

   
      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      setAge("");
      setGender("");
      setSkills("");
      setAbout("");
      setProfilePicture("");
      setImages("");

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle,_#fff1f2,_#ffe4e6,_#fecdd3)]">
      <div className="shadow-lg rounded-2xl p-8 w-full max-w-lg bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          <h2 className="text-2xl text-center font-semibold text-gray-800">
            Register on Matchify ❤️
          </h2>

          <input
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="First Name"
            required
            className="border-2 px-2 py-1 rounded"
          />

          <input
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Last Name"
            className="border-2 px-2 py-1 rounded"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="border-2 px-2 py-1 rounded"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Strong Password"
            required
            className="border-2 px-2 py-1 rounded"
          />

          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age (18+)"
            min="18"
            required
            className="border-2 px-2 py-1 rounded"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border-2 px-2 py-1 rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>

          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Skills (comma separated)"
            className="border-2 px-2 py-1 rounded"
          />

          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="About yourself"
            className="border-2 px-2 py-1 rounded"
          />

          <input
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            placeholder="Profile Picture URL"
            className="border-2 px-2 py-1 rounded"
          />

          <input
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="Other Image URLs (comma separated)"
            className="border-2 px-2 py-1 rounded"
          />

          <button className="bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600">
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};
