import express from "express";
import jwt from "jsonwebtoken";

import { SqlQuerySignIn } from "../models/user.js"
import {consultas} from "../config/HANADB.js";

const router = express.Router();

const secret = ',2023;Hipertronics';

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
                    const accessToken = jwt.sign({usuario: oldUser.EMAIL, id: oldUser.ID}, secret, {expiresIn: "1h"});
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

        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({
                message: 'Authorization token missing',
            });
        }

        const accessToken = `${authorization}`.split(' ')[1];

        const data = jwt.verify(accessToken, secret);

        console.log("data: "+ data );

        const userId = typeof data === 'object' ? data?.id : '';

        // //Sentecia consultar el usuario
        const SqlQuery = 'SELECT * FROM "GRUPO_EMPRESARIAL_HT"."HT_USERS" WHERE "ID" = '+userId;
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

// export const Registrarse = async (req, res) => {
//     const {usuario, clave, nombres} = req.body;
//
//     try {
//         const oldUser = await User.findOne({usuario});
//
//         if (oldUser) return res.status(400).json({message: "El usuario ya existe."});
//
//         //const hashedPassword = await bcrypt.hash(clave, 12);
//
//         const result = await User.create({usuario, clave: clave, nombres: `${nombres}`});
//
//         const token = jwt.sign({usuario: result.usuario, id: result._id}, secret, {expiresIn: "1h"});
//
//         res.status(201).json({result, token});
//     } catch (error) {
//         res.status(500).json({message: "Algo salió mal."});
//
//         console.log(error);
//     }
// };