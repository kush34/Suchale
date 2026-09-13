// Tests for the unblock UI on the profile page:
// 1) "You have blocked @user" banner + Unblock button render when isBlockedByMe.
// 2) Clicking Unblock calls /user/unblockUser/:username and clears the banner.
// 3) No banner for non-blocked users.
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, test, expect, beforeEach, afterEach } from "vitest";

vi.mock("@/utils/axiosConfig", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
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

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useParams: () => ({ username: "blocked_user" }) };
});

vi.mock("@/components/Feed/PostCard", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("@/lib/posthog", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import api from "@/utils/axiosConfig";
import ProfilePage from "@/pages/ProfilePage";

const blockedProfile = {
  data: {
    data: {
      user: {
        _id: "peer",
        username: "blocked_user",
        profilePic: "https://placehold.co/300x300",
        fullName: "Blocked User",
        bio: "",
        followers: 0,
        following: 0,
        posts: [],
        isBlockedByMe: true,
      },
    },
  },
};

beforeEach(() => {
  (api.get as any).mockImplementation((url: string) => {
    if (url === "/user/profile/blocked_user") return Promise.resolve(blockedProfile);
    return Promise.resolve({ data: {} });
  });
  (api.post as any).mockResolvedValue({ status: 200 });
});

afterEach(() => {
  vi.clearAllMocks();
});

test("shows 'You have blocked' banner and Unblock button when isBlockedByMe", async () => {
  render(<ProfilePage />);

  expect(
    await screen.findByText(/You have blocked @blocked_user/)
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Unblock" })).toBeInTheDocument();
});

test("clicking Unblock calls the unblock API and clears the banner", async () => {
  render(<ProfilePage />);

  const unblockBtn = await screen.findByRole("button", { name: "Unblock" });
  fireEvent.click(unblockBtn);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/user/unblockUser/blocked_user");
  });
  await waitFor(() => {
    expect(screen.queryByText(/You have blocked @blocked_user/)).not.toBeInTheDocument();
  });
});

test("no banner for a non-blocked user", async () => {
  (api.get as any).mockResolvedValue({
    data: {
      data: {
        user: { ...blockedProfile.data.data.user, isBlockedByMe: false },
      },
    },
  });

  render(<ProfilePage />);

  await screen.findByText("blocked_user");
  expect(screen.queryByText(/You have blocked @blocked_user/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Unblock" })).not.toBeInTheDocument();
});