import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";

const UserContext = createContext();


export const UserContextProvider = ({children})=>{
    const navigate = useNavigate();
    const [user,setUser]= useState(null);
    
    const getUser = async ()=>{
        const token = localStorage.getItem("token");
        if(!token){
            console.log("no tken found at userCOntext")
            navigate("/login");
        }else{
            const response = await api.get("/user/userInfo");
            // console.log(response.data);
            setUser(response.data.user);
        }
    }
    useEffect(()=>{
        getUser();
    },[])
    return(
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);