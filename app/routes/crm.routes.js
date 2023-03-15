import express from 'express';

//Logitech
import { createImei, getImeiByDescription } from '../controllers/ValidacionImei.js';


//HT-BUSINESS
import { getGarantia } from '../controllers/WebServicesRemote.js';
//import { IniciarSesion, Registrarse } from '../controllers/user.js'


//HT-BUSINESS HANA DB
import { getSociosNegocio, getCondicionPago } from '../controllers/SociosDeNegocios.js';



const router = express.Router();

//Logitech
router.post('/new_imei', createImei);
router.get('/logitech', getImeiByDescription);

//HT-BUSINESS
router.get('/garantia_imei_pac_sap', getGarantia);
// router.post("/signin", IniciarSesion);
// router.post("/signup", Registrarse);

//HT-BUSINESS HANA DB
router.get('/socios_de_negocio', getSociosNegocio)
router.get('/condicion_pago', getCondicionPago)


export default router;
