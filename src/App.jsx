import { Route, Routes } from "react-router-dom"
import Login from "./Login"
import { Register } from "./Register"
import Header from "./components/Header"
import Feed from "./Feed"
import { AuthContext } from "./context/AuthContext"
import Profile from "./components/Profile"
import UpdateProfile from "./components/UpdateProfile"
import ChangePassword from "./components/ChangePassword"




function App() {






  return (
    <>
     <Routes>


<Route  element={<Header/>}> 
        <Route path="/" element={<Feed/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/updateProfile" element={<UpdateProfile/>}/>

     </Route>
      
      <Route path="/security" element={<ChangePassword/>}/>
     
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
     

     </Routes>
    
    </>
  )
}

export default App
