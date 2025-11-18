import { useState, useEffect, ReactNode } from 'react';
import { Mail, Lock, User, AlertTriangle } from 'lucide-react';
import Loader1 from '@/loaders/Loader1';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import VerifyOtp from '@/Components/VerifyOtp';
import { Button, Input } from './Login';


const ErrorMessage = ({ children }: { children: ReactNode }) => (
    <div className="flex items-center p-3 mt-4 text-sm font-medium text-red-400 bg-red-900/30 rounded-lg border border-red-700/50">
        <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
        <div>{children}</div>
    </div>
);


const Register = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [flag1, setFlag1] = useState(true);
    const [flag2, setFlag2] = useState(true);
    const [flag3, setFlag3] = useState(false);
    const [flag4, setFlag4] = useState(false);
    const [password, setPassword] = useState('');
    const [otpRequest, setOtpRequest] = useState(false);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const checkUserName = async () => {
        if (!username || username.length <= 0) {
            setFlag2(true);
            return;
        }

        setLoading(true);
        try {
            const request = await axios.post(`${import.meta.env.VITE_URL}/user/usernameCheck`, { username });

            if (request.data.status === "1") {
                setFlag1(true);  // Available
                setFlag2(false); // Check initiated/passed
            } else {
                setFlag1(false); // Not available
                setFlag2(false); // Check initiated/failed
            }
        } catch (error) {
            console.error(error);
            setFlag1(false); // Assume unavailable or error
            setFlag2(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (username.length > 0) {
                checkUserName();
            } else {
                setFlag1(true);
                setFlag2(true);
            }
        }, 800);

        return () => clearTimeout(delayDebounceFn);
    }, [username]);

    const validate = () => {
        let valid = true;
        setFlag3(false);

        if (!username || !password || !email || password.length < 6 || !validateEmail(email) || !flag1 || flag2) {
            valid = false;
        }

        if (!valid) {
            setFlag3(true);
        }
        return valid;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (flag2 || !flag1) {
            setFlag3(true);
            return;
        }

        if (!validate()) return;

        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_URL}/user/sendOtp`, {
                email,
                username,
                password
            });
            console.log(res)
            if (res.status === 200) {
                setOtpRequest(true);
            } else {
                toast(`${res.data.message}`)
            }
        } catch (error: any) {
            console.error(error);

            const backendMsg = error?.response?.data?.message;
            if (backendMsg) {
                toast(backendMsg);
            } else {
                toast(error.message || "Could not register your account. Pls Retry");
            }
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loader1 theme={true} />;
    if (otpRequest) return <VerifyOtp email={email} password={password} username={username} />;


    const getValidationMessages = () => {
        if (!flag3) return null;

        const messages = [];
        if (!username || !password || !email) messages.push("Please fill all required details.");
        if (email && !validateEmail(email)) messages.push("Please enter a valid email address.");
        if (password && password.length < 6) messages.push("Password should be more than 6 characters.");
        if (!flag1 && !flag2) messages.push("Username is not available. Please choose another.");
        if (flag2 && username.length > 0) messages.push("Please wait for username availability check.");

        return messages.length > 0 ? messages.map((msg, i) => <p key={i}>{msg}</p>) : null;
    }

    const isUsernameAvailable = !flag2 && flag1 && username.length > 0;
    const isUsernameUnavailable = !flag2 && !flag1 && username.length > 0;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 font-sans"
            style={{
                backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(50, 80, 200, 0.45) 0%, rgba(10, 10, 10, 1) 50%)',
                backgroundSize: 'cover'
            }}>

            {/* The main card container - Matching Login design */}
            <div
                className="w-full max-w-sm p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10"
                style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.7)',
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 8px rgba(70, 130, 180, 0.1)'
                }}>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Register
                    </h1>
                    <p className="text-sm text-gray-400">
                        Create your account to start managing your projects and ideas seamlessly.
                    </p>
                </div>

                {/* Registration Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>

                    {/* Username Input with Check Status */}
                    <div className="relative">
                        <Input
                            id="username"
                            type="text"
                            placeholder="Choose your username"
                            icon={User}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        // onBlur={checkUserName} // Auto-check handled by useEffect debounce
                        />
                        {isUsernameAvailable && (
                            <p className="text-xs text-green-400 mt-1">Username available!</p>
                        )}
                        {isUsernameUnavailable && (
                            <p className="text-xs text-red-400 mt-1">Username not available.</p>
                        )}
                    </div>

                    {/* Email Input */}
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password Input - Connected to state and visibility toggle */}
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Choose your password (min 6 chars)"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    >
                        <div
                            className="cursor-pointer text-gray-500 hover:text-gray-300"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43-.01.639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>

                        </div>
                    </Input>

                    <Button
                        variant="default"
                        className="w-full mt-6"
                        type="submit"
                        disabled={loading || !flag1 || flag2}
                    >
                        Register & Send OTP
                    </Button>
                </form>

                {/* Success Message (Re-using flag4 for success link as per original logic) */}
                {flag4 && (
                    <div className="flex justify-center mt-5 text-green-400">
                        <p>Account created, please{' '}
                            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
                                login here
                            </Button>
                        </p>
                    </div>
                )}


                {/* Error Messages */}
                {flag3 && (
                    <ErrorMessage>
                        {getValidationMessages()}
                    </ErrorMessage>
                )}


                {/* Login Link */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
                        Log in
                    </Button>
                </p>

            </div>
        </div>
    )
}

export default Register;