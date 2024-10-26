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

  // Matchs
  // Retrieve a single Match
  router.get("/:tournamentId/phases/:phaseId/groups/:groupId/matchs/:matchId", tournaments.findMatch);

  router.patch("/:tournamentId/phases/:phaseId/groups/:groupId/matchs/:matchId/sets/:setId", tournaments.updateSet);

  app.use('/api/tournaments', router);
};