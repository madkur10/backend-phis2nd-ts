import express, { Router } from "express";
import bodyParser from "body-parser";

export const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));