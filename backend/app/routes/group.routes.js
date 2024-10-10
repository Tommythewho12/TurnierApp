module.exports = app => {
  const groups = require("../controllers/group.controller.js");

  var router = require("express").Router();

  // Create a new Group
  router.post("/", groups.create);

  // Retrieve all Groups
  router.get("/", groups.findAll);

  // Retrieve a single Group with id
  router.get("/:id", groups.findOne);

  // Retrieve all Groups linked to Phase
  router.get("/phase/:phaseId", groups.findAllByPhaseId);

  // Update a Group with id
  router.put("/:id", groups.update);

  // Delete a Group with id
  router.delete("/:id", groups.delete);

  // Delete all Groups
  router.delete("/", groups.deleteAll);

  app.use('/api/groups', router);
};