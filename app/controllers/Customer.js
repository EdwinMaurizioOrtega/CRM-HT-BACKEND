import {ConParametros, SinParametros} from "../config/HANADB.js";
import {ParamsForManagement, SqlInsertManagement} from "../models/Order.js";
import createFormatDateTime from "../utils/dateFormatter.js";
import hana from "@sap/hana-client";
import {format} from "date-fns";


export const getSearchCustomers = async (req, res) => {

    //Parametro query corresponde al nombre del producto
    const query = req.query.query;
    console.log("Buscar: " + query)

    const cleanQuery = `${query}`.toUpperCase();
    //Creamos la consulta
    // const SqlQuery = 'SELECT *\n' +
    //     'FROM GRUPO_EMPRESARIAL_HT.WEB_HT_PRODUCTOS\n' +
    //     'where "NOMBRE" LIKE \'%' + cleanQuery + '%\';';

    const SqlQuery = `SELECT t.*
                      FROM GRUPO_EMPRESARIAL_HT.WEB_HT_CLIENTES t
                      WHERE UPPER("Cliente") LIKE '%${cleanQuery}%'
                        AND "Tipo" IN ('Mayoristas', 'Aper')
                      ORDER BY "Tipo" DESC`;

    //Funcion para enviar sentencias SQL a la DB HANA
    SinParametros(SqlQuery, (err, result) => {
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

export const getBusinessPartners = async (req, res) => {
    const SqlQuery = `SELECT *
                      FROM GRUPO_EMPRESARIAL_HT.WEB_HT_CLIENTES
                      WHERE "Tipo" LIKE 'Mayoristas'
                      ORDER BY "Cliente" ASC`;
    SinParametros(SqlQuery, (err, result) => {
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


export const CreateManagement = async (req, res) => {

    console.info(req.body);

    const {DATA, CLIENTE_ID, USER_ID} = req.body;

    let guardarAgenda = true;

    //Creamos una nueva instancia de la fecha -_-
    const currentDate = new Date();
    const dateAll = createFormatDateTime(currentDate);

    //Validamos la fecha
    if (DATA.dateManagement == null || DATA.dateManagement == undefined) {
        if (DATA.dato.id == '03') {
            guardarAgenda = false
        } else {
            console.info("La fecha es obligatoria")
        }

    }

    //====== Datos de la gestión.
    // 01 Agendar
    // 02 No le interesa
    // 03 Cierre definitivo
    // 04 No Contactado

    let comentario = '';
    let numeroDiasRegreso = 0

    if (DATA.dato.id == '01') {
        comentario = "Agenda para el " + DATA.dateManagement + " " + DATA.nota
    } else {
        comentario = DATA.dato.label + " " + DATA.nota
        numeroDiasRegreso = 0;
    }


    if (guardarAgenda) {
        // Fecha de inicio
        const fechaInicio = new Date(DATA.dateManagement);
        // Fecha actual (puedes usar new Date() para obtener la fecha actual)
        const fechaActual = new Date();
        // Calcula la diferencia en milisegundos
        const diferenciaMilisegundos = fechaActual - fechaInicio;
        // Convierte la diferencia a días
        const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

        let dias = diferenciaDias;
        if (diferenciaDias >= 0) {
            numeroDiasRegreso = dias;
        } else {
            numeroDiasRegreso = 0;
        }
    }

    //Creamos un objeto
    const Visita = {
        motivo: "Gestion " + DATA.medio.label,
        fechaCreacion: dateAll,
        clienteId: CLIENTE_ID,
        comentario: comentario,
        numeroDiasRegreso: numeroDiasRegreso,
        latitud: 0,
        longitud: 0,
        fechaVisita: dateAll,
        userId: USER_ID,
    }

    console.log("Objeto visita: " + Visita);

    //SECCION GESTIÓN
    const sqlManagement = SqlInsertManagement();

    const paramsManagement = ParamsForManagement(dateAll, CLIENTE_ID, USER_ID, Visita);

    ConParametros(sqlManagement, paramsManagement, (err, result) => {
            if (err) {
                throw err;
                res.status(500).json({
                    message: 'Internal server error',
                });
            } else {
                console.log(result)
                res.status(200).json({
                    message: result,
                })
            }
        }
    )


}

export const getBusinessPartnersByRange = async (req, res) => {

    console.log("ARRIVED: " + req.body);

    const ID_RANGO = req.body.ID_RANGO;

    let query;

    switch (ID_RANGO) {
        case '01':
            query = localClienteList(0, 15);
            break;
        case '02':
            query = localClienteList(16, 30);
            break;
        case '03':
            query = localClienteList(31, 60);
            break;
        case '04':
            query = localClienteList(61, 90);
            break;
        case '05':
            query = localClienteList(91, 180);
            break;
        case '06':
            query = localClienteList(181, 360);
            break;
        case '07':
            query = localClienteList(361, 10000);
            break;
        case '08':
            query = getCLientesSinVisitas();
            break;
        default:
            query = getCLientesSinVisitas();
    }

    console.log(query);

    SinParametros(query, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.status(200).send({
                    "data": result
                })
            }
        }
    )

}


function localClienteList(min, max) {

    const date = format(new Date(), 'dd-MM-yyyy');

    let sql = `SELECT *
               FROM GRUPO_EMPRESARIAL_HT.WEB_HT_CLIENTES AS T0
                        INNER JOIN (SELECT ID, DIAS_DIFFERENCE
                                    FROM (SELECT lc.ID,
                                                 DAYS_BETWEEN(TO_DATE(vi.FECHA_VISITA, 'dd-MM-yyyy HH24:MI:SS'),
                                                              TO_DATE('${date}', 'dd-MM-yyyy')) AS DIAS_DIFFERENCE,
                                                 ROW_NUMBER()                                      OVER (PARTITION BY lc.ID ORDER BY vi.ID DESC) AS NUM_FILA
                                          FROM GRUPO_EMPRESARIAL_HT.WEB_HT_CLIENTES lc
                                                   LEFT JOIN GRUPO_EMPRESARIAL_HT.HT_VISITA vi ON lc.ID = vi.CLIENTE_ID
                                          WHERE "Tipo" LIKE 'Mayoristas') AS Subconsulta
                                    WHERE NUM_FILA = 1) AS T1 ON T0.ID = T1.ID
                   AND T1.DIAS_DIFFERENCE >= ${min}
                   AND T1.DIAS_DIFFERENCE < ${max};`;
    return sql;
}

function getCLientesSinVisitas() {
    let sql = `SELECT *
               FROM GRUPO_EMPRESARIAL_HT.WEB_HT_CLIENTES
               WHERE "Tipo" LIKE 'Mayoristas'
                 AND ID NOT IN (SELECT DISTINCT (CLIENTE_ID) FROM GRUPO_EMPRESARIAL_HT.HT_VISITA)
               ORDER BY "Cliente" ASC;`

    return sql;
}

export const VisitList = async (req, res) => {

    const {ID_CLIENTE} = req.body;

    const query = `SELECT * FROM GRUPO_EMPRESARIAL_HT.HT_VISITA WHERE CLIENTE_ID = '${ID_CLIENTE}' ORDER BY ID DESC`

    SinParametros(query, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.status(200).send({
                    "data": result
                })
            }
        }
    )

}

export const OrdersList = async (req, res) => {

    const {ID_CLIENTE} = req.body;

    const query = `SELECT * FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS WHERE CLIENTEID = '${ID_CLIENTE}' ORDER BY ID DESC;`

    SinParametros(query, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.status(200).send({
                    "data": result
                })
            }
        }
    )

}

export const ByRucCI = async (req, res) => {

    const {CI_RUC, USUARIO_ID} = req.body;
    //Paso 1
    //Creamos una nueva instancia de la fecha -_-
    const currentDate = new Date();
    const dateAll = createFormatDateTime(currentDate);

    const query_save = `insert into GRUPO_EMPRESARIAL_HT.HT_NEW_CI_RUC (FECHA_CREACION, USUARIO_ID, COMENTARIO) values ('${dateAll}', ${USUARIO_ID}, '${CI_RUC}');`;

    SinParametros(query_save, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
            }
        }
    )
    //Paso 2
    const query = `SELECT * FROM GRUPO_EMPRESARIAL_HT.WEB_HT_CLIENTES WHERE ID LIKE '%CL${CI_RUC}' AND "Tipo" LIKE 'Mayoristas'`

    SinParametros(query, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.status(200).send({
                    "data": result
                })
            }
        }
    )

}