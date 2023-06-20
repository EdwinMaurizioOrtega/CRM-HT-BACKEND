import {consultas, insertOrder} from "../config/HANADB.js";
import {SqlGetAllOrders, SqlGetDetailOrder, SqlGetOrderByID} from "../models/Order.js";

export const CreateOrder = async (req, res) => {

    const jsonString = JSON.stringify(req.body);
    console.log("Arrive JSON: " + jsonString);

    try {
        // Orden
        insertOrder(req.body, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result);
                    res.status(201).send(result);
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

export const getAllOrders = async (req, res) => {

    try {

        //Sin Parametros
        //Creamos la consulta
        const SqlQuery = SqlGetAllOrders(6)

        //Funcion para enviar sentencias SQL a la DB HANA
        consultas(SqlQuery, (err, result) => {
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
        const SqlQueryOrder = SqlGetOrderByID(id);

// Función para enviar sentencias SQL a la DB HANA
        const executeQuery = (query) => {
            return new Promise((resolve, reject) => {
                consultas(query, (err, result) => {
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
                console.log(resultQuery);
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
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200);
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
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200);
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
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200);
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
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200);
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
        const {ID_ORDER, NEW_WAREHOUSE} = req.body;
        console.log("IdOrden: " + ID_ORDER)

        // //Sentecia actualizar orden
        const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t
                                SET t.BODEGA = ${NEW_WAREHOUSE}
                                WHERE t.ID = ${ID_ORDER};`;

        // //Funcion para enviar sentencias SQL a la DB HANA
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200);
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
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.status(200);
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