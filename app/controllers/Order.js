import {consultas, insertOrder} from "../config/HANADB.js";
import {ParamsOrder, SqlGetAllOrders, SqlInsertOrder} from "../models/Order.js";

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


}

// CREATE TABLE GRUPO_EMPRESARIAL_HT.ht_orders
// (
//     id                        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
//     clienteid                 INTEGER,
//     estado                    INTEGER,
//     fecha                     NVARCHAR(255),
//     fechaactualizacion        NVARCHAR(255),
//     fechacreacion             NVARCHAR(255),
//     formadepago               NVARCHAR(255),
//     guardado                  INTEGER,
//     hora                      NVARCHAR(255),
//     latitud                   DOUBLE PRECISION,
//     longitud                  DOUBLE PRECISION,
//     observaciones             NVARCHAR(255),
//     online                    BOOLEAN DEFAULT TRUE                             NOT NULL,
//     subtotal                  DOUBLE PRECISION,
//     total                     DOUBLE PRECISION,
//     totaliva                  DOUBLE PRECISION,
//     usuarioaactualizacion     NVARCHAR(255),
//     vendedor                  NVARCHAR(255),
//     vendedorid                INTEGER,
//     localcliente_id           BIGINT,
//     empresa                   NVARCHAR(255),
//     fechafacturacion          NVARCHAR(255),
//     numerofacturae4           NVARCHAR(255),
//     numerofacturahipertronics NVARCHAR(255),
//     numerofacturalidenar      NVARCHAR(255),
//     numeroguia                NVARCHAR(255),
//     observacionesb            NVARCHAR(255),
//     notacliente               NVARCHAR(255),
//     usuarioaprobo             NVARCHAR(255),
//     planpagostomebamba_id     BIGINT,
//     aplicacionorigen          NVARCHAR(255),
//     comentarioentrega         NVARCHAR(255),
//     fechaentrega              NVARCHAR(255),
//     nombreusuarioentrega      NVARCHAR(255),
//     usuarioentrega_id         BIGINT,
//     fechaentregasolicitada    NVARCHAR(255),
//     idusuarioentregara        INTEGER,
//     nombreusuarioentregara    NVARCHAR(255),
//     courier                   NVARCHAR(255),
//     usuarioentregabodega_id   BIGINT,
//     bodega                    INTEGER,
//     pedidocategoriapropia     INTEGER,
//     imagena                   NVARCHAR(255),
//     imagenb                   NVARCHAR(255),
//     imagen                    NVARCHAR(255),
//     imagenguia                NVARCHAR(255),
//     fechaaprobo               NVARCHAR(255),
//     docnum                    INTEGER
// );