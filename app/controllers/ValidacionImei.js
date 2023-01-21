import express from 'express';
import mongoose from 'mongoose';

import PostMessage from '../models/validacionImei.js';

const router = express.Router();

export const getImeiByDescription = async (req, res) => {
    const { description } = req.query;

    try {
        const posts = await PostMessage.findOne({ description });

        //res.json({ data: posts });

        if (posts === null) {
            console.log('Not found!');
            res.send({
                    "validacion": false
                }
            )
        } else {
            //res.send(objeto);
            res.send({
                    "validacion": true
                }
            )
        }

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createImei = async (req, res) => {
    const post = req.body;

    const newPostMessage = new PostMessage({ ...post, createdAt: new Date().toISOString() })

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export default router;