import { Router } from "express";
import { getNotifications, getUnreadCount, readNotification } from "../controllers/notificationController";
import verifyToken from "../middlewares/verifyToken";
 
const router = Router();
 
router.get("/", verifyToken, getNotifications);

router.post("/", verifyToken, readNotification);

router.get('/unread-count ',verifyToken,getUnreadCount)
 
export default router;
 
