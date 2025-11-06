import { Router } from "express";

import { router as encounterController } from "./encounter/encounter.controller";
import { router as observationController } from "./observation/observation.controller";
import { router as conditionController } from "./condition/condition.controller";
import { router as medicationController } from "./medication/medication.controller";
import { router as serviceRequestController } from "./service-request/serviceRequest.controller";
import { router as diagnosticReportController } from "./diagnostic-report/diagnosticReport.controller";

const router = Router();

router.use("/encounter", encounterController);
router.use("/observation", observationController);
router.use("/condition", conditionController);
router.use("/medication", medicationController);
router.use("/serviceRequest", serviceRequestController);
router.use("/diagnosticReport", diagnosticReportController);

export { router };