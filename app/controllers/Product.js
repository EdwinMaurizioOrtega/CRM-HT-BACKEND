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



export const CreateCatalogo = async (req, res) => {

    //Lo que llega.
    const TipoPrecio = req.body.singleSelectTP;
    const Bodegas = req.body.multiSelectB;
    const Categorias = req.body.multiSelectC;
    const Marcas = req.body.multiSelectM;

    console.log("Bodegas: " + Bodegas);
    // Convertir el array en una cadena SQL
    const sqlQuery = Bodegas.map((bodega) => `SELECT '${bodega}' AS WH FROM DUMMY`).join('\nUNION ALL\n');
    console.log(sqlQuery);

// Convierte el array en una cadena de valores separados por comas y comillas simples
    const categoriasString = `'${Categorias.join("', '")}'`;
    console.log(categoriasString);

    // Convierte el array en una cadena de valores separados por comas
    const marcasString = `'${Marcas.join("', '")}'`;
    console.log(marcasString);


    try {

        //Para revisar la sentencia ejem
        // SELECT '019' AS WH
        // FROM DUMMY
        // UNION ALL
        // SELECT '002'
        // FROM DUMMY
        // UNION ALL
        // SELECT '006'
        // FROM DUMMY
        // UNION ALL
        // SELECT '015'
        // FROM DUMMY
        // UNION ALL
        // SELECT '024'
        // FROM DUMMY

        const SqlQuery = `WITH ListaWarehouse AS (${sqlQuery})

SELECT T11.*, T12.*, T13."U_SYP_GRUPO" AS "MARCA", T13."ItmsGrpCod" AS "CATEGORIA", T13."validFor" AS "STATUS"
FROM (SELECT "CODIGO",
             "NOMBRE",
             SUM("CANTIDAD") AS "CANTIDAD",
             CASE
                 WHEN SUM("CANTIDAD") BETWEEN 1 AND 9 THEN '+1' -- Alias: "+1"
                 WHEN SUM("CANTIDAD") BETWEEN 10 AND 49 THEN '+10' -- Alias: "+10"
                 WHEN SUM("CANTIDAD") > 50 THEN '+50' -- Alias: "+50"
                 ELSE NULL -- Otra condición
                 END         AS "CANTIDAD_ALIAS"
      FROM (SELECT T1."ItemCode"       AS "CODIGO",
                   T1."Dscription"                            AS "NOMBRE",
                   COALESCE(SUM(T1."InQty" - T1."OutQty"), 0) AS "CANTIDAD"
            FROM ListaWarehouse L
                     LEFT JOIN EC_SBO_LIDENAR.OINM T1 ON L.WH = T1."Warehouse"
            GROUP BY L.WH, T1."ItemCode", T1."Dscription") AS Subconsulta
      GROUP BY "CODIGO", "NOMBRE") AS T11
         INNER JOIN (SELECT Subconsulta.*
                     FROM (SELECT T0."ItemCode",
                                  T0."PriceList",
                                  T1."ListName",
                                  CAST(T0."Price" AS DECIMAL(18, 2)) AS "Price"
                           FROM EC_SBO_LIDENAR.ITM1 T0
                                    INNER JOIN EC_SBO_LIDENAR.OPLN T1
                                               ON T1."ListNum" = T0."PriceList"
                           UNION
                           SELECT T2."ItemCode",
                                  CAST(0 AS INTEGER)             AS "PriceList",
                                  CAST('COSTO' AS NVARCHAR(255)) AS "ListName",
                                  CAST(T2."AvgPrice" AS DECIMAL(18, 2)) AS "Price"
                           FROM EC_SBO_LIDENAR.OITM T2
                           ) AS Subconsulta
                     WHERE Subconsulta."PriceList" = ${TipoPrecio}) AS T12 ON T11.CODIGO = T12."ItemCode"
         INNER JOIN EC_SBO_LIDENAR.OITM AS T13 ON T12."ItemCode" = T13."ItemCode" AND T13."U_SYP_GRUPO" IN (${marcasString}) AND
                                   T13."ItmsGrpCod" IN (${categoriasString}) AND T13."validFor" = 'Y' AND T11.CANTIDAD > 0`;

        //Funcion para enviar sentencias SQL a la DB HANA
        consultas(SqlQuery, (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    res.send({
                        "catalogo": result
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
