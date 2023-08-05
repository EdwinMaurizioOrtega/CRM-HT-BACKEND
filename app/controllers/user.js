import express from "express";
import jwt from "jsonwebtoken";

import {SqlQuerySignIn, SqlInsertUser} from "../models/user.js"
import {consultas} from "../config/HANADB.js";
import axios from "axios";
import * as https from "https";

const router = express.Router();

const JWT_SECRET = ',2023;Hipertronics';

export const IniciarSesion = async (req, res) => {
    const {email, password} = req.body;

    try {

        //Sentecia consultar el usuario
        //const SqlQuery = 'SELECT * FROM "GRUPO_EMPRESARIAL_HT"."ht_users" WHERE "user_login" LIKE \'' + usuario + '\'';
        const SqlQuery = SqlQuerySignIn(email);

        //Funcion para enviar sentencias SQL a la DB HANA
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    const oldUser = await result[0];
                    if (!oldUser) return res.status(404).json({message: "El usuario no existe"});
                    const isPasswordCorrect = await password === oldUser.PASSWORD;
                    if (!isPasswordCorrect) return res.status(400).json({message: "Credenciales no válidas"});
                    const accessToken = jwt.sign({usuario: oldUser.EMAIL, id: oldUser.ID}, JWT_SECRET, {expiresIn: "1h"});
                    res.status(200).json({user: oldUser, accessToken});
                }
            }
        )

    } catch (err) {
        res.status(500).json({message: "Algo salió mal"});
    }
};


export const MyAccount = async (req, res) => {
    //const {email, password} = req.body;

    try {

        const {authorization} = req.headers;

        if (!authorization) {
            return res.status(401).json({
                message: 'Authorization token missing',
            });
        }

        const accessToken = `${authorization}`.split(' ')[1];

        const data = jwt.verify(accessToken, JWT_SECRET);

        console.log("data: " + data);

        const userId = typeof data === 'object' ? data?.id : '';

        // //Sentecia consultar el usuario
        const SqlQuery = 'SELECT * FROM "GRUPO_EMPRESARIAL_HT"."HT_USERS" WHERE "ID" = ' + userId;
        // const SqlQuery = SqlQuerySignIn(email);
        //
        // //Funcion para enviar sentencias SQL a la DB HANA
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)

                    const oldUser = await result[0];

                    if (!oldUser) return res.status(401).json({message: "Invalid authorization token"});

                    res.status(200).json({user: oldUser});
                }
            }
        )

    } catch (err) {
        res.status(500).json({message: "Algo salió mal"});
    }
};

export const Registrarse = async (req, res) => {
    try {

        //Validamos si el usuario existe con el correo
        const SqlQuery = SqlQuerySignIn(req.body.EMAIL);
        consultas(SqlQuery, async (err, result) => {
                if (err) {
                    throw err
                } else {
                    console.log(result)
                    const existUser = await result.length === 0;
                    if (!existUser) {
                        return res.status(404).json({
                            message: 'Ya existe una cuenta con la dirección de correo electrónico proporcionada.',
                        });
                    }

                    // Si no existe el usuario en la DB procedemos a crearlo
                    const SqlUserQuery = SqlInsertUser(req.body);
                    consultas(SqlUserQuery, async (err, result) => {
                            if (err) {
                                throw err
                            } else {
                                console.log(result);
                                console.log(`Se insertaron ${result} filas`);

                                //Una vez creado con sultamos nuevamente el usuario y enviamos los datos en el response
                                const SqlQuery2 = SqlQuerySignIn(req.body.EMAIL);
                                consultas(SqlQuery2, async (err, result) => {
                                        if (err) {
                                            throw err
                                        } else {
                                            const oldUser = await result[0];
                                            const accessToken = jwt.sign({userId: oldUser.ID}, JWT_SECRET, {expiresIn: "1h"});
                                            res.status(200).json({accessToken, user: oldUser});
                                        }
                                    }
                                )


                            }
                        }
                    )

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


export const getAllUsers = async (req, res) => {

    //Sin Parametros
    //Creamos la consulta
    const SqlQuery = 'SELECT * FROM GRUPO_EMPRESARIAL_HT.HT_USERS';

    //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.send({
                    "users": result
                })
            }
        }
    )

}


export const getUser = async (req, res) => {

    //Parametro name corresponde a codigo
    const userId = req.query.id;
    console.log("userId: " + userId)

    // //Sentecia consultar el usuario
    const SqlQuery = 'SELECT * FROM "GRUPO_EMPRESARIAL_HT"."HT_USERS" WHERE "ID" = ' + userId;

    // //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, async (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                const oldUser = await result[0];

                res.status(200).json({user: oldUser});
            }
        }
    )

}


