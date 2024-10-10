module.exports = app => {
    const teamReferences = require("../controllers/team-references.controller.js");
  
    var router = require("express").Router();
  
    // Create a new TeamReference
    router.post("/", teamReferences.create);
  
    // Retrieve all TeamReferences
    // router.get("/", teamReferences.findAll);
  
    // Retrieve all TeamReferences with groupId
    router.get("/group/:groupId", teamReferences.findAllByGroupId);
  
    // Retrieve a single TeamReference with id
    router.get("/:id", teamReferences.findOne);
  
    // Retrieve a single TeamReference with teamId
    router.get("/team/:teamId", teamReferences.findOneByTeamId);
  
    // Update a TeamReference with id
    router.put("/:id", teamReferences.update);
  
    // Delete a TeamReference with id
    router.delete("/:id", teamReferences.delete);
  
    // Delete all TeamReferences
    router.delete("/", teamReferences.deleteAll);
  
    app.use('/api/team-references', router);
  };