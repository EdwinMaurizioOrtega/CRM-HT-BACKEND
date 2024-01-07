import hana from '@sap/hana-client';
import {
    ParamsDetailOrder,
    ParamsEnvioDetailOrder, ParamsManagementForCreateOrder,
    ParamsOrder,
    SqlInsertDetailOrder, SqlInsertManagement,
    SqlInsertOrder
} from "../models/Order.js";
import createFormatDateTime from '../utils/dateFormatter.js';

const dbHost = 'localhost';
//const dbHost = '192.168.0.154';

//SIN PARÁMETROS
export function SinParametros(SqlQuery, callback) {
    console.log("Sentencia Sin Parametros: " + SqlQuery);

    const connParams = {
        serverNode: `${dbHost}:30015`,
        uid: 'SYSTEM',
        pwd: 'B1Admin$'
    };

    const conn = hana.createConnection(connParams);

    conn.connect((err) => {
        if (err) {
            callback(err);
            return;
        }

        conn.exec(SqlQuery, (err, result) => {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }

            conn.disconnect();
        });
    });
}

//CON PARÁMETROS
export function ConParametros(SqlQuery, params, callback) {
    console.log("Sentencia Con Parametros: " + SqlQuery);

    const connParams = {
        serverNode: `${dbHost}:30015`,
        uid: 'SYSTEM',
        pwd: 'B1Admin$'
    };

    const conn = hana.createConnection(connParams);

    conn.connect((err) => {
        if (err) {
            callback(err);
            return;
        }

        conn.exec(SqlQuery, params, (err, result) => {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }

            conn.disconnect();
        });
    });
}

//Exclusivamente para crear las ordenes en la DB HANA
export function insertOrder(body, callback) {

    const connParams = {
        serverNode: `${dbHost}:30015`,
        uid: 'SYSTEM',
        pwd: 'B1Admin$'
    };

    const conn = hana.createConnection(connParams);

    conn.connect((connErr) => {
        if (connErr) {
            console.error('Error al establecer la conexión:', connErr);
            conn.disconnect();
            return;
        }

        console.log('Conexión establecida correctamente');

        //Creamos una nueva instancia de la fecha -_-
        const currentDate = new Date();
        const dateAll = createFormatDateTime(currentDate);

        // ORDEN
        console.info("=============SECCION ORDEN=============")

        const sql = SqlInsertOrder();
        const params = ParamsOrder(body, dateAll);

        // Ejemplo de inserción de datos
        conn.exec(sql, params, (insertErr, affectedRows) => {
            if (insertErr) {
                console.error('Error al insertar datos |ORDEN|: ', insertErr);
                conn.disconnect();
                return;
            }

            console.log('Filas afectadas por la inserción:', affectedRows);

            // Consulta adicional para obtener la última ORDEN
            conn.exec(`SELECT U.* FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS AS U JOIN (SELECT CURRENT_IDENTITY_VALUE() AS ID FROM DUMMY) AS I ON U.ID = I.ID`, (err, rows) => {
                if (err) {
                    console.error('Error al obtener la última |ORDEN|: ', err);
                    conn.disconnect();
                    callback(err);
                    return;
                }

                const lastIdOrder = rows[0].ID;

                // DETALLE ORDEN
                console.info("=============SECCION DETALLE ORDEN=============")

                const cart = body.checkoutData.cart;
                //let formaPago = body.checkoutData.method;
                const lengthCart = cart.length;
                console.log(lengthCart);
                let processedCount = 0;

                const processDetailOrder = (index) => {
                    if (index >= lengthCart) {
                        callback(null, "Orden creada.");
                        conn.disconnect();
                        return;
                    }

                    const item = cart[index];
                    const sqlDetalle = SqlInsertDetailOrder();
                    const paramsDetalle = ParamsDetailOrder(item, lastIdOrder, dateAll);

                    // Ejemplo de inserción de datos detalle orden
                    conn.exec(sqlDetalle, paramsDetalle, (insertErr, affectedRows) => {
                        if (insertErr) {
                            console.error('Error al insertar datos |DETALLE ORDEN|:', insertErr);
                            conn.disconnect();
                            callback(insertErr);
                            return;
                        }

                        console.log('Filas afectadas por la inserción:', affectedRows);
                        processedCount++;
                        if (processedCount === lengthCart) {
                            callback(null, "Orden creada.");
                            conn.disconnect();
                        } else {
                            processDetailOrder(index + 1);
                        }
                    });
                };

                processDetailOrder(0);

                //SECCION ENVIO
                const sqlEnvio = SqlInsertDetailOrder();
                // Valor del envío
                let totalEnvio = body.checkoutData.shipping;
                let commentEnvio = body.checkoutData.comment;
                let ivaEnvio = 0
                let subTotalEnvio =0
                let codProducto = ''

                switch (totalEnvio) {
                    case 0:
                        ivaEnvio;
                        subTotalEnvio;
                        codProducto = '06.04.15';
                        break;
                    case 3:
                        ivaEnvio = totalEnvio * 0.107142857142857;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.16';
                        break;
                    case 5:
                        ivaEnvio = totalEnvio * 0.107142857142857;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.17';
                        break;
                    case 7:
                        ivaEnvio = totalEnvio * 0.107142857142857;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.18';
                        break;
                    case 13:
                        ivaEnvio = totalEnvio * 0.107142857142857;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.19';
                        break;
                    default:
                        ivaEnvio;
                        subTotalEnvio;
                        codProducto;
                }

                const paramsEnvio = ParamsEnvioDetailOrder(totalEnvio, ivaEnvio, subTotalEnvio, codProducto, commentEnvio, lastIdOrder, dateAll);

                // Ejemplo de inserción de datos de envio
                conn.exec(sqlEnvio, paramsEnvio, (insertErr, affectedRows) => {
                    if (insertErr) {
                        console.error('Error al insertar datos |ENVIO|: ', insertErr);
                        conn.disconnect();
                        callback(insertErr);
                        return;
                    }
                    console.log('Filas afectadas por la inserción:', affectedRows);

                });

            });
        });

        // //SECCION GESTIÓN
        // console.info("=============SECCION GESTIÓN=============")
        // const sqlManagement = SqlInsertManagement();
        //
        // //ID del cliente
        // const CLIENTE_ID = body.checkoutData.billing.ID;
        // //ID del vendedor
        // const VENDEDOR_ID = body.checkoutUser.ID;
        //
        // const paramsManagement = ParamsManagementForCreateOrder(dateAll, CLIENTE_ID, VENDEDOR_ID);
        //
        // // Ejemplo de inserción de datos de envio
        // conn.exec(sqlManagement, paramsManagement, (insertErr, affectedRows) => {
        //     if (insertErr) {
        //         console.error('Error al insertar datos |GESTIÓN|: ', insertErr);
        //         conn.disconnect();
        //         callback(insertErr);
        //         return;
        //     }
        //     console.log('Filas afectadas por la inserción:', affectedRows);

        // });
    });
}