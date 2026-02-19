import { useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "./constant";
import axios from "axios";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [age, setAge] = useState(1);
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState([]);
  const [about, setAbout] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const newUser = {
      firstname: firstname,
      lastname: lastname,

      email: email,
      password: password,
      age: age,
      gender: gender,
      skills: skills,
      about: about,
    };

    try{

      const res=await axios.post(`${BASE_URL}/auth/register`,newUser)

      if(res.status==200){
        alert("registered successfully")
      }
        
    setEmail("");
    setPassword("");
    setFirstname("");
    setLastname("");
    setGender("")
    setSkills([])
    setAge(1);
    setAbout("")

    }catch(err){
        console.log(err)
    }

   
  }

  return (
    <div className="flex flex-col justify-between  bg-red-400 ">
      <div className="p-7">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <h2 className="text-2xl mb-3 text-center font-semibold text-gray-800">
            Register Yourself on DevTinder
          </h2>

          <label className="block text-sm font-medium text-gray-600">
            First Name
          </label>
          <input
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            type="text"
            required
            placeholder="Enter First Name"
            className="bg-[#eeeeee] w-full px-5 py-2 mt-2 rounded font-bold text-rose-900 "
          />

          <label className="block text-sm font-medium text-gray-600 mt-3">
            Last Name
          </label>
          <input
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            type="text"
            required
            placeholder="Enter  Last Name"
            className="bg-[#eeeeee] w-full px-5 py-2 mt-2 rounded font-bold text-rose-900"
          />

          <label className="block text-sm font-medium text-gray-600 mt-3">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Enter your Email"
            className="bg-[#eeeeee] w-full px-5 py-2 mt-2 rounded font-bold text-rose-900"
          />

          <label className="block text-sm font-medium text-gray-600 mt-3">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="Enter your Password"
            className="bg-[#eeeeee] w-full px-5 py-2 mt-2 rounded font-bold text-rose-900"
          />

          <div className="flex gap-5 w-full mt-5 ">
            <div className="flex w-1/2 gap-5 items-center">
              <label className="text-sm font-medium text-gray-600 ">Age:</label>
              <input
                type="text"
                placeholder="Enter Your Age"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="font-bold text-rose-900 px-4 py-2 rounded"
              />
            </div>

            <div className="flex gap-5 items-center">
              <label className="text-sm font-medium text-gray-600  ">
                Gender:
              </label>
              <select
                className="font-bold text-rose-900 rounded px-4 py-2"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="" disabled selected>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <label className="text-gray-600 mt-5 block text-sm ">Skills</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Enter Your Skills"
            className=" mt-2 px-5 py-2 rounded font-bold text-rose-900"
          />

          <label className="block text-sm font-medium text-gray-600 mt-3">
            About
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            type="text"
            required
            placeholder="Enter Something about Yourself"
            className="bg-[#eeeeee] w-full  mt-2 px-5 py-2 rounded font-bold text-rose-900"
          />

          <button
            type="submit"
            className="text-white bg-gray-700 font-semibold text-xl py-2 mt-8 rounded hover:bg-gray-800 transition"
          >
            Register
          </button>
        </form>

        <p className="text-l text-gray-600 text-center mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-black font-semibold hover:underline hover:text-gray-800 transition"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
