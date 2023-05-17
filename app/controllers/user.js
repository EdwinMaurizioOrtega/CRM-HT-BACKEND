import express from "express";
import jwt from "jsonwebtoken";

import {SqlQuerySignIn, SqlInsertUser} from "../models/user.js"
import {consultas} from "../config/HANADB.js";

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
        'WHERE ID = '+id;


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