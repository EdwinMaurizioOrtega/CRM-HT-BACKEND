import {SinParametros, insertOrder} from "../config/HANADB.js";
import {
    SqlGetAllOrders, SqlGetAllOrdersRoleCredit,
    SqlGetDetailOrder,
    SqlGetOrderByID, SqlGetOrderByIDAndAllStatus,
    SqlGetOrdersAllStatusByVendedor,
    SqlGetOrdersByWarehouses
} from "../models/Order.js";
import createFormatDateTime from "../utils/dateFormatter.js";

export const CreateOrder = async (req, res) => {

    const jsonString = JSON.stringify(req.body);
    console.log("Arrive JSON: " + jsonString);

    try {
        // Orden
        insertOrder(req.body, async (err, result) => {
                if (err) {
                    throw err
                    console.error("Some error occurred: "+err);
                } else {
                    console.log(result);
                    res.status(201).send(result);
                }
            }
        )


    } catch (error) {
        console.error("Some error occurred: "+error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }
};

// Ordenes por estado estado individual
export const getAllOrders = async (req, res) => {

    const estado = req.query.estado;

    try {

        //Sin Parametros
        //Creamos la consulta
        const SqlQuery = SqlGetAllOrders(estado)

        //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.send({
                        "orders": result
                    })
                }
            }
        )


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }


};


// Ordenes con todos los estados para el área de crédito
export const getAllOrdersRoleCredit = async (req, res) => {

    try {

        //Sin Parametros
        //Creamos la consulta
        const SqlQuery = SqlGetAllOrdersRoleCredit()

        //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.send({
                        "orders": result
                    })
                }
            }
        )


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }


};

// Ordenes con todos los estados, para los vendedores
export const getOrdersAllStatusByVendedor = async (req, res) => {

    const idVendedor = req.query.ven;

    try {

        //Sin Parametros
        //Creamos la consulta
        const SqlQuery = SqlGetOrdersAllStatusByVendedor(idVendedor);

        //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.send({
                        "orders": result
                    })
                }
            }
        )


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }


};


// Ordenes pendientes de factura por número de bodega con estado 0 y los facturados 1
export const getOrdersByWarehouse = async (req, res) => {

    const house = req.query.bod;

    try {

        //Sin Parametros
        //Creamos la consulta
        const SqlQuery = SqlGetOrdersByWarehouses(house);

        //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.send({
                        "orders": result
                    })
                }
            }
        )


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }


};

export const getDetailOrder = async (req, res) => {

    try {
// Parametro id corresponde a codigo
        const id = req.query.id;
        console.log("Order No.: " + id);

        // Consultas:

        //Dettale de la orden -_-.
        const SqlQuery = SqlGetDetailOrder(id);
        //Orden -_-
        const SqlQueryOrder = SqlGetOrderByIDAndAllStatus(id);

// Función para enviar sentencias SQL a la DB HANA
        const executeQuery = (query) => {
            return new Promise((resolve, reject) => {
                SinParametros(query, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        };

// Ejecutar las consultas y combinar los resultados
        Promise.all([executeQuery(SqlQuery), executeQuery(SqlQueryOrder)])
            .then(([resultQuery, resultQueryOrder]) => {
                // Detalle
                console.log(resultQuery);
                // Orden
                console.log(resultQueryOrder);

                res.send({
                    data: {
                        ...resultQueryOrder[0], // Agregar todos los valores de resultQueryOrder en la raíz de data
                        items: resultQuery,
                    },
                });
            })
            .catch((err) => {
                throw err;
            });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }


}

export const putDetailOrderPriceUnit = async (req, res) => {

    try {

        //Parametro que llegan en el body
        const {ID_DETALLE_ORDEN, NEW_PRICE_UNIT} = req.body;
        console.log("IdDettaleOrden: " + ID_DETALLE_ORDEN)

        // //Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL t
                                SET t.PRECIOUNITARIOVENTA = ${NEW_PRICE_UNIT}
                                WHERE t.ID = ${ID_DETALLE_ORDEN}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}


export const putDetailOrderQuantity = async (req, res) => {

    try {

        //Parametro que llegan en el body
        const {ID_DETALLE_ORDEN, NEW_QUANTITY} = req.body;
        console.log("IdDettaleOrden: " + ID_DETALLE_ORDEN)

        // //Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL t
                                SET t.CANTIDAD = ${NEW_QUANTITY}
                                WHERE t.ID = ${ID_DETALLE_ORDEN}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}


export const putDetailOrderDiscount = async (req, res) => {

    try {

        //Parametro que llegan en el body
        const {ID_DETALLE_ORDEN, NEW_DISCOUNT} = req.body;
        console.log("IdDettaleOrden: " + ID_DETALLE_ORDEN)

        // //Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL t
                                    SET t.DISCOUNTPERCENTSAP = ${NEW_DISCOUNT}
                                    WHERE t.ID = ${ID_DETALLE_ORDEN}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}


export const putDetailOrderDelete = async (req, res) => {

    try {

        //Parametro name corresponde a codigo
        const id = req.query.ID;
        console.log("userId: " + id)

        // //Sentecia consultar el usuario
        const SqlQuery = `DELETE
                                FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL
                                WHERE ID = ${id}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}

//Anular orden
export const putOrderAnular = async (req, res) => {

    try {

        //Parametro name corresponde a codigo
        const { ID_ORDER, OBSERVACION_ANULACION, ID_USER } = req.body.params;
        console.log("ID_ORDER: " + ID_ORDER)
        console.log("OBSERVACION_ANULACION: " + OBSERVACION_ANULACION)
        console.log("ID_USER: " + ID_USER)

        const currentDate = new Date();
        const dateAll = createFormatDateTime(currentDate);

        //Sentecia consultar el usuario
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t 
                                    SET t.ESTADO = 8, 
                                    t.OBSERVACION_ANULACION = '${OBSERVACION_ANULACION}', 
                                    t.USER_ANULACION = ${ID_USER}, 
                                    t.FECHA_ANULACION = '${dateAll}' 
                                    WHERE t.ID = ${ID_ORDER}`;

        console.log("Anular SqlQuery: "+ SqlQuery);

        //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}

//Recuperar pedido cuando se encuentre en estado anulado.
//Retornar pedido desde bodega a cartera
export const putOrderToBag = async (req, res) => {

    try {

        //Parametro name corresponde a codigo
        const { ID_ORDER } = req.body.params;
        console.log("ID_ORDER: " + ID_ORDER)

        // //Sentecia consultar el usuario
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t 
                                    SET t.ESTADO = 6
                                    WHERE t.ID = ${ID_ORDER}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}

export const putChangeWarehouse = async (req, res) => {

    try {

        //Parametro que llegan en el body
        const {ID_ORDER, NEW_WAREHOUSE, ID_USER} = req.body;
        console.log("IdOrden: " + ID_ORDER)

        const currentDate = new Date();
        const dateAll = createFormatDateTime(currentDate);

        // //Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t
                                SET t.BODEGA = ${NEW_WAREHOUSE},
                                 t.USER_CAMBIO_BODEGA = ${ID_USER},
                                 t.FECHA_CAMBIO_BODEGA = '${dateAll}'
                                WHERE t.ID = ${ID_ORDER};`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}


export const putChangePayment = async (req, res) => {

    try {

        //Parametro que llegan en el body
        const {ID_ORDER, NEW_PAYMENT} = req.body;
        console.log("IdOrden: " + ID_ORDER)

        // //Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t
                                    SET t.FORMADEPAGO = '${NEW_PAYMENT}'
                                    WHERE t.ID = ${ID_ORDER};`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden actualizada correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}

export const putFacturar = async (req, res) => {

    try {

        const currentDate = new Date();
        const dateAll = createFormatDateTime(currentDate);

        //Parametro que llegan en el body
        const {ID_ORDER, NUMERO_FACTURA, NUMERO_GUIA} = req.body;
        console.log("IdOrden: " + ID_ORDER)

        // Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t
                                    SET t.ESTADO               = 1,
                                    t.FECHAFACTURACION     = '${dateAll}',
                                    t.NUMEROFACTURALIDENAR = '${NUMERO_FACTURA}',
                                    t.NUMEROGUIA           = '${NUMERO_GUIA}'
                                WHERE t.ID = ${ID_ORDER}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({
                        message: 'Factura guardada correctamente.',
                    });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}

//Imprimir orden bodega
export const putOrderImprimir = async (req, res) => {

    try {

        //Parametro name corresponde a codigo
        const { ID } = req.body.params;
        console.log("idOrder: " + ID)

        const currentDate = new Date();
        const dateAll = createFormatDateTime(currentDate);

        // //Sentecia consultar el usuario
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t SET t.FECHA_IMPRESION = '${dateAll}' WHERE t.ID = ${ID}`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        SinParametros(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200).json({ message: 'Orden impresa correctamente.' });
                }
            }
        )

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

}