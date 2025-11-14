import React, { useState } from 'react';
import { Mail, Lock, Eye, Facebook, Chrome, Apple, AlertTriangle, AtSign } from 'lucide-react';
import axios from 'axios';
import Loader1 from '@/loaders/Loader1';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


export const Input = ({ id, type = 'text', placeholder, icon: Icon, children, className = '', value, onChange }) => (
  <div className={`relative flex items-center h-10 w-full rounded-lg  bg-black/30 px-3 py-2 text-sm transition-colors focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 ${className}`}>
    {Icon && <Icon className="mr-2 h-4 w-4 text-gray-400" />}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      value={value}
      onChange={onChange}
    />
    {children}
  </div>
);

export const Button = ({ children, variant = 'default', size = 'default', className = '', icon: Icon, onClick, disabled }) => {
  let baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  if (size === 'default') {
    baseClasses += ' h-10 px-4 py-2';
  }

  let variantClasses = '';
  switch (variant) {
    case 'default':
      variantClasses = 'bg-white/15 text-white shadow-xl hover:bg-white/25 active:scale-[0.99] transition-transform duration-100 ease-in-out';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent border border-gray-700 text-white hover:bg-white/10 active:scale-[0.99] transition-transform duration-100 ease-in-out';
      break;
    case 'link':
      variantClasses = 'text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline';
      break;
    default:
      variantClasses = 'bg-white/10 text-white hover:bg-white/20';
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [flag1, setFlag1] = useState(false);
  const [flag2, setFlag2] = useState(false);
  const [flag3, setFlag3] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFlag1(false);
    setFlag2(false);
    setFlag3(false);

    if (!username || !password) {
      setFlag1(true);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_URL}/user/login`, {
        username,
        password
      });
      console.log(res.status)
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        toast("Login SuccessFull")
        navigate("/home")
      } else {
        setFlag3(true);
      }

    } catch (err) {
      console.error(err);
      setFlag3(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader1 />;


  // Error Message Display Component
  const ErrorMessage = ({ message }) => (
    <div className="flex items-center p-3 mt-4 text-sm font-medium text-red-400 bg-red-900/30 rounded-lg border border-red-700/50">
      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
      {message}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(50, 80, 200, 0.45) 0%, rgba(10, 10, 10, 1) 50%)',
        backgroundSize: 'cover'
      }}>

      {/* The main card container */}
      <div
        className="w-full max-w-sm p-8 rounded-2xl shadow-2xl backdrop-blur-xl "
        style={{
          backgroundColor: 'rgba(20, 20, 20, 0.7)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 8px rgba(70, 130, 180, 0.1)'
        }}>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Log in
          </h1>
          <p className="text-sm text-gray-400">
            Log in to your account and seamlessly continue managing your projects, ideas, and progress just where you left off.
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>

          <Input
            id="email"
            type="text"
            placeholder="Enter your username"
            icon={AtSign}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFlag1(false);
            }}
          />

          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            icon={Lock}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFlag1(false);
            }}
          >
            <div
              className="cursor-pointer text-gray-500 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Eye className="h-4 w-4" />
            </div>
          </Input>

          {/* Error Messages */}
          {flag1 && <ErrorMessage message="Please enter both your email address and password." />}
          {flag2 && <ErrorMessage message="Login failed: Your account has been blocked or disabled." />}
          {flag3 && <ErrorMessage message="An unexpected error occurred during login. Please try again." />}


          <Button
            variant="default"
            className="w-full mt-6"
            type="submit"
            disabled={loading}
          >
            Log in
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <span className='text-zinc-600'>Comming Soon</span>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="ghost" disabled={true} icon={Facebook} onClick={() => console.log('Facebook clicked')}>
              Facebook
            </Button>
            <Button variant="ghost" disabled={true} icon={Chrome} onClick={() => console.log('Google clicked')}>
              Google
            </Button>
            <Button variant="ghost" disabled={true} icon={Apple} onClick={() => console.log('Apple clicked')}>
              Apple
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Didn't have an account?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>
            Sign up
          </Button>
        </p>

      </div>
    </div>
  )
}

export default Login;