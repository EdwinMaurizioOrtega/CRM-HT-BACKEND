import express from 'express';

//Logitech
import { createImei, getImeiByDescription } from '../controllers/ValidacionImei.js';


//HT-BUSINESS
import { getGarantia } from '../controllers/WebServicesRemote.js';
//import { IniciarSesion, Registrarse } from '../controllers/user.js'


//HT-BUSINESS HANADB
import { getSociosNegocio } from '../controllers/SociosDeNegocios.js';



const router = express.Router();

//Logitech
router.post('/new_imei', createImei);
router.get('/logitech', getImeiByDescription);

//HT-BUSINESS
router.get('/garantia_imei_pac_sap', getGarantia);
// router.post("/signin", IniciarSesion);
// router.post("/signup", Registrarse);

//HT-BUSINESS HANADB
router.get('/socios_de_negocio', getSociosNegocio)


export default router;
