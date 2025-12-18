import { createContext, SetStateAction, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axiosConfig";
import type { User } from "@/types/index.d.ts"
import Loader1 from "@/loaders/Loader1";

export type UserContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    userLoading: boolean;
    setUserLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserContext = createContext<UserContextType | null>(null);


export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState<boolean>(false);
    const getUser = async () => {
        setUserLoading(true);
        const response = await api.get("/user/userInfo");
        // console.log(response.data);
        if (response.status === 200) {
            setUser(response.data.user);
        } else {
            navigate("/login")
        }
        setUserLoading(false);
    }
    useEffect(() => {
        getUser();
    }, [])
    if (userLoading) return <div className="w-full h-screen flex items-center justify-center"><Loader1 theme={true} /></div>;
    if (!userLoading && user === null) navigate("/login");
    return (
        <UserContext.Provider value={{ user, setUser, setUserLoading, userLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);