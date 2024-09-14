module.exports = app => {
    const matchs = require("../controllers/match.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Match
    router.post("/", matchs.create);
  
    // Retrieve all Matchs
    router.get("/", matchs.findAll);
  
    // Retrieve a single Match with id
    router.get("/:id", matchs.findOne);

    // Retrieve all Matchs linked to Group
    router.get("/WithGroup/:groupId", matchs.findAllByGroupId);
  
    // Update a Match with id
    router.put("/:id", matchs.update);
  
    // Delete a Match with id
    router.delete("/:id", matchs.delete);
  
    // Delete all Matchs
    router.delete("/", matchs.deleteAll);
  
    app.use('/api/matchs', router);
  };