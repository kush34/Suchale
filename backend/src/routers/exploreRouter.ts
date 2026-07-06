// routes/explore.routes.ts

import { Router } from "express";
import {
  search,
  trending,
  suggestions,
} from "../controllers/exploreController";
import verifyToken from "../middlewares//verifyToken";

const router = Router();
router.use(verifyToken);

router.get("/search", search);
router.get("/trending", trending);
router.get("/suggestions", suggestions);

export default router;
