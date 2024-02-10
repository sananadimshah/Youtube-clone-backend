import { Router } from "express";
import { healthcheck } from "../controllers/healtcheck.controller.js";

const router = Router();

router.route("/").get(healthcheck);

export default router;
