module.exports = app => {
    const tournaments = require("../controllers/tournament.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tournament
    router.post("/", tournaments.create);
  
    // Retrieve all Tournaments
    router.get("/", tournaments.findAll);
  
    // Retrieve a single Tournament with id
    router.get("/:id", tournaments.findOne);
  
    // Update a Tournament with id
    router.put("/:id", tournaments.update);
  
    // Delete a Tournament with id
    router.delete("/:id", tournaments.delete);
  
    // Delete all Tournaments
    router.delete("/", tournaments.deleteAll);
  
    app.use('/api/tournaments', router);
  };