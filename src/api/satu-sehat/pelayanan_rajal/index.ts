import { Router } from "express";

import { router as encounterController } from "./encounter/encounter.controller";
import { router as observationController } from "./observation/observation.controller";
import { router as conditionController } from "./condition/condition.controller";
import { router as medicationController } from "./medication/medication.controller";
import { router as serviceRequestController } from "./service-request/serviceRequest.controller";
import { router as diagnosticReportController } from "./diagnostic-report/diagnosticReport.controller";
import { router as clinicalImpressionController } from "./clinical-impression/clinicalImpression.controller";
import { router as allergyIntoleranceController } from "./allergy-intolerance/allergyIntolerance.controller";

const router = Router();

router.use("/encounter", encounterController);
router.use("/observation", observationController);
router.use("/condition", conditionController);
router.use("/medication", medicationController);
router.use("/serviceRequest", serviceRequestController);
router.use("/diagnosticReport", diagnosticReportController);
router.use("/clinicalImpression", clinicalImpressionController);
router.use("/allergyIntolerance", allergyIntoleranceController);

export { router };