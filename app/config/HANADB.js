import hana from '@sap/hana-client';
import {
    ParamsDetailOrder,
    ParamsEnvioDetailOrder,
    ParamsOrder,
    SqlInsertDetailOrder,
    SqlInsertOrder
} from "../models/Order.js";

export function consultas(SqlQuery, callback) {
    console.log("Sentencia: " + SqlQuery);

    const connParams = {
        serverNode: '192.168.0.154:30015',
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

export function insertOrder(body, callback) {
    const connParams = {
        serverNode: '192.168.0.154:30015',
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

        const sql = SqlInsertOrder();
        const params = ParamsOrder(body);

        // Ejemplo de inserción de datos
        conn.exec(sql, params, (insertErr, affectedRows) => {
            if (insertErr) {
                console.error('Error al insertar datos:', insertErr);
                conn.disconnect();
                return;
            }

            console.log('Filas afectadas por la inserción:', affectedRows);

            // Consulta adicional para obtener la última ORDEN
            conn.exec(`SELECT U.* FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS AS U JOIN (SELECT CURRENT_IDENTITY_VALUE() AS ID FROM DUMMY) AS I ON U.ID = I.ID`, (err, rows) => {
                if (err) {
                    console.error('Error al obtener la última ORDEN:', err);
                    conn.disconnect();
                    callback(err);
                    return;
                }

                const lastIdOrder = rows[0].ID;

                // DETALLE ORDEN
                const cart = body.checkoutData.cart;
                let formaPago = body.checkoutData.method;
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
                    const paramsDetalle = ParamsDetailOrder(item, formaPago, lastIdOrder);

                    // Ejemplo de inserción de datos detalle orden
                    conn.exec(sqlDetalle, paramsDetalle, (insertErr, affectedRows) => {
                        if (insertErr) {
                            console.error('Error al insertar datos:', insertErr);
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

                let totalEnvio = body.checkoutData.shipping;
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
                        ivaEnvio = totalEnvio * 0.12;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.16';
                        break;
                    case 5:
                        ivaEnvio = totalEnvio * 0.12;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.17';
                        break;
                    case 7:
                        ivaEnvio = totalEnvio * 0.12;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.18';
                        break;
                    case 13:
                        ivaEnvio = totalEnvio * 0.12;
                        subTotalEnvio = totalEnvio - ivaEnvio;
                        codProducto = '06.04.19';
                        break;
                    default:
                        ivaEnvio;
                        subTotalEnvio;
                        codProducto;
                }

                const paramsEnvio = ParamsEnvioDetailOrder(totalEnvio, ivaEnvio, subTotalEnvio, codProducto, formaPago, lastIdOrder);

                // Ejemplo de inserción de datos de envio
                conn.exec(sqlEnvio, paramsEnvio, (insertErr, affectedRows) => {
                    if (insertErr) {
                        console.error('Error al insertar datos:', insertErr);
                        conn.disconnect();
                        callback(insertErr);
                        return;
                    }
                    console.log('Filas afectadas por la inserción:', affectedRows);

                });



            });
        });
    });
}