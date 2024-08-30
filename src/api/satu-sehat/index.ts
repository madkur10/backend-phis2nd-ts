import { Router } from "express";
import { router as LayananRajalController } from "./pelayanan-rawat-jalan/pelayanan-rawat-jalan.controller";
import { router as GenerateTokenController } from "./generate-token/generate-token.controller";
import { router as resourcesTokenController } from "./resources/resources.controller";

const router = Router();

router.use("/layanan-rawat-jalan", LayananRajalController);
router.use("/generate-token", GenerateTokenController);
router.use("/resources", resourcesTokenController);

export { router };