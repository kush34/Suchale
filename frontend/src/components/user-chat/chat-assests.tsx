import {
  FileText,
  Image,
  Link2,
  Search,
  X,
  Download,
  ExternalLink,
  Cross,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { Message } from "@/types";
import { useChat } from "@/Store/ChatContext";

type ChatAssetsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

type chatAssestsType = {
  media: Message[];
  files: Message[];
  links: Message[];
  messages: Message[];
};
const media = Array.from({ length: 12 });
const files = Array.from({ length: 5 });
const links = Array.from({ length: 5 });
const searchResults = Array.from({ length: 6 });

export default function ChatAssetsDrawer({
  open,
  onClose,
}: ChatAssetsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { chat } = useChat();
  const [assests, setAssests] = useState<chatAssestsType | null>(null);
  const fetchAssestsData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/message/chat-assets", {
        params: {
          ...(chat?.isGroup
            ? { groupId: chat._id }
            : { username: chat?.username }),
          search:searchQuery,
        },
      });

      if (response.status === 200 && response.data) {
        setAssests(response.data);
      } else {
        setError(
          response.data?.error ||
            response.data?.message ||
            "Could not fetch assets.",
        );
      }
    } catch {
      setError("Could not fetch assets.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (open) {
      fetchAssestsData();
    }
  }, [open,searchQuery]);

  return (
    <div
      className={`fixed right-0 top-0 z-50 h-screen w-[420px] border-l bg-background transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}

      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Chat Details</h2>

            <p className="text-sm text-muted-foreground">
              Search & Shared Content
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
      
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-10 pr-10"
          />
      
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="search"
        className="flex h-[calc(100vh-138px)] flex-col"
      >
        <TabsList className="mx-4 mt-4 grid grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1 px-4 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border p-4"
                >
                  <div className="mb-3 h-4 w-1/3 rounded bg-muted" />
                  <div className="mb-2 h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="font-medium text-destructive">
                  Failed to load assets
                </p>

                <p className="mt-1 text-sm text-muted-foreground">{error}</p>

                <Button className="mt-4" onClick={fetchAssestsData}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* SEARCH */}

              <TabsContent value="search" className="space-y-3">
                {assests?.messages.length ? (
                  assests.messages.map((message) => (
                    <button
                      key={message._id}
                      className="w-full rounded-xl border p-4 text-left transition hover:bg-accent"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{message.fromUser}</span>

                        <span className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {message.content}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No messages found.
                  </div>
                )}
              </TabsContent>

              {/* MEDIA */}

              <TabsContent value="media">
                {assests?.media.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {assests.media.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => window.open(item.content, "_blank")}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                      >
                        <img
                          src={item.content}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No media shared.
                  </div>
                )}
              </TabsContent>

              {/* FILES */}

              <TabsContent value="files" className="space-y-2">
                {assests?.files.length ? (
                  assests.files.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between rounded-xl border p-3 transition hover:bg-accent"
                    >
                      <div className="flex gap-3">
                        <div className="rounded-lg bg-muted p-2">
                          <FileText size={20} />
                        </div>

                        <div>
                          <p className="font-medium">
                            {file.content.split("/").pop()}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => window.open(file.content, "_blank")}
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No files shared.
                  </div>
                )}
              </TabsContent>

              {/* LINKS */}

              <TabsContent value="links" className="space-y-2">
                {assests?.links.length ? (
                  assests.links.map((link) => {
                    let hostname = "";

                    try {
                      hostname = new URL(link.content).hostname;
                    } catch {
                      hostname = "Unknown";
                    }

                    return (
                      <div
                        key={link._id}
                        className="rounded-xl border p-4 transition hover:bg-accent"
                      >
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            <div className="rounded-lg bg-muted p-2">
                              <Link2 size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium">{hostname}</p>

                              <p className="truncate text-sm text-muted-foreground">
                                {link.content}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(link.content, "_blank")}
                          >
                            <ExternalLink size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No links shared.
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
