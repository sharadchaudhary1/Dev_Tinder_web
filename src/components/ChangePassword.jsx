
import React, { useContext, useEffect, useState } from 'react'
import { BASE_URL } from '../constant'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ChangePassword = () => {

    const {user}=useContext(AuthContext)
    const navigate=useNavigate()
    
       
    const[error,setError]=useState("")
    const [oldPassword,setOldPassword]=useState("Tushar@123")
     const [newPassword,setNewPassword]=useState("Tushar@12")
      const [confirmPassword,setConfirmPassword]=useState("Tushar@12")

      useEffect(() => {
  if (!user) {
    navigate("/login");
  }
}, [user, navigate]);

     

     useEffect(() => {
    

    if (!confirmPassword) {
      setError("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password mismatch!");
    } else {
      setError("");
    }
  }, [newPassword, confirmPassword]);

     async function handlePasswordChange(e){
           e.preventDefault()
        const newpass={
            oldPassword:oldPassword,
            newPassword:newPassword,
            confirmPassword:confirmPassword
        }
           try{

               const res=await axios.patch(`${BASE_URL}/profile/passwordupdate`,newpass,{withCredentials:true})
               console.log(res)
           }
           catch(err){
            console.log(err)
           }

      }
      

  return (
    <div className='flex h-screen w-full  bg-red-200 items-center justify-center ' >  

          
        <form className='flex  w-1/2 p-4 rounded-xl  items-center flex-col gap-5 bg-red-400 ' onSubmit={handlePasswordChange}>
                 <h2 className='font-bold text-gray-700 text-xl'> Change Password</h2>
         <div className='flex w-full flex-col gap-2'>
            
            <label className='text-gray-800'>Enter Your Password:</label>
          <input type='password' name='oldPassword'
          value={oldPassword}
          onChange={(e)=>setOldPassword(e.target.value)}
           placeholder='Enter your old password' 
           className='px-4 py-2 bg-gray-50 rounded border border-gray-300
           focus:outline-none focus:ring-1 focus:ring-green-400'
             
           />
            </div> 
            
              <div className='flex w-full flex-col gap-2'>
          <label className='text-gray-800'>Enter new Password:</label>
          <input type='password' name='newPassword'
            value={newPassword}
          onChange={(e)=>setNewPassword(e.target.value)}
           placeholder='Enter your new password' 
           className='px-4 py-2 bg-gray-50 rounded border border-gray-300
           focus:outline-none focus:ring-1 focus:ring-green-400'
             
           />
         </div>
           

              <div className='flex w-full flex-col gap-2'>
          <label className='text-gray-800' >confirm Password:</label>
          <input type='password' name='confirmPassword'
            value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
           placeholder='confirm password' 
           className='px-4 py-2 bg-gray-50 rounded border border-gray-300
           focus:outline-none focus:ring-1 focus:ring-green-400'
             
             />
           </div>
           <p className='text-sm text-blue-900'>{error}</p>

           <button type='submit' className='px-4 py-2  text-gray-700 font-semibold text-xl bg-green-500 w-1/2  rounded'>change</button>

        </form>
    </div>
  )
}

export default ChangePassword