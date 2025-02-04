import { Router } from "express";

import { router as encounterController } from "./encounter/encounter.controller";
import { router as observationController } from "./observation/observation.controller";
import { router as conditionController } from "./condition/condition.controller";

const router = Router();

router.use("/encounter", encounterController);
router.use("/observation", observationController);
router.use("/condition", conditionController);

export { router };