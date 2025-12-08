import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "@/components/Feed/Post/Profile";

test("renders profile", () => {
  render(
    <MemoryRouter>
      <Profile username="test_user" src="test_user_link" />
    </MemoryRouter>
  );

  expect(screen.getByText("test_user")).toBeInTheDocument();

  const img = screen.getByAltText("profile_image");
  expect(img).toHaveAttribute("src", "test_user_link");
});
