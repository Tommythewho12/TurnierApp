module.exports = app => {
    const phases = require("../controllers/phase.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Phase
    router.post("/", phases.create);
  
    // Retrieve all Phases
    router.get("/", phases.findAll);
  
    // Retrieve a single Phase with id
    router.get("/:id", phases.findOne);
  
    // Retrieve a single Phase with tournamentId
    router.get("/tournament/:tournamentId", phases.findOne);
  
    // Update a Phase with id
    router.put("/:id", phases.update);
  
    // Delete a Phase with id
    router.delete("/:id", phases.delete);
  
    // Delete all Phases
    router.delete("/", phases.deleteAll);
  
    app.use('/api/phases', router);
  };