export const putUser = async (req, res) => {

    //Parametro name corresponde a codigo
    const user = req.body;
    console.log("userId: " + user.ID)

    // //Sentecia consultar el usuario
    const SqlQuery = 'UPDATE GRUPO_EMPRESARIAL_HT.HT_USERS T0\n' +
        'SET T0.DISPLAYNAME = \'' + user.DISPLAYNAME + '\',' +
        '    T0.EMAIL       = \'' + user.EMAIL + '\',' +
        '    T0.PASSWORD    = \'' + user.PASSWORD + '\',' +
        '    T0.PHOTOURL    = \'' + user.PHOTOURL + '\',' +
        '    T0.PHONENUMBER = \'' + user.PHONENUMBER + '\',' +
        '    T0.COUNTRY     = \'' + user.COUNTRY + '\',' +
        '    T0.ADDRESS     = \'' + user.ADDRESS + '\',' +
        '    T0.STATE       = \'' + user.STATE + '\',' +
        '    T0.CITY        = \'' + user.CITY + '\',' +
        '    T0.ZIPCODE     = \'' + user.ZIPCODE + '\',' +
        '    T0.ABOUT       = \'' + user.ABOUT + '\',' +
        '    T0.ROLE        = \'' + user.ROLE + '\',' +
        '    T0.ISPUBLIC    = ' + user.ISPUBLIC +
        ' WHERE T0.ID = ' + user.ID;


    // //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, async (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.status(200);
            }
        }
    )

}

export const deleteUser = async (req, res) => {

    //Parametro name corresponde a codigo
    const id = req.query.id;
    console.log("userId: " + id)

    // //Sentecia consultar el usuario
    const SqlQuery = 'DELETE\n' +
        'FROM GRUPO_EMPRESARIAL_HT.HT_USERS\n' +
        'WHERE ID = ' + id;


    // //Funcion para enviar sentencias SQL a la DB HANA
    consultas(SqlQuery, async (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result)
                res.status(200);
            }
        }
    )

}

const createAxiosInstance = (baseURL) => {
    return axios.create({
        baseURL,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const ServiEntrega = async (req, res) => {
    try {
        console.log(req.body);

        // Create orden de venta in HANA SAP
        const orderUrl = 'https://181.39.87.158:8021/api/guiawebs/';
        const orderClient = createAxiosInstance(orderUrl);

        const dataToSend = {
            // GuiaWebs
            id_tipo_logistica: 1,
            detalle_envio_1: '',
            detalle_envio_2: '',
            detalle_envio_3: '',
            // Ciudades
            id_ciudad_origen: req.body.id_ciudad_origen,
            id_ciudad_destino: req.body.id_ciudad_destino,
            // Datos Destino
            id_destinatario_ne_cl: req.body.id_destinatario_ne_cl,
            razon_social_desti_ne: req.body.razon_social_desti_ne,
            nombre_destinatario_ne: req.body.nombre_destinatario_ne,
            apellido_destinatar_ne: req.body.apellido_destinatar_ne,
            // MUY IMPORTANTE
            direccion1_destinat_ne: 'Av. Colon 7-90 TEST TEST',
            sector_destinat_ne: '',
            telefono1_destinat_ne: req.body.telefono1_destinat_ne,
            telefono2_destinat_ne: '',
            codigo_postal_dest_ne: '',
            // Datos Remitente || BODEGA
            id_remitente_cl: req.body.id_remitente_cl,
            razon_social_remite: req.body.razon_social_remite,
            nombre_remitente: req.body.nombre_remitente,
            apellido_remite: '',
            direccion1_remite: req.body.direccion1_remite,
            sector_remite: '',
            telefono1_remite: req.body.telefono1_remite,
            telefono2_remite: '',
            codigo_postal_remi: '',
            // 1 DOCUMENTO UNITARIO
            // 2 MERCANCIA PREMIER
            // 3 DOCUMENTO MASIVO
            // 6 MERCANCIA INDUSTRIAL
            // 8 VALIJA EMPRESARIAL 71 FARMA
            id_producto: 2,
            //
            contenido: 'CELULARES',
            // Cajas - Bultos
            numero_piezas: req.body.numero_piezas || 0,
            // Valor total
            valor_mercancia: req.body.valor_mercancia,
            // Valor 40%
            valor_asegurado: req.body.valor_asegurado,
            largo: 0,
            ancho: 0,
            alto: 0,
            // El peso en nuestro caso es por bultos
            peso_fisico: 0.0,
            login_creacion: 'lidenar.sa',
            password: 'lidenar'
        };

        const responseDos = await orderClient.post('', dataToSend);

        // If the guia is created correctly with Status Code 201
        if (responseDos.status === 201) {
            const getId = responseDos.data.id;
            console.log("Número de guia: " + getId);

            const businessPartnersUrl = `https://181.39.87.158:7777/api/GuiasWeb/['${getId}','lidenar.sa','lidenar','1']`;
            const businessPartnerClient = createAxiosInstance(businessPartnersUrl);

            const response = await businessPartnerClient.get();

            // If the guia exists, obtain the PDF file
            if (response.status === 201) {
                // Impimir un mensaje
                const mensaje = response.data.mensaje;
                console.log(mensaje);
                // Decode and save the base64 file
                const base64File = response.data.archivoEncriptado;
                console.log("PDF: " + base64File);

                return res.status(200).json({
                    NumGuia: getId,
                    base64File: base64File,
                    mensaje: mensaje
                });
            }
        }

        return res.status(200).json({
            message: "Error al crear la orden en Servientrega.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }

};

export const CitiesServiEntrega = async (req, res) => {

    const cities = `https://181.39.87.158:8021/api/ciudades/['lidenar.sa','lidenar']`;
    const citiesAux = createAxiosInstance(cities);

    const response = await citiesAux.get();

    if (response.status === 200) {

        const data = response.data;
        console.log(data);

        return res.status(200).json({
            data: data
        });
    }

}