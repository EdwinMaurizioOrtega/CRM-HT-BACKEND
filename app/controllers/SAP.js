import axios from "axios";
import * as https from "https";
import {format} from "date-fns";
import {SqlGetDetailOrder, SqlGetOrderByID, SqlGetUser} from "../models/Order.js";
import {consultas} from "../config/HANADB.js";


const dateAll = format(new Date(), 'yyyy-MM-dd');

export const CreateInvoiceSAP = async (req, res) => {

    console.log("JSON Crear Orden SAP: " + req.body);

    try {
        //Lo que llega.
        const ID_ORDER = req.body.ID_ORDER;
        const ID_USER = req.body.ID_USER;

        // Consultas:
        //Dettale de la orden -_-.
        const SqlQuery = SqlGetDetailOrder(ID_ORDER);
        //Orden -_-
        const SqlQueryOrder = SqlGetOrderByID(ID_ORDER);
        //Usuario
        const SqlUserQuery = SqlGetUser(ID_USER);

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
        Promise.all([executeQuery(SqlQuery), executeQuery(SqlQueryOrder), executeQuery(SqlUserQuery)])
            .then(([resultQuery, resultQueryOrder, resultQueryUser]) => {

                //Orden
                console.log(resultQueryOrder[0]);
                //Detalle de la orden
                console.log(resultQuery);
                //Usuario
                console.log(resultQueryUser[0])

                let answer = CrearOrdenServiceLayer(resultQueryOrder[0], resultQuery, resultQueryUser[0])

                res.status(200).json({answer: answer});

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


};


async function CrearOrdenServiceLayer(orden, detalle, usuario) {

    console.log(orden);
    console.log(detalle);
    console.log(usuario);

    try {

        const IdOrder = orden.ID;
        //const CardCode = `CL${orden.CLIENTEID}`;
        const CardCode = orden.CLIENTEID;
        const PaymentGroupCode = orden.FORMADEPAGO;
        const WarehouseCode = orden.BODEGA;

        //Nombre usuario:
        const displayname = usuario.DISPLAYNAME;


        //Creacion de una orden en una base datos.

        let the_token;

        const the_url = 'https://192.168.0.154:50000/b1s/v1/Login';
        const requestBody = {
            CompanyDB: 'EC_SBO_LIDENAR',
            Password: '1234',
            UserName: 'integracion'
        };

        const axiosConfig = {
            httpsAgent: new https.Agent({rejectUnauthorized: false})
        };


        //Obtenemos el TOKEN
        const response = await axios.post(the_url, requestBody, axiosConfig);
        const data = response.data;
        the_token = data.SessionId;
        console.log('TOKEN SESION:', response.status);

        //Verificamos la existencia del Cliente en el SAP
        const businessPartnersUrl = `https://192.168.0.154:50000/b1s/v1/BusinessPartners('${CardCode}')`;
        const webTarget = axios.create({
            baseURL: businessPartnersUrl,
            httpsAgent: new https.Agent({rejectUnauthorized: false}),
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `B1SESSION=${the_token}; ROUTEID=.node3`
            }
        });

        webTarget.get()
            .then(response => {
                const statusBusinessPartners = response.status;
                console.log("EXISTE EL CLIENTE..?: " + statusBusinessPartners);

                if (statusBusinessPartners === 200) {
                    // Mostrar mensaje en la consola
                    const notification = "CLIENTE EXISTE EN EL SISTEMA SAP!";
                    console.log(notification);

                    const data = response.data;
                    const PayTermsGrpCode = data.PayTermsGrpCode;
                    const SalesPersonCode = data.SalesPersonCode;

                    // Crear orden de venta en HANA SAP
                    const orderUrl = 'https://192.168.0.154:50000/b1s/v1/Orders';
                    const webTargetDos = axios.create({
                        baseURL: orderUrl,
                        httpsAgent: new https.Agent({rejectUnauthorized: false}),
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': `B1SESSION=${the_token}; ROUTEID=.node3`
                        }
                    });

                    const cliente = {
                        // CL - Cédula || PL - RUC || CE - Cliente Externo ==> Extrae del CRM
                        CardCode: CardCode,
                        // Fecha de creaión de la orden de venta.
                        DocDueDate: dateAll,
                        //Enviamos el ID de la condicion de pago de la orden
                        //PaymentGroupCode: SelectedCondicionPago || PayTermsGrpCode,
                        PaymentGroupCode: PaymentGroupCode,
                        //Empledo de ventas SAP - 17 David Granda
                        SalesPersonCode: SalesPersonCode,
                        //FormaPago
                        U_SYP_FORMAP: 20,
                        //FormaPago 2
                        U_SYP_FORMAPAGO2: 20,

                        //Artículos - detalle de la orden
                        DocumentLines: [],
                    };

                    // Detalles de la orden de venta
                    let counter = 0;
                    for (const detallePedido of detalle) {
                        const item = {
                            LineNum: counter++,
                            ItemCode: detallePedido.PRODUCTO_ID,
                            Quantity: detallePedido.CANTIDAD,
                            DiscountPercent: detallePedido.DISCOUNTPERCENTSAP,
                            UnitPrice: detallePedido.PRECIOUNITARIOVENTA,
                        };

                        item.WarehouseCode = WarehouseCode;

                        cliente.DocumentLines.push(item);
                    }

                    const message = JSON.stringify(cliente);
                    console.log(message);

                    webTargetDos.post('', cliente)
                        .then(responseDos => {
                            const statusOrders = responseDos.status;
                            console.log("ORDEN TRABAJO CREACION STATUS..?: " + statusOrders);

                            if (statusOrders === 201) {
                                const notification = 'ORDEN CREADA EN EL SISTEMA SAP!';
                                // Mostrar mensaje en la consola
                                console.log(notification);

                                const dataDos = responseDos.data;
                                console.log("Respuesta SAP: " + dataDos);

                                //const joRe = JSON.parse(dataDos);
                                const docNumSAP = dataDos.DocNum;

                                // Guardamos el docNumSAP en la orden de la base de datos HANA
                                try {

                                    // Parametro name corresponde a codigo
                                    // Sentecia consultar el usuario
                                    const SqlQuery = `UPDATE GRUPO_EMPRESARIAL_HT.HT_ORDERS t
                                                      SET t.ESTADO        = 0,
                                                          t.USUARIOAPROBO = '${displayname}',
                                                          t.FECHAAPROBO   = '${dateAll}',
                                                          t.DOCNUM        = ${docNumSAP}
                                                      WHERE t.ID = ${IdOrder}`;

                                    // //Funcion para enviar sentencias SQL a la DB HANA
                                    consultas(SqlQuery, async (err, result) => {
                                            if (err) {
                                                throw err
                                            } else {
                                                console.log(result);
                                                return notification;

                                                // res.status(200);
                                            }
                                        }
                                    )

                                } catch (error) {
                                    console.error(error);
                                    return res.status(500).json({
                                        message: 'Internal server error.',
                                    });
                                }

                                // Guardar(usuarioX);

                                // Importante muy importante
                                //listaPedido = pedidoDAO.getAllPendienteAprobarWebB();

                                //console.log(data);

                            } else {
                                const dataDos = responseDos.data;
                                const message_orders_uno = {
                                    severity: 'fatal',
                                    summary: 'Mensaje',
                                    detail: 'ERROR - POR FAVOR VALIDAR DATOS!',
                                };
                                // Mostrar mensaje en la consola
                                console.log(message_orders_uno);
                                const message_orders_dos = {
                                    severity: 'info',
                                    summary: 'Mensaje',
                                    detail: dataDos,
                                };
                                // Mostrar mensaje en la consola
                                console.log(message_orders_dos);
                            }
                        })
                        .catch(error => {
                            console.error(error);
                        });


                }


                if (statusBusinessPartners === 400 || statusBusinessPartners === 404) {
                    const dataBusinessPartners = response.data;
                    const notification = "CLIENTE NO CREADO EN EL SISTEMA SAP! : " + dataBusinessPartners;
                    // Mostrar mensaje en la consola
                    console.log(notification);
                }
            })
            .catch(error => {
                console.error(error);
            });

        // res.status(200).json({success: true, token: the_token});
    } catch (error) {
        console.error(error);
        // res.status(500).json({success: false, error: 'Error al crear la orden'});
    }
}