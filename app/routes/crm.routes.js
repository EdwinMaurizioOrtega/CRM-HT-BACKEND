
module.exports = app => {

  const ValidacionImei = require("../controllers/ValidacionImei.js");
  const WebServicesRemote = require("../controllers/WebServicesRemote.js");

  var router = require("express").Router();

  //API Endpoint
  app.use("/api/crm-ht", router);


  // Create a new Tutorial
  //router.post("/", tutorials.create);

  // Retrieve all Tutorials
  //router.get("/", tutorials.findAll);

  // Retrieve all published Tutorials
  //router.get("/published", tutorials.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/logitech/:id", ValidacionImei.findOne);

  // Update a Tutorial with id
  //router.put("/:id", tutorials.update);

  // Delete a Tutorial with id
  //router.delete("/:id", tutorials.delete);

  // Delete all Tutorials
  //router.delete("/", tutorials.deleteAll);

  // Recuperar un detalle de factura con el Imei
  router.get("/buscarimei/:id", WebServicesRemote.findOneImei);
};
