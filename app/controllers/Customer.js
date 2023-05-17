import {consultas} from "../config/HANADB.js";


export const getSearchCustomers = async (req, res) => {

    //Parametro query corresponde al nombre del producto
    const query = req.query.query;
    console.log("Buscar: " + query)

    const cleanQuery = `${query}`.toUpperCase().trim();
    //Creamos la consulta
    // const SqlQuery = 'SELECT *\n' +
    //     'FROM EC_SBO_LIDENAR.WEB_HT_PRODUCTOS\n' +
    //     'where "NOMBRE" LIKE \'%' + cleanQuery + '%\';';

    const SqlQuery = `SELECT t.*
        FROM EC_SBO_LIDENAR.WEB_HT_CLIENTES t
        WHERE "Cliente" like '%${cleanQuery}%' and "Tipo" = 'Mayoristas'
        ORDER BY "Tipo" DESC`;

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