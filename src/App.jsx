import { Route, Routes } from "react-router-dom"
import Login from "./Login"
import { Register } from "./Register"




function App() {


  return (
    <>
     <Routes>

      {/* <Route path="/feed" element/> */}
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />



    
     </Routes>
    
    </>
  )
}

export default App
