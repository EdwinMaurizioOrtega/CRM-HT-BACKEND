import {consultas} from "../config/HANADB.js";

export const getAllProducts = async (req, res) => {

    //Sin Parametros
    //Creamos la consulta
    const SqlQuery = 'SELECT * FROM EC_SBO_LIDENAR.WEB_HT_PRODUCTOS';

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