module.exports = app => {
  const tournaments = require("../controllers/tournament.controller.js");

  var router = require("express").Router();

  // Create a new Tournament
  router.post("/tournaments/", tournaments.create);

  // Retrieve all Tournaments
  router.get("/tournaments/", tournaments.findAll);

  // Retrieve a single Tournament with id
  router.get("/tournaments/:id", tournaments.findOne);

  // Update a Tournament with id
  router.put("/tournaments/:id", tournaments.update);

  // Delete a Tournament with id
  router.delete("/tournaments/:id", tournaments.delete);

  // Delete all Tournaments
  router.delete("/tournaments/", tournaments.deleteAll);

  // Matchs
  // Retrieve a single Match
  router.get("/matchs/:matchId", tournaments.findMatch);

  // Update Match
  router.patch("/tournaments/:tournamentId/phases/:phaseId/groups/:groupId/matchs/:matchId/concluded", tournaments.concludeMatch);

  // Create set
  router.post("/tournaments/:tournamentId/phases/:phaseId/groups/:groupId/matchs/:matchId/sets", tournaments.createSet);

  router.patch("/tournaments/:tournamentId/phases/:phaseId/groups/:groupId/matchs/:matchId/sets/:setId", tournaments.updateSet);

  // Create and fetch PDF
  router.get("/tournaments/:tournamentId/pdf/:fileName", tournaments.fetchPDF);

  app.use('/api', router);
};