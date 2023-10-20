//Sentecia para crear una nueva orden.
import {format} from "date-fns";

export const SqlInsertOrder = () => {
    return `INSERT INTO GRUPO_EMPRESARIAL_HT.HT_ORDERS (
      CLIENTEID,
      ESTADO,
      FECHA,
      FECHAACTUALIZACION,
      FECHACREACION,
      FORMADEPAGO,
      GUARDADO,
      HORA,
      LATITUD,
      LONGITUD,
      OBSERVACIONES,
      ONLINE,
      SUBTOTAL,
      TOTAL,
      TOTALIVA,
      USUARIOAACTUALIZACION,
      VENDEDOR,
      VENDEDORID,
      LOCALCLIENTE_ID,
      EMPRESA,
      FECHAFACTURACION,
      NUMEROFACTURAE4,
      NUMEROFACTURAHIPERTRONICS,
      NUMEROFACTURALIDENAR,
      NUMEROGUIA,
      OBSERVACIONESB,
      NOTACLIENTE,
      USUARIOAPROBO,
      PLANPAGOSTOMEBAMBA_ID,
      APLICACIONORIGEN,
      COMENTARIOENTREGA,
      FECHAENTREGA,
      NOMBREUSUARIOENTREGA,
      USUARIOENTREGA_ID,
      FECHAENTREGASOLICITADA,
      IDUSUARIOENTREGARA,
      NOMBREUSUARIOENTREGARA,
      COURIER,
      USUARIOENTREGABODEGA_ID,
      BODEGA,
      PEDIDOCATEGORIAPROPIA,
      IMAGENA,
      IMAGENB,
      IMAGEN,
      IMAGENGUIA,
      FECHAAPROBO,
      DOCNUM
  ) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
  )`;
};

//const dateAll = format(new Date(), 'dd-MM-yyyy HH:mm:ss');


export const ParamsOrder = (body, dateAll) => [
    body.checkoutData.billing.ID,
    6,
    dateAll,
    body.FECHAACTUALIZACION || '',
    dateAll,
    body.checkoutData.method || '',
    body.GUARDADO || 1,
    body.HORA || '',
    body.LATITUD || 0.00,
    body.LONGITUD || 0.00,
    body.OBSERVACIONES || '',
    body.ONLINE || true,
    body.checkoutData.subtotal || 0.00,
    body.checkoutData.total || 0.00,
    body.checkoutData.iva || 0.00,
    body.USUARIOAACTUALIZACION || '',
    body.checkoutUser.DISPLAYNAME || '',
    body.checkoutUser.ID || 0,
    body.checkoutData.billing.ID || 0,
    body.EMPRESA || '',
    body.FECHAFACTURACION || '',
    body.NUMEROFACTURAE4 || '',
    body.NUMEROFACTURAHIPERTRONICS || '',
    body.NUMEROFACTURALIDENAR || '',
    body.NUMEROGUIA || '',
    JSON.stringify(body.checkoutData.servientrega) || '',
    body.NOTACLIENTE || '',
    body.USUARIOAPROBO || '',
    body.PLANPAGOSTOMEBAMBA_ID || 0,
    body.APLICACIONORIGEN || '',
    body.COMENTARIOENTREGA || '',
    body.FECHAENTREGA || '',
    body.NOMBREUSUARIOENTREGA || '',
    body.USUARIOENTREGA_ID || 0,
    body.FECHAENTREGASOLICITADA || '',
    body.IDUSUARIOENTREGARA || 0,
    body.NOMBREUSUARIOENTREGARA || '',
    body.COURIER || '',
    body.USUARIOENTREGABODEGA_ID || 0,
    body.checkoutData.warehouse || 0,
    body.PEDIDOCATEGORIAPROPIA || 0,
    body.IMAGENA || '',
    body.IMAGENB || '',
    body.IMAGEN || '',
    body.IMAGENGUIA || '',
    body.FECHAAPROBO || '',
    body.DOCNUM || 0];

