import React, { useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const AddContacts = () => {
  const navigate = useNavigate();
  const [username,setUsername]   = useState();
  const [contact,setContact]   = useState();
  const [loading,setLoading] = useState(false);
  const [users,setUsers] = useState([]);
  const getContacts =async  ()=>{
    const response =  await api.post('/user/search',{"query":username});
    // console.log(response.data);
    setUsers(response.data);
  }
  const addContact = async(usernameToAdd)=>{
    const response = await api.post('/user/addContact',{
        contact:usernameToAdd,
    })
    console.log(response.data);
  }
  useEffect(()=>{
    getContacts();
  },[username])
  return (
    <div>
        <div className="head flex justify-between items-center mt-5">
            <h1 className='text-2xl font-bold m-5'>Add Contacts</h1>
            <div><button onClick={()=>navigate("/home")} className='m-5 bg-black text-white rounded px-4 py-2 cursor-pointer'>Back</button></div>
        </div>
        <div className="search flex items-center justify-center mt-5">
            <input type="text" onChange={(e)=>setUsername(e.target.value)} className='border rounded px-3 py-1 w-1/2 outline-none' placeholder='search for contacts' name="" id="" />
        </div>
        <div className="search-results flex justify-center mt-5">
            {
                users.length == 0 ?
                <div>
                    No users found
                </div>
                :
                <div className='w-1/3'>
                    {users.map((user)=>{
                       return(
                        <div className='bg-black text-white p-5 rounded flex justify-between'>
                           <div >
                                {user.username}
                            </div>
                            <button onClick={()=>addContact(user.username)} className='cursor-pointer'>Add</button>
                        </div>
                       )
                    })}
                </div>
            }
        </div>
    </div>
  )
}

export default AddContacts