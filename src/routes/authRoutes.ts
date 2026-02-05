import { Router } from "express";
import { login, me, signup } from "../controllers/authController";
import { requireAuth } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { loginValidator, signupValidator } from "../validators/authValidators";

const router = Router();

router.post("/signup", signupValidator, validateRequest, signup);
router.post("/login", loginValidator, validateRequest, login);
router.get("/me", requireAuth, me);

export default router;
