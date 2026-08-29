import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';

function Home() {
    const {userData} = useSelector(state => state.user)
    const dispatch = useDispatch()
    
    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
        } catch (error) {
            console.log(error)
        }
    }

    const googleLogin = async () => {
        const data = await signInWithPopup(auth, googleProvider)
        const token = await data.user.getIdToken()
        console.log(token)
        await handleLogin(token)
        console.log(data)
    }
    
    return (
        <div className='h-screen flex bg-[#0a0a0a] text-white font-bold overflow-hidden'>

            <SideBar/>
            <ChatArea/>
            <Artifact/>

            {!userData &&   
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
                <div className='w-[340px] bg-[#151515] border-2 border-green-500/50 rounded-2xl p-7 flex flex-col gap-6 shadow-[0_0_20px_rgba(34,197,94,0.15)]'>
                    <div className='flex flex-col gap-2 text-center'>
                        <h2 className='text-[18px] font-bold text-white tracking-wide'>Welcome to VIDYUT</h2>
                        <p className='text-[14px] font-bold text-white'>Please login to continue using the platform.</p>
                    </div>

                    <button 
                        className='w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[14px] font-bold text-white bg-green-600 hover:bg-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200 cursor-pointer' 
                        onClick={googleLogin}
                    >
                        <div className='bg-white rounded-full p-0.5 flex items-center justify-center'>
                            <FcGoogle size={18} />
                        </div>
                        Continue With Google
                    </button>
                </div>
            </div>}
          
        </div>
    )
}

export default Home