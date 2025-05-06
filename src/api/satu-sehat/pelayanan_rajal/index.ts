import { Router } from "express";

import { router as encounterController } from "./encounter/encounter.controller";
import { router as observationController } from "./observation/observation.controller";
import { router as conditionController } from "./condition/condition.controller";
import { router as medicationController } from "./medication/medication.controller";

const router = Router();

router.use("/encounter", encounterController);
router.use("/observation", observationController);
router.use("/condition", conditionController);
router.use("/medication", medicationController);

export { router };