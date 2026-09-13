// Tests for blocked-chat handling in ChatContext:
// 1) Opening a DM that 403s on getMessages resolves blockState via the profile.
// 2) Unblocking calls the API, clears blockState and reloads the conversation.
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, test, expect, beforeEach } from "vitest";

vi.mock("@/utils/axiosConfig", () => ({
  __esModule: true,
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("@/Store/UserContext", () => ({
  useUser: () => ({
    user: {
      _id: "me",
      username: "me",
      email: "me@example.com",
      profilePic: "",
      status: "offline",
      blockedUsers: [],
      groups: [],
      contacts: [],
      pushSubscription: {},
    },
  }),
}));

vi.mock("@/lib/posthog", () => ({ trackEvent: vi.fn() }));

import api from "@/utils/axiosConfig";
import { ChatContextProvider, useChat } from "@/Store/ChatContext";

function Harness() {
  const { setChat, blockState, unblockCurrent } = useChat();
  return (
    <div>
      <span data-testid="state">{blockState}</span>
      <button
        onClick={() =>
          setChat({
            _id: "peer",
            name: "blocked_user",
            status: "offline",
            username: "blocked_user",
            profilePic: "",
            isGroup: false,
            lastMessage: {} as any,
          })
        }
      >
        open chat
      </button>
      <button onClick={unblockCurrent}>unblock</button>
    </div>
  );
}

const peerChat = {
  _id: "peer",
  name: "blocked_user",
  status: "offline",
  username: "blocked_user",
  profilePic: "",
  isGroup: false,
  lastMessage: {} as any,
};

beforeEach(() => {
  vi.clearAllMocks();

  (api.get as any).mockResolvedValue({
    data: { data: { user: { isBlockedByMe: true } } },
  });
});

test("403 on getMessages sets blockState to blockedByMe via the profile", async () => {
  (api.post as any).mockRejectedValue({
    response: { status: 403, data: { error: "Forbidden: you cannot message this user." } },
  });

  render(
    <ChatContextProvider>
      <Harness />
    </ChatContextProvider>
  );

  fireEvent.click(screen.getByText("open chat"));

  await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("blockedByMe"));
  expect(api.post).toHaveBeenCalledWith(
    "/message/getMessages?page=1&limit=10",
    expect.objectContaining({ toUser: "blocked_user", isGroup: false })
  );
  expect(api.get).toHaveBeenCalledWith("/user/profile/blocked_user");
});

test("unblock clears blockState and reloads the conversation", async () => {
  let getMessagesCalls = 0;
  (api.post as any).mockImplementation((url: string) => {
    if (url.startsWith("/message/getMessages")) {
      getMessagesCalls += 1;
      if (getMessagesCalls === 1) {
        return Promise.reject({
          response: { status: 403, data: { error: "Forbidden: you cannot message this user." } },
        });
      }
      return Promise.resolve({ data: { messages: [], hasMore: false } });
    }
    if (url.startsWith("/user/unblockUser/")) {
      return Promise.resolve({ status: 200 });
    }
    return Promise.resolve({ status: 200, data: {} });
  });

  render(
    <ChatContextProvider>
      <Harness />
    </ChatContextProvider>
  );

  fireEvent.click(screen.getByText("open chat"));
  await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("blockedByMe"));

  fireEvent.click(screen.getByText("unblock"));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/user/unblockUser/blocked_user");
  });
  await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("none"));
});