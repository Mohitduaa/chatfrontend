import React,{useContext ,useEffect, useState} from 'react'
import { UserContext} from '../contex/user.contex'
import { useNavigate,  } from 'react-router-dom'

const UserAuth = ({children}) => {
    const {user} = useContext(UserContext)
    const [loading,setLoading] = useState(true)
    const navigate = useNavigate();
    const token = localStorage.getItem('token')
    useEffect (()=>{
      if(user){
          setLoading(false)
      }
      if(!token){
        navigate('/login')
      }
      if(!user){
        navigate('/login')
      }
    },[])
    
    if(loading){
        return <div>Loading...</div>
    }
  return (
    <>
      {children}  
    </>
  )
}

export default UserAuth