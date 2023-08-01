import express from 'express';

//Logitech
import { createImei, getImeiByDescription } from '../controllers/ValidacionImei.js';


//HT-BUSINESS
import { getGarantia } from '../controllers/WebServicesRemote.js';
import {deleteUser, getAllUsers, getUser, IniciarSesion, MyAccount, putUser, Registrarse} from '../controllers/user.js'


//HT-BUSINESS HANA DB
import { getSociosNegocio, getCondicionPago } from '../controllers/SociosDeNegocios.js';
// Productos
import {
    getAllProducts,
    getListPriceByCodeAndUser,
    getProduct,
    getSearchProducts,
    getStockProduct
} from '../controllers/Product.js'
// Clientes
import {getSearchCustomers} from "../controllers/Customer.js";
import {
    CreateOrder,
    getAllOrders, getAllOrdersRoleCredit,
    getDetailOrder,
    getOrdersAllStatusByVendedor, getOrdersByWarehouse,
    putChangePayment,
    putChangeWarehouse,
    putDetailOrderDelete,
    putDetailOrderDiscount,
    putDetailOrderPriceUnit,
    putDetailOrderQuantity, putFacturar, putOrderAnular
} from "../controllers/Order.js";
import {CreateInvoiceSAP} from "../controllers/SAP.js";



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

//HT-BUSINESS HANA DB | Stock por código-producto
router.get('/api/products/stock/product', getStockProduct)

//HT-BUSINESS HANA DB | Clientes
router.get('/socios_de_negocio', getSociosNegocio)
router.get('/condicion_pago', getCondicionPago)

//HT-BUSINESS HANA DB | Buscar Clientes por el nombre - Razon Social
router.get('/api/customers/search', getSearchCustomers)

//HT-BUSINESS HANA DB | Create Order
router.post("/api/orders/order", CreateOrder);
//HT-BUSINESS HANA DB | Get All Orders By Status 6 ? o lo que sea
router.get("/api/orders", getAllOrders)

//HT-BUSINESS HANA DB | Get All Orders Status (6, 0, 1, 8) para el rol de crédito
router.get("/api/orders/credit", getAllOrdersRoleCredit)
//Listar todos los pedidos por vendedor
router.get("/api/orders/vendedor", getOrdersAllStatusByVendedor)

//Bodega unicamente tiene acceso a los pedidos por facturar 0 y facturados 1
router.get("/api/orders/bodega", getOrdersByWarehouse)
//HT-BUSINESS HANA DB | Obtener el detalle por el numero de la orden
router.get("/api/orders/order/detail", getDetailOrder)
//HT-BUSINESS HANA DB | Actualizar el detalle por el ID detalle pedido.
router.put("/api/orders/order/detail/priceunit", putDetailOrderPriceUnit )
router.put("/api/orders/order/detail/quantity", putDetailOrderQuantity )
router.put("/api/orders/order/detail/discount", putDetailOrderDiscount )
router.delete("/api/orders/order/detail/delete", putDetailOrderDelete )
//HT-BUSINESS HANA DB | Anular una orden.
router.put("/api/orders/order/anular", putOrderAnular )

// HT-BUSINESS HANA DB | Cambiar la bodega de una orden | Área de aprobacion de pedidos
router.put("/api/orders/order/change_warehouse", putChangeWarehouse)

// HT-BUSINESS HANA DB | Cambiar la forma de pago de una orden | Área de aprobacion de pedidos
router.put("/api/orders/order/change_payment", putChangePayment)

//Crear la oden en el sistema SAP - Orden de venta SAP
router.post( "/api/orden_venta_sap", CreateInvoiceSAP)

//Crear el número de factura, valor total, numero de guía, estado a facturado etc.
router.put('/api/orders/order/facturar', putFacturar)



export default router;
