import { createContext, useEffect, useState } from "react";


type ThemeContextType = {
    theme: boolean;
    setTheme: React.Dispatch<React.SetStateAction<boolean>>;
    toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<boolean>(true);
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
            localStorage.setItem('theme', JSON.stringify(true));
            setTheme(true);
        }
    }, []);
    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )

}

export default ThemeContextProvider;