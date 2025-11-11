import React, { useContext, useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader1 from "../loaders/Loader1";
import { ThemeContext } from "../Store/ThemeContext";
const AddContacts = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const {theme} = useContext(ThemeContext);
  const [contact, setContact] = useState();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const getContacts = async () => {
    setLoading(true);
    if(username == "") {
      setLoading(false);
      return;
    };
    const response = await api.post("/user/search", { query: username });
    // console.log(response.data);
    setUsers(response.data.users);
    setLoading(false);
  };
  const addContact = async (usernameToAdd) => {
    const response = await api.post("/user/addContact", {
      contact: usernameToAdd,
    });
    // console.log(response.data);
  };
  useEffect(() => {
    if(username.trim === "") return;
    getContacts();
  }, [username]);
  return (
    <div className={`${theme ? "bg-zinc-300 text-black": "bg-black text-white"} h-screen`}>
      <div className={`head  flex justify-between items-center pt-5`}>
        <h1 className="text-2xl font-bold m-5">Add Contacts</h1>
        <div>
          <button
            onClick={() => navigate("/home")}
            className="m-5 bg-white text-black border rounded px-4 py-2 cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
      <div className="search flex items-center justify-center mt-5">
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getContacts();
            }
          }}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-1 w-1/2 outline-none"
          placeholder="search for contacts"
          name=""
          id=""
        />
      </div>
      {loading ? (
        <Loader1 />
      ) : (
        <div className={`search-results flex justify-center mt-5`}>
          {users.length == 0 ? (
            <div>No users found</div>
          ) : (
            <div className="w-1/3 flex flex-col gap-5 justify-center">
              {users.map((user) => {
                return (
                  <div className={`${ theme ? "bg-black text-white" : "bg-white text-black"} p-5 rounded flex items-center justify-between`}>
                    <div>
                      <img className="w-15 h-15 rounded-full" src={`${user.profilePic}`} alt="" />
                    </div>
                    <div>{user.username}</div>
                    <button
                      onClick={() => addContact(user.username)}
                      className="hover:bg-white rounded hover:text-black duration-120 ease-in px-4 py-2 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddContacts;
