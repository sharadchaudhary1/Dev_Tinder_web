

import React from 'react'
// import { useContext } from 'react';
import { useState } from 'react'
import { Link } from 'react-router-dom'

// import axios from 'axios';
 

const Login = () => {
  
    const[email,setEmail]=useState('');
      const[password,setPassword]=useState('');
   

         
                   
        //    const navigate=useNavigate()
     
     

       async function handleSubmit(e){
          e.preventDefault()
          const UserData={
            email:email,
            password:password
          }

        //   const res=await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`,UserData,  { withCredentials: true })

    




          }
        //   setEmail('')
        //   setPassword('')

        

  return (

    <div className=' flex items-center h-screen w-screen justify-center bg-red-400 '>

    <div className="flex flex-col justify-between h-[350px] w-[500px] rounded-xl  bg-red-300" >

    <div className='p-7'>
       
        <form onSubmit={(e)=>handleSubmit(e)} className='flex  flex-col bg-red-300'>
            <h2 className='text-2xl mb-3  text-center ' >Login to DevTinder</h2>
               
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input 
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            type='email' required placeholder='Enter your Email' className='bg-[#eeeeee] font-bold text-red-900 w-full px-5 py-2 mt-2 rounded '/>

            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input 
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
           
            type='password' placeholder='Enter Your Password' className='bg-[#eeeeee] text-red-900 font-bold w-full px-5 py-2 mt-2 rounded '/>

            <button type='submit' className='text-white bg-gray-700 font-semibold text-xl py-2 mt-3 rounded '>Login</button>
        </form>
           
            <p className="text-xl text-gray-600 text-center mt-5">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-black font-semibold hover:underline hover:text-gray-800"
          >
            Register Yourself
          </Link>
        </p>
    </div>


    </div>
    </div>
  )
}

export default Login