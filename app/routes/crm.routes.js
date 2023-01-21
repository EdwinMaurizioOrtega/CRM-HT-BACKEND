import express from 'express';

import { createImei, getImeiByDescription } from '../controllers/ValidacionImei.js';
import { getGarantia } from '../controllers/WebServicesRemote.js';

const router = express.Router();

//Logitech
router.post('/new_imei', createImei);
router.get('/logitech', getImeiByDescription);

//HT-BUSINESS
router.get('/garantia_imei_pac_sap', getGarantia);

export default router;
