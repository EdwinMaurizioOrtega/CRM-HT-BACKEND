// const db = require("../models");
// const Tutorial = db.tutorials;
// const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
// exports.create = (req, res) => {
//     // Validate request
//     if (!req.body.title) {
//         res.status(400).send({
//             message: "Content can not be empty!"
//         });
//         return;
//     }
//
//     // Create a Tutorial
//     const tutorial = {
//         title: req.body.title,
//         description: req.body.description,
//         published: req.body.published ? req.body.published : false
//     };
//
//     // Save Tutorial in the database
//     Tutorial.create(tutorial)
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while creating the Tutorial."
//             });
//         });
// };

// Retrieve all Tutorials from the database.
// exports.findAll = (req, res) => {
//     const title = req.query.title;
//     var condition = title ? {title: {[Op.iLike]: `%${title}%`}} : null;
//
//     Tutorial.findAll({where: condition})
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while retrieving tutorials."
//             });
//         });
// };

// Find a single Tutorial with an id
// exports.findOne = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.findByPk(id)
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Error retrieving Tutorial with id=" + id
//             });
//         });
// };

import axios from 'axios';

// Buscar IMEI
export const getGarantia = async (req, res) => {

        const enteredName = req.query.id;
        console.log("IMEI A CONSULTAR: " + enteredName);

        try {
            //PAC
            console.log("Buscando en el sistema Facturacion PAC");

            const responsePac = await axios.post("http://10.1.10.201:8087/st/buscarimei/", {
                imei: enteredName,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            });

            console.log("responsePac: " + responsePac)

            //Creamos un JSON
            var obj = new Object();

            console.log("Status 200: " + responsePac.status)

            let jsonPac = await responsePac.data;

            //Fecha finalizacion de garantia.
            var fecha = new Date(jsonPac.producto.fecmov05);
            fecha.setDate(fecha.getDate() + 365);
            let fechaFinGarantia = fecha.toISOString("en-US", {timeZone: "America/Guayaquil"});
            console.log("Fecha fin de garantia: " + fechaFinGarantia)

            console.log(jsonPac.producto.tieneGarantia)
            let tieneGarantia = jsonPac.producto.tieneGarantia
            let marcaAux = jsonPac.producto.desccate

            if (tieneGarantia == true) {
                console.log("SI TIENE GARANTIA.")
                obj.garantia = "SI TIENE GARANTÍA. VENCE EL " + fechaFinGarantia;
                obj.marca = marcaAux
            } else {
                console.log("NO TIENE GARANTIA.")
                obj.garantia = "NO TIENE GARANTÍA. SU GARANTÍA VENCIÓ EL " + fechaFinGarantia;
                obj.marca = marcaAux
            }


            //PROCESAMOS LOS DATOS PARA LAS DOS SISTEMAS DE FACTURACION

//convert object to json string
            var string = JSON.stringify(obj);
            console.log(string);
            var objDos = JSON.parse(string);
            console.log(objDos.garantia);

//Retornamos el objeto
            res.send({
                "message": objDos.garantia,
                "marca": objDos.marca
            })

        } catch (error) {
            console.error('Error making Axios request:', error);

            //SAP
            console.log("Buscando en el sistema Facturacion SAP")

            try {
                const responseSap = await axios.post('http://10.1.10.201:8087/sap/imeifiltro/', {
                    imei: enteredName
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                console.log("responseSap: " + responseSap)

                let jsonSap = await responseSap.data;
                console.log("json: " + jsonSap);

                //Asignamos a una variable
                let fecha_venta = jsonSap.fechaVenta

                console.log(fecha_venta)
                //Pasamos la variable para la conversion
                let date_1 = new Date(fecha_venta);
                console.log(date_1);
                let date_hoy = new Date();

                const days = (date_1, date_hoy) => {
                    let difference = date_hoy.getTime() - date_1.getTime();
                    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
                    return TotalDays;
                }
                let numero_dias = days(date_1, date_hoy)
                console.log(numero_dias + " días.");

                //Fecha finalizacion de garantia.
                var fecha = new Date(date_1);
                console.log("uno: " + fecha);
                fecha.setDate(fecha.getDate() + 365);
                let fechaFinGarantia = fecha.toISOString("en-US", {timeZone: "America/Guayaquil"});

                let marcaAux = jsonSap.marca;

                //Creamos un JSON
                var obj = new Object();
                if (numero_dias <= 365) {
                    console.log("SI TIENE GARANTIA.")
                    obj.garantia = "SI TIENE GARANTÍA. VENCE EL " + fechaFinGarantia;
                    obj.marca = marcaAux;
                } else {
                    console.log("NO TIENE GARANTIA.")
                    obj.garantia = "NO TIENE GARANTÍA. SU GARANTÍA VENCIÓ EL " + fechaFinGarantia;
                    obj.marca = marcaAux;
                }

                //PROCESAMOS LOS DATOS PARA LAS DOS SISTEMAS DE FACTURACION

                //convert object to json string
                var string = JSON.stringify(obj);
                console.log(string);
                var objDos = JSON.parse(string);
                console.log(objDos.garantia);

                //Retornamos el objeto
                res.send({
                    "message": objDos.garantia,
                    "marca": objDos.marca
                })


            } catch (error) {
                console.error('Error making Axios request:', error);

                //Retornamos el objeto
                res.send({
                    "message": "TELEFONO NO FUE FACTURADO EN LIDENAR."
                })

            }

        }


    }
;

// Update a Tutorial by the id in the request
// exports.update = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.update(req.body, {
//         where: {id: id}
//     })
//         .then(num => {
//             if (num == 1) {
//                 res.send({
//                     message: "Tutorial was updated successfully."
//                 });
//             } else {
//                 res.send({
//                     message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Error updating Tutorial with id=" + id
//             });
//         });
// };

// Delete a Tutorial with the specified id in the request
// exports.delete = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.destroy({
//         where: {id: id}
//     })
//         .then(num => {
//             if (num == 1) {
//                 res.send({
//                     message: "Tutorial was deleted successfully!"
//                 });
//             } else {
//                 res.send({
//                     message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Could not delete Tutorial with id=" + id
//             });
//         });
// };

// Delete all Tutorials from the database.
// exports.deleteAll = (req, res) => {
//     Tutorial.destroy({
//         where: {},
//         truncate: false
//     })
//         .then(nums => {
//             res.send({message: `${nums} Tutorials were deleted successfully!`});
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while removing all tutorials."
//             });
//         });
// };

// find all published Tutorial
// exports.findAllPublished = (req, res) => {
//     Tutorial.findAll({where: {published: true}})
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while retrieving tutorials."
//             });
//         });
// };
