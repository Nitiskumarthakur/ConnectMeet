import { Router } from "express";
const router = Router();

import { register,login, getUserHistory, addUserHinstory } from "../controllers/userController.js";

router.post("/login", login);
router.post("/register", register);
router.post("/add_to_activity", addUserHinstory );
router.get("/get_all_activity", getUserHistory);

export default router;