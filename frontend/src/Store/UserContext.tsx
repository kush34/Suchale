import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import type { User } from "types/index"

export type UserContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | null>(null);


export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    const getUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("no tken found at userCOntext")
            navigate("/login");
        } else {
            const response = await api.get("/user/userInfo");
            // console.log(response.data);
            setUser(response.data.user);
        }
    }
    useEffect(() => {
        getUser();
    }, [])
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);