// Order Detail - Sql
export const SqlInsertDetailOrder = () => {
    return `INSERT INTO GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL (
      CANTIDAD,
      ESTADO,
      FACTURAID,
      FECHAACTUALIZACION,
      FECHACREACION,
      OBSERVACIONES,
      PRECIOUNITARIOVENTA,
      PRODUCTOID,
      TIPOPRECIO,
      TOTAL,
      USUARIOAACTUALIZACION,
      PRODUCTO_ID,
      COMENTARIOPRECIO,
      COMENTARIOPRODUCTO,
      COMENTARIO,
      COMENTARIOSTOCK,
      EMPRESA,
      ENTREGADO,
      TIENESTOCK,
      NUEVACANTIDAD,
      PRECIOCOSTO,
      URL,
      PROCESADO,
      DISCOUNTPERCENTSAP,
      ID_ORDER
  ) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
  )`;
};
// Order Detail - Params
export const ParamsDetailOrder = (body, lastIdOrder, dateAll) => [
    //Cantidad artículos
    body.quantity || 0,
    body.ESTADO || 0,
    body.FACTURAID || 0,
    body.FECHAACTUALIZACION || '',
    dateAll,
    body.OBSERVACIONES || '',
    body.price.Price || 0.00,
    body.CODIGO || '',
    //Tipo precio SAP
    body.price.PriceList,
    // El total.
    body.subtotal || 0.00,
    body.USUARIOAACTUALIZACION || '',
    // Código del producto
    body.CODIGO || '',
    body.comment || '',
    body.COMENTARIOPRODUCTO || '',
    body.COMENTARIO || '',
    body.COMENTARIOSTOCK || '',
    'LID',
    body.ENTREGADO || false,
    body.TIENESTOCK || 0,
    body.NUEVACANTIDAD || 0,
    body.PRECIOCOSTO || 0.00,
    body.URL || '',
    body.PROCESADO || true,
    body.DISCOUNTPERCENTSAP || 0,
    lastIdOrder];


export const ParamsEnvioDetailOrder = (totalEnvio, ivaEnvio, subTotalEnvio, codProducto, commentEnvio, lastIdOrder, dateAll) => [
    //Cantidad artículos
    1,
    0,
    0,
    '',
    dateAll,
    '',
    subTotalEnvio,
    codProducto,
    '-' || '',
    // El total.
    subTotalEnvio || 0.00,
    '',
    // Código del producto
    codProducto || '',
    commentEnvio,
    '',
    '',
    '',
    'LID',
    false,
    0,
    0,
    0.00,
    '',
    true,
    0,
    lastIdOrder];

//Obtener lista de ordenes por estado
export const SqlGetAllOrders = (status) => `SELECT T0.ID,
       T0.ESTADO,
       T0.FECHACREACION,
       T0.CLIENTEID,
       T1."Nombres",
       T1."Cliente",
       T1."Ciudad",
       T1."Celular",
       T1."Tipo",
       T0.VENDEDOR,
       T3.CITY
FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T0
         INNER JOIN EC_SBO_LIDENAR.WEB_HT_CLIENTES T1 ON T0.CLIENTEID = T1.ID AND T1."Tipo" IN ('Mayoristas', 'Aper') AND T0.ESTADO = ${status}
         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USERS T3 ON T0.VENDEDORID = T3.ID`;

//Obtener lista de ordenes para el área de crédito
export const SqlGetAllOrdersRoleCredit = () => `SELECT T0.ID,
       T0.ESTADO,
       T0.FECHACREACION,
       T0.CLIENTEID,
       T1."Nombres",
       T1."Cliente",
       T1."Ciudad",
       T1."Celular",
       T1."Tipo",
       T0.VENDEDOR,
       T3.CITY,
       T0.BODEGA,
       T0.FORMADEPAGO
FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T0
         INNER JOIN EC_SBO_LIDENAR.WEB_HT_CLIENTES T1 ON T0.CLIENTEID = T1.ID AND T1."Tipo" IN ('Mayoristas', 'Aper') AND T0.ESTADO IN (6, 0, 1, 8)
         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USERS T3 ON T0.VENDEDORID = T3.ID ORDER BY TO_TIMESTAMP(T0.FECHACREACION, 'DD-MM-YYYY HH24:MI:SS') ASC`;

export const SqlGetOrdersAllStatusByVendedor = (idVendedor) => `SELECT T0.ID,
       T0.ESTADO,
       T0.FECHACREACION,
       T0.CLIENTEID,
       T1."Nombres",
       T1."Cliente",
       T1."Ciudad",
       T1."Celular",
       T1."Tipo",
       T0.VENDEDOR,
       T3.CITY
FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T0 
         INNER JOIN EC_SBO_LIDENAR.WEB_HT_CLIENTES T1 ON T0.CLIENTEID = T1.ID AND T1."Tipo" IN ('Mayoristas', 'Aper') AND T0.VENDEDORID = '${idVendedor}'
         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USERS T3 ON T0.VENDEDORID = T3.ID ORDER BY TO_TIMESTAMP(T0.FECHACREACION, 'DD-MM-YYYY HH24:MI:SS') DESC`;

//Bodega unicamente tiene acceso a los pedidos por facturar 0 y facturados 1
export const SqlGetOrdersByWarehouses = (house) => `SELECT T0.ID,
       T0.ESTADO,
       T0.FECHACREACION,
       T0.CLIENTEID,
       T1."Nombres",
       T1."Cliente",
       T1."Ciudad",
       T1."Celular",
       T1."Tipo",
       T0.VENDEDOR,
       T3.CITY,
       T0.DOCNUM
FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T0
         INNER JOIN EC_SBO_LIDENAR.WEB_HT_CLIENTES T1 ON T0.CLIENTEID = T1.ID AND T1."Tipo" IN ('Mayoristas', 'Aper') 
         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USERS T3 ON T0.VENDEDORID = T3.ID AND T0.BODEGA = '${house}' AND T0.ESTADO IN ( 0, 1) ORDER BY TO_TIMESTAMP(T0.FECHACREACION, 'DD-MM-YYYY HH24:MI:SS') ASC`;

export const SqlGetDetailOrder = (idOrder) => `select T0.ID,
       T0.PRODUCTO_ID,
       T1.NOMBRE,
       T0.TIPOPRECIO,
       T0.COMENTARIOPRECIO,
       T0.DISCOUNTPERCENTSAP,
       T0.CANTIDAD,
       T0.PRECIOUNITARIOVENTA,
       T0.TOTAL,
       T0.ID_ORDER
from GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL T0
         LEFT JOIN EC_SBO_LIDENAR.WEB_HT_PRODUCTOS T1 ON T1.CODIGO = T0.PRODUCTO_ID
where ID_ORDER = ${idOrder}`;

export const SqlGetOrderByID = (idOrder) => `SELECT T0.ID,
       T0.ESTADO,
       T0.FECHACREACION,
       T0.CLIENTEID,
       T1."Nombres",
       T1."Cliente",
       T1."Ciudad",
       T1."Celular",
       T1."Tipo",
       T0.VENDEDOR,
       T0.BODEGA,
       T0.FORMADEPAGO,
       T3.CITY
FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T0
         INNER JOIN EC_SBO_LIDENAR.WEB_HT_CLIENTES T1 ON T0.CLIENTEID = T1.ID AND T1."Tipo" IN ('Mayoristas', 'Aper') AND T0.ESTADO = 6 AND T0.ID = ${idOrder}
         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USERS T3 ON T0.VENDEDORID = T3.ID`;


export const SqlGetUser = (idUser) => `SELECT * FROM   GRUPO_EMPRESARIAL_HT.HT_USERS WHERE ID = ${idUser}`;

//Lista de ordenes por el el id orden sin estados del mismo.
export const SqlGetOrderByIDAndAllStatus = (idOrder) => `SELECT T0.ID,
       T0.ESTADO,
       T0.FECHACREACION,
       T0.CLIENTEID,
       T1."Nombres",
       T1."Apellidos",
       T1."Cliente",
       T1."Ciudad",
       T1."Celular",
       T1."Tipo",
       T0.VENDEDOR,
       T0.BODEGA,
       T0.FORMADEPAGO,
       T3.CITY,
       T1.GLN,
       T1."ValidComm",
       T1."Balance",
       T0.OBSERVACIONESB
FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T0
         INNER JOIN EC_SBO_LIDENAR.WEB_HT_CLIENTES T1 ON T0.CLIENTEID = T1.ID AND T1."Tipo" IN ('Mayoristas', 'Aper') AND T0.ID = ${idOrder}
         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USERS T3 ON T0.VENDEDORID = T3.ID`;
