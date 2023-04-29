import {consultas} from '../config/HANADB.js'

export const getSociosNegocio = async (req, res) => {

    //Parametros
    const cedularuc = req.query.cedularuc;
    console.log("Go " + cedularuc)

    //Creamos la consulta de Datos Maestros Socios De Negocios
    const SqlQuery = 'SELECT *\n' +
        'FROM (SELECT T0."CardCode",\n' +
        '             T0."LicTradNum",\n' +
        '             T0."CardName",\n' +
        '             T0."Cellular",\n' +
        '             T0."E_Mail",\n' +
        '             T0."GroupNum",\n' +
        '             T1."PymntGroup",\n' +
        '             T0."U_SYP_BPTD",\n' +
        '             T0."CreditLine",\n' +
        '             T0."GroupCode",\n' +
        '             T2."GroupName",\n' +
        '             T0."Balance",\n' +
        '             T3."ZipCode",\n' +
        '             T3."Street",\n' +
        '             T3."County",\n' +
        '             T3."City",\n' +
        '             T3."U_SYP_PARROQ",\n' +
        '             T0."SlpCode",\n' +
        '             T4."SlpName"\n' +
        '      FROM EC_SBO_LIDENAR.OCRD T0\n' +
        '               INNER JOIN EC_SBO_LIDENAR.OCTG T1 ON T0."GroupNum" = T1."GroupNum"\n' +
        '               INNER JOIN EC_SBO_LIDENAR.OCRG T2 ON T2."GroupCode" = T0."GroupCode"\n' +
        '               INNER JOIN EC_SBO_LIDENAR.CRD1 T3 ON T3."CardCode" = T0."CardCode" AND T3."LineNum" = 0\n' +
        '               INNER JOIN EC_SBO_LIDENAR.OSLP T4 ON T4."SlpCode" = T0."SlpCode") T5\n' +
        'WHERE T5."CardCode" LIKE \''+cedularuc+'\'';

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

};


export const getCondicionPago = async (req, res) => {
    //Con
    const SqlQuery = 'SELECT T0.* FROM EC_SBO_LIDENAR.OCTG T0';

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
