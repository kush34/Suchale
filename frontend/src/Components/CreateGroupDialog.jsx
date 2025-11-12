import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import { Plus } from "lucide-react";

const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchUser.trim()) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const res = await api.post(`/user/search`,{query:searchUser});
        setResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 400); 

    return () => clearTimeout(delayDebounce);
  }, [searchUser]);

  const toggleUser = (user) => {
    const exists = users.find((u) => u._id === user._id);
    if (exists) setUsers(users.filter((u) => u._id !== user._id));
    else setUsers([...users, user]);
  };

  const handleCreateGroup = async () => {
    if (!name.trim() || users.length === 0) {
      alert("Group name and at least one member are required.");
      return;
    }
    try {
      await api.post("/message/createGroup", {
        name,
        users: users.map((u) => u._id),
      });
      alert("Group created successfully!");
      setName("");
      setUsers([]);
      setSearchUser("");
      setResults([]);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create group.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className=""
      >
        <Plus/>
      </button>

      {open && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white text-gray-800 w-[400px] p-6 rounded-2xl shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">
              Create New Group
            </h2>

            <input
              type="text"
              placeholder="Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="h-[120px] overflow-y-auto border border-gray-200 rounded-lg p-2 mb-3">
              {loading ? (
                <p className="text-sm text-gray-500 text-center">Searching...</p>
              ) : results.length > 0 ? (
                results.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className={`cursor-pointer p-2 rounded-md mb-1 transition ${
                      users.find((u) => u._id === user._id)
                        ? "bg-blue-100 border border-blue-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {user.username}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  {searchUser ? "No users found" : "Type to search users"}
                </p>
              )}
            </div>

            {users.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {u.username}
                    <button
                      onClick={() => toggleUser(u)}
                      className="ml-2 text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!name.trim() || users.length === 0}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  !name.trim() || users.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGroupDialog;
