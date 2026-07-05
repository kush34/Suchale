import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import {
  getFeedStories,
  deleteStory,
  getStoryViewers,
  markStoryViewed,
  getUserStories,
  createStory,
  getUploadSignature,
} from "../controllers/storyController";

const storyRouter = Router();

storyRouter.use(verifyToken);

storyRouter.post("/upload-signature", getUploadSignature);

storyRouter.post("/", createStory);

storyRouter.get("/feed", getFeedStories);

storyRouter.get("/user/:userId", getUserStories);

storyRouter.put("/:storyId/view", markStoryViewed);

storyRouter.get("/:storyId/viewers", getStoryViewers);

storyRouter.delete("/:storyId", deleteStory);

export default storyRouter;
