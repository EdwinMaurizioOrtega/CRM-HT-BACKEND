import {insertOrder} from "../config/HANADB.js";
import {ParamsOrder, SqlInsertOrder} from "../models/Order.js";


export const CreateOrder = async (req, res) => {
    try {

        // Si no existe el usuario en la DB procedemos a crearlo
        const sql = SqlInsertOrder();
        const params = ParamsOrder(req.body);
        // insertOrder(sql, params, async (err, result) => {
        //         if (err) {
        //             throw err
        //         } else {
        //             console.log(result);
        //             res.send(result);
        //             //console.log(`Se insertaron ${result} filas`);
        //
        //             //Una vez creado con sultamos nuevamente el usuario y enviamos los datos en el response
        //             // const QueryDos = QuerySearch();
        //             // consultas(QueryDos, async (err, result) => {
        //             //         if (err) {
        //             //             throw err
        //             //         } else {
        //             //             const oldUser = await result[0];
        //             //             const accessToken = jwt.sign({userId: oldUser.ID}, JWT_SECRET, {expiresIn: "1h"});
        //             //             res.status(200).json({accessToken, user: oldUser});
        //             //         }
        //             //     }
        //             // )
        //
        //
        //         }
        //     }
        // )


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }
};

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