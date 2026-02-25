import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../constant";


const Header = () => {

   const {user,setUser}=useContext(AuthContext)
   const[open,setOpen]=useState(false)
   const navigate=useNavigate()


   useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(`${BASE_URL}/profile/get`, {
          withCredentials: true,
        });

        setUser(res.data);
      } catch (err) {
        console.log(err.message);
        navigate("/login");
      }
    }

    if (!user) {
      fetchUser();
    }
  }, [user]);
    

     async function handleLogout(){
        
        try{

           await axios.post(`${BASE_URL}/auth/logout`,{},{withCredentials:true})
    
           setUser(null);
          
        }catch(err){
            console.log(err)
        }


     }
    

  return (
    <>
    <header className="bg-pink-500 text-white px-4 py-3 flex items-center justify-between shadow">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl">
        <span className="text-yellow-300">DevTinder </span>
      </Link>

       
            <div className="relative flex items-center">
          {user && (
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="h-10 w-10 rounded-full bg-green-300 
                         flex items-center justify-center 
                         font-bold text-red-900 shadow-md text-2xl
                         hover:ring-2 hover:ring-green-500 
                         transition"
            >
              {user.firstname?.charAt(0).toUpperCase()}
            </button>
          )}

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-12 w-48 
                            bg-white text-gray-800 
                            rounded-lg shadow-lg border 
                            overflow-hidden z-50">
              
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/security");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Change Password
              </button>


               <button
                onClick={() => {
                  setOpen(false);
                  navigate("/friends");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Friends
              </button>


               <button
                onClick={() => {
                  setOpen(false);
                  navigate("/requests");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Friend Requests
              </button>

              <hr />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 
                           text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>


    </header>

    <Outlet/>
    </>
  );
};

export default Header;
