import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Search,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "@/utils/axiosConfig";
import { User } from "@/types";
import { trackEvent } from "@/lib/posthog";

const AddContacts = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("add_contacts_viewed");
  }, []);

  const getContacts = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      trackEvent("contact_search_started", { query });

      const response = await api.post("/user/search", {
        query,
      });

      setUsers(response.data.users ?? []);

      trackEvent("contact_search_results_loaded", {
        query,
        result_count: response.data.users?.length ?? 0,
      });
    } catch {
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (usernameToAdd: string) => {
    setAddingUser(usernameToAdd);

    try {
      await api.post("/user/addContact", {
        contact: usernameToAdd,
      });

      toast.success("Contact added");

      trackEvent("contact_added", {
        username: usernameToAdd,
      });
    } catch {
      toast.error("Unable to add contact");

      trackEvent("contact_add_failed", {
        username: usernameToAdd,
      });
    } finally {
      setAddingUser(null);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      getContacts(username);
    }, 300);

    return () => clearTimeout(timeout);
  }, [username]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 transition hover:bg-accent"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-semibold">
              Add Contacts
            </h1>

            <p className="text-sm text-muted-foreground">
              Search users by username
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b">
        <div className="mx-auto max-w-2xl p-4">
          <div className="flex items-center rounded-xl bg-accent px-3">
            <Search
              size={18}
              className="text-muted-foreground"
            />

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Search username..."
              className="h-11 flex-1 bg-transparent px-3 outline-none"
            />

            {loading && (
              <Loader2
                size={18}
                className="animate-spin text-muted-foreground"
              />
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl divide-y">

          {!loading && username && users.length === 0 && (
            <div className="py-16 text-center">
              <UserPlus
                size={48}
                className="mx-auto mb-4 text-muted-foreground"
              />

              <h2 className="font-semibold">
                No users found
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Try searching with another username.
              </p>
            </div>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between px-5 py-4 transition hover:bg-accent"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.profilePic}
                  alt={user.username}
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <h3 className="font-medium">
                    {user.username}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>

              <button
                disabled={addingUser === user.username}
                onClick={() => addContact(user.username)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingUser === user.username ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  "Add"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddContacts;