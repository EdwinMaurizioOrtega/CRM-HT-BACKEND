import express from 'express';

//Logitech
import { createImei, getImeiByDescription } from '../controllers/ValidacionImei.js';


//HT-BUSINESS
import { getGarantia } from '../controllers/WebServicesRemote.js';
import {deleteUser, getAllUsers, getUser, IniciarSesion, MyAccount, putUser, Registrarse} from '../controllers/user.js'


//HT-BUSINESS HANA DB
import { getSociosNegocio, getCondicionPago } from '../controllers/SociosDeNegocios.js';
// Productos
import {getAllProducts, getListPriceByCodeAndUser, getProduct, getSearchProducts} from '../controllers/Product.js'
// Clientes
import {getSearchCustomers} from "../controllers/Customer.js";



const router = express.Router();

//Logitech
router.post('/new_imei', createImei);
router.get('/logitech', getImeiByDescription);

//HT-BUSINESS
router.get('/garantia_imei_pac_sap', getGarantia);

//HT-BUSINESS HANA DB | Auth
router.post("/api/account/login", IniciarSesion);
router.get("/api/account/my-account", MyAccount);
router.post("/api/account/register", Registrarse);
router.get("/api/users", getAllUsers)
router.get("/api/users/user", getUser)
router.put("/api/users/user", putUser)
router.delete("/api/users/user", deleteUser)

//HT-BUSINESS HANA DB | Productos
router.get('/api/products', getAllProducts)
//HT-BUSINESS HANA DB | Producto por código
router.get('/api/products/product', getProduct)
//HT-BUSINESS HANA DB | Buscar Productos por nombre
router.get('/api/products/search', getSearchProducts)

//HT-BUSINESS HANA DB | Lista precios producto
router.get("/api/products/price_list_product", getListPriceByCodeAndUser);

//HT-BUSINESS HANA DB | Clientes
router.get('/socios_de_negocio', getSociosNegocio)
router.get('/condicion_pago', getCondicionPago)

//HT-BUSINESS HANA DB | Buscar Clientes por el nombre - Razon Social
router.get('/api/customers/search', getSearchCustomers)


export default router;
