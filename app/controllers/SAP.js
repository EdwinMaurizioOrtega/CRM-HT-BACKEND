import axios from "axios";
import * as https from "https";
import {format} from "date-fns";


const dateAll = format(new Date(), 'yyyy-MM-dd');

export const CreateInvoiceSAP = async (req, res) => {
    //Lo que llega.
    const CardCode = `CL${req.body.CardCode}` ; // Reemplaza 'CLIENTE_A_VERIFICAR' con el código de cliente adecuado
    console.log("CardCode: " + CardCode);

    let the_token;

    const the_url = 'https://192.168.0.154:50000/b1s/v1/Login';
    const requestBody = {
        CompanyDB: 'EC_SBO_LIDENAR',
        Password: '1234',
        UserName: 'integracion'
    };

    const axiosConfig = {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };

    try {
        //Obtenemos el TOKEN
        const response = await axios.post(the_url, requestBody, axiosConfig);
        const data = response.data;
        the_token = data.SessionId;
        console.log('TOKEN SESION:', response.status);

        //Verificamos la existencia del Cliente en el SAP
        const businessPartnersUrl = `https://192.168.0.154:50000/b1s/v1/BusinessPartners('${CardCode}')`;
        const webTarget = axios.create({
            baseURL: businessPartnersUrl,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
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
                    const message_go = {
                        severity: 'info',
                        summary: 'Mensaje',
                        detail: 'CLIENTE EXISTE EN EL SISTEMA SAP!',
                    };
                    // Mostrar mensaje en la consola
                    console.log(message_go);

                    const data = response.data;
                    const PayTermsGrpCode = data.PayTermsGrpCode;
                    const SalesPersonCode = data.SalesPersonCode;


                    // Crear orden de venta en HANA SAP
                    const orderUrl = 'https://192.168.0.154:50000/b1s/v1/Orders';
                    const webTargetDos = axios.create({
                        baseURL: orderUrl,
                        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': `B1SESSION=${the_token}; ROUTEID=.node3`
                        }
                    });

                    const cliente = {
                        CardCode: CardCode,
                        DocDueDate: dateAll,
                        PaymentGroupCode: SelectedCondicionPago || PayTermsGrpCode,
                        SalesPersonCode: SalesPersonCode,
                        U_SYP_FORMAP: 20,
                        U_SYP_FORMAPAGO2: 20,
                        DocumentLines: [],
                    };

                    // Detalles de la orden de venta
                    let counter = 0;
                    for (const detallePedido of pedidoSeleccionado.detalles) {
                        const item = {
                            LineNum: counter++,
                            ItemCode: detallePedido.producto.codigo,
                            Quantity: detallePedido.cantidad,
                            DiscountPercent: detallePedido.discountPercentSAP,
                            UnitPrice: detallePedido.precioUnitarioVenta,
                        };

                        if (pedidoSeleccionado.bodega === 0) {
                            item.WarehouseCode = '002'; // Bodega Mayorista Cuenca
                        } else if (pedidoSeleccionado.bodega === 3) {
                            item.WarehouseCode = '006'; // Bodega Metropolitan Quito
                        } else if (pedidoSeleccionado.bodega === 4) {
                            item.WarehouseCode = '015'; // Bodega Blu Bahía
                        } else if (pedidoSeleccionado.bodega === 5) {
                            item.WarehouseCode = '020'; // Bodega Manta
                        } else if (pedidoSeleccionado.bodega === 10) {
                            item.WarehouseCode = '019'; // Bodega MovilCelistic
                        }

                        cliente.DocumentLines.push(item);
                    }

                    const message = JSON.stringify(cliente);
                    console.log(message);

                    webTargetDos.post('/', message)
                        .then(responseDos => {
                            const statusOrders = responseDos.status;
                            console.log("ORDEN TRABAJO CREADA..?: " + statusOrders);

                            if (statusOrders === 201) {
                                const message_orders = {
                                    severity: 'info',
                                    summary: 'Mensaje',
                                    detail: 'ORDEN CREADA EN EL SISTEMA SAP!',
                                };
                                // Mostrar mensaje en la consola
                                console.log(message_orders);

                                const dataDos = responseDos.data;
                                console.log("Respuesta SAP: " + dataDos);

                                const joRe = JSON.parse(dataDos);
                                const docNumSAP = joRe.DocNum;
                                pedidoSeleccionado.docNum = docNumSAP;
                                pedidoDAO.Actualizar(pedidoSeleccionado);

                                Guardar(usuarioX);

                                listaPedido = pedidoDAO.getAllPendienteAprobarWebB();

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
                    const message_go = {
                        severity: 'info',
                        summary: 'Mensaje',
                        detail: 'CLIENTE NO CREADO EN EL SISTEMA SAP! : ' + dataBusinessPartners,
                    };
                    // Mostrar mensaje en la consola
                    console.log(message_go);
                }
            })
            .catch(error => {
                console.error(error);
            });

        res.status(200).json({ success: true, token: the_token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al crear la orden' });
    }
};