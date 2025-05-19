import { createContext, useEffect,useState } from "react";

export const ThemeContext = createContext();

export const ThemeContextProvider = ({children})=>{
    const [theme,setTheme] = useState(true);
    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = !prev;
            localStorage.setItem('theme', JSON.stringify(newTheme));
            return newTheme;
        });
    };
    
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme !== null) {
            setTheme(JSON.parse(storedTheme));
        } else {
            localStorage.setItem('theme', JSON.stringify(true)); // default to true
            setTheme(true);
        }
    }, []);
    return(
        <ThemeContext.Provider value={{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )

}

export default ThemeContextProvider;