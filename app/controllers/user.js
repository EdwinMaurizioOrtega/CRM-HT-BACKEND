import express from "express";
import jwt from "jsonwebtoken";


import User from "../models/user.js"

const router = express.Router();

const secret = ',2023;Hipertronics';

export const IniciarSesion = async (req, res) => {
    const { usuario, clave } = req.body;

    try {
        const oldUser = await User.findOne({ usuario });

        if (!oldUser) return res.status(404).json({ message: "El usuario no existe" });

        const isPasswordCorrect = await clave === oldUser.clave;

        if (!isPasswordCorrect) return res.status(400).json({ message: "Credenciales no válidas" });

        const token = jwt.sign({ usuario: oldUser.usuario, id: oldUser._id }, secret, { expiresIn: "1h" });

        res.status(200).json({ result: oldUser, token });
    } catch (err) {
        res.status(500).json({ message: "Algo salió mal" });
    }
};

export const Registrarse = async (req, res) => {
    const { usuario, clave, nombres } = req.body;

    try {
        const oldUser = await User.findOne({ usuario });

        if (oldUser) return res.status(400).json({ message: "El usuario ya existe." });

        //const hashedPassword = await bcrypt.hash(clave, 12);

        const result = await User.create({ usuario, clave: clave, nombres: `${nombres}` });

        const token = jwt.sign( { usuario: result.usuario, id: result._id }, secret, { expiresIn: "1h" } );

        res.status(201).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal." });

        console.log(error);
    }
};