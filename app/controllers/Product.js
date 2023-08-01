import {consultas} from "../config/HANADB.js";

export const getAllProducts = async (req, res) => {

    //Sin Parametros
    //Creamos la consulta
    const SqlQuery = `SELECT * FROM EC_SBO_LIDENAR.WEB_HT_PRODUCTOS WHERE STATUS = 'Y'`;

    //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.send({
                    "products": result
                })
            }
        }
    )

}


export const getProduct = async (req, res) => {

    //Parametro name corresponde a codigo
    const name = req.query.name;
    console.log("Go " + name)
    //Creamos la consulta
    const SqlQuery = 'SELECT *\n' +
        'FROM EC_SBO_LIDENAR.WEB_HT_PRODUCTOS\n' +
        'where "CODIGO" = \'' + name + '\';';

    //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.send({
                    "product": result[0]
                })
            }
        }
    )

}

export const getStockProduct = async (req, res) => {

    //Parametro name corresponde a codigo
    const code = req.query.code;
    console.log("Go " + code)
    //Creamos la consulta
    const SqlQuery = `WITH ListaWarehouse AS (SELECT '019' AS WH
                        FROM DUMMY
                        UNION ALL
                        SELECT '002'
                        FROM DUMMY
                        UNION ALL
                        SELECT '006'
                        FROM DUMMY
                        UNION ALL
                        SELECT '015'
                        FROM DUMMY
                        UNION ALL
                        SELECT '024'
                        FROM DUMMY
                        UNION ALL
                        SELECT '009'
                        FROM DUMMY
                        UNION ALL
                        SELECT '014'
                        FROM DUMMY
                        UNION ALL
                        SELECT '001'
                        FROM DUMMY
                        UNION ALL
                        SELECT '011'
                        FROM DUMMY
                        UNION ALL
                        SELECT '016'
                        FROM DUMMY
                        UNION ALL
                        SELECT '017'
                        FROM DUMMY
                        UNION ALL
                        SELECT '020'
                        FROM DUMMY
                        UNION ALL
                        SELECT '022'
                        FROM DUMMY
                        UNION ALL
                        SELECT '003'
                        FROM DUMMY)
SELECT L.WH                                       AS "BODEGA",
       COALESCE(T1."ItemCode", '${code}')        AS "CODIGO",
       COALESCE(SUM(T1."InQty" - T1."OutQty"), 0) AS "CANTIDAD",
       COALESCE(T5."RESERVADO", 0) AS "RESERVADO",
        (COALESCE(SUM(T1."InQty" - T1."OutQty"), 0) - COALESCE(T5."RESERVADO", 0)) AS "DISPONIBLE"

FROM ListaWarehouse L
         LEFT JOIN
    EC_SBO_LIDENAR.OINM T1 ON L.WH = T1."Warehouse" AND T1."ItemCode" LIKE '${code}'
LEFT JOIN
    (SELECT T4.PRODUCTO_ID, SUM(T4.CANTIDAD) AS "RESERVADO", T3.BODEGA
    FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS T3
    INNER JOIN GRUPO_EMPRESARIAL_HT.HT_ORDERS_DETAIL T4 ON T4.ID_ORDER = T3.ID AND T3.ESTADO IN (6, 0) AND T4.PRODUCTO_ID LIKE '${code}'
    GROUP BY T3.BODEGA, T4.PRODUCTO_ID) T5 ON T5.PRODUCTO_ID = COALESCE(T1."ItemCode", '${code}')
AND T5.BODEGA = T1."Warehouse"
GROUP BY L.WH, T1."ItemCode",T5."RESERVADO"`;

    //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.send({
                    "product_stock": result
                })
            }
        }
    )

}

export const getSearchProducts = async (req, res) => {

    //Parametro query corresponde al nombre del producto
    const query = req.query.query;
    console.log("Buscar: " + query)

    const cleanQuery = `${query}`.toUpperCase().trim();
    //Creamos la consulta
    const SqlQuery = 'SELECT *\n' +
        'FROM EC_SBO_LIDENAR.WEB_HT_PRODUCTOS\n' +
        'where "NOMBRE" LIKE \'%' + cleanQuery + '%\';';

    //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, (err, result) => {
            // if (err) {
            //     throw err
            // } else {
            //     console.log(result)
            //     res.status(200).send({
            //         "results": result
            //     })
            // }
            try {
                console.log(result);
                res.status(200).send({
                    "results": result
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({
                    message: 'Internal server error',
                });
            }
        }
    )

}


export const getListPriceByCodeAndUser = async (req, res) => {

    //Parametros
    const ItemCode = req.query.name;
    const IdUser = req.query.idUser;
    console.log("ItemCode: " + ItemCode + " IdUser: "+IdUser)

    //Creamos la consulta de Datos Maestros Socios De Negocios
    //const SqlQuery = 'SELECT * FROM EC_SBO_LIDENAR.WEB_HT_PRECIOS T0 WHERE T0."ItemCode" = \'' + ItemCode + '\';';

    const SqlQuery = 'SELECT *\n' +
        'FROM EC_SBO_LIDENAR.WEB_HT_PRECIOS T0\n' +
        '         INNER JOIN GRUPO_EMPRESARIAL_HT.HT_USER_PRICE T1 ON T1.PRICE = T0."PriceList"\n' +
        'AND T0."ItemCode" = \'' + ItemCode + '\' AND T1.USER = \'' + IdUser + '\';'

    //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.send({
                    "data": result
                })
            }
        }
    )


}