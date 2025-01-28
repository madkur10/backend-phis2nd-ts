import { Router } from "express";

import { router as encounterController } from "./encounter/encounter.controller";
import { router as observationController } from "./observation/observation.controller";

const router = Router();

router.use("/encounter", encounterController);
router.use("/observation", observationController);

export { router };