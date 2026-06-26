import { Router } from "express";
import { getNotifications, getUnreadCount, readNotification } from "../controllers/notificationController";
import verifyToken from "../middlewares/verifyToken";
 
const router = Router();
 
router.get('/unread-count ',verifyToken,getUnreadCount)

router.get("/", verifyToken, getNotifications);

router.post("/", verifyToken, readNotification);
 
export default router;
 
