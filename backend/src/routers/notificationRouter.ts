import { Router } from "express";
import { getNotifications, readNotification } from "../controllers/notificationController";
import verifyToken from "../middlewares/verifyToken";
 
const router = Router();
 
router.get("/", verifyToken, getNotifications);

router.post("/", verifyToken, readNotification);
 
export default router;
 
