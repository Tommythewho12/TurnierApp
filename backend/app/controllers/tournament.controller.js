const db = require("../models");
const Tournament = db.tournaments;

// Create and Save a new Tournament
exports.create = (req, res) => {
    // Validate request
    // TODO improve validations!
    if (!req.body.name) {
        res.status(400).send({ message: "Name can not be empty!" });
        return;
    }

    // Create a Tournament
    const tournament = new Tournament({
        name: req.body.name,
        teams: req.body.teams,
        phases: req.body.phases
    });

    // Save Tournament in the database
    tournament
        .save(tournament)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Tournament."
            });
        });
};

// Retrieve all Tournaments from the database.
exports.findAll = (req, res) => {

    Tournament.find()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tournaments."
            });
        });
};

// Find a single Tournament with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Tournament
        .findById(id)
        .populate({
            path: "teams"
        })
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Tournament with id " + id });
            else {
                // TODO extract function coming below to use in all fetch cases
                let tournament = {phases: [], teams: []};
                for (let phase of tournament.phases) {
                    for (let group of phase.groups) {
                        if (group.teams != null) {
                            const teamsMap = new Map();
                            for (let team of group.teams) {
                                teamsMap.set(team.toString(), {
                                    score: 0, 
                                    matchs: 0, 
                                    wins: 0, 
                                    losses: 0, 
                                    draws: 0, 
                                    pointsScored: 0, 
                                    pointsSuffered: 0})
                            }
                            if (group.matchs != null) {
                                for (let match of group.matchs) {
                                    if (match != null && 
                                        match.sets != null &&
                                        match.homeTeam != null &&
                                        match.guestTeam != null) {
                                            const homeTeam = teamsMap.get(match.homeTeam.toString());
                                            const guestTeam = teamsMap.get(match.guestTeam.toString());
                                            homeTeam.matchs++;
                                            guestTeam.matchs++;

                                            let setsHome = 0, setsGuest = 0;
                                            for (let set of match.sets) {
                                                const scoreHome = Number(set.scoreHome);
                                                const scoreGuest = Number(set.scoreGuest);
                                                homeTeam.score += scoreHome;
                                                guestTeam.score += scoreGuest;

                                                if (scoreHome > scoreGuest) setsHome++;
                                                else if (scoreHome < scoreGuest) setsGuest++;

                                                homeTeam.pointsScored += scoreHome;
                                                guestTeam.pointsScored += scoreGuest;

                                                homeTeam.pointsSuffered += scoreGuest;
                                                guestTeam.pointsSuffered += scoreHome;
                                            }
                                            if (setsHome > setsGuest) {
                                                homeTeam.wins++;
                                                guestTeam.losses++;
                                            } else if (setsGuest > setsHome) {
                                                homeTeam.losses++;
                                                guestTeam.wins++;
                                            } else {
                                                homeTeam.draws++;
                                                guestTeam.draws++;
                                            }
                                    }
                                }
                            }
                            group.teams = Array.from(teamsMap, ([name, value]) => ({ name, value }));
                            // group.teams = teamsMap;
                            let x = tournament.phases[0].groups[0].teams;
                            x = Array.from(teamsMap, ([name, value]) => ({ name, value }));
                            tournament.phases[0].groups[0].teams = Array.from(teamsMap, ([name, value]) => ({ name, value }));
                            console.log("waste");
                        }
                    }
                }
                res.send(tournament);
            }
        })
        .catch(err => {
            console.log("############## exception #################");
            console.log(err);
            res
                .status(500)
                .send({ message: "Error retrieving Tournament with id=" + id });
        });
};

// Update a Tournament by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Tournament.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Tournament with id=${id}. Maybe Tournament was not found!`
                });
            } else res.send({ message: "Tournament was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Tournament with id=" + id
            });
        });
};

// Delete a Tournament with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Tournament.findByIdAndRemove(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Tournament with id=${id}. Maybe Tournament was not found!`
                });
            } else {
                res.send({
                    message: "Tournament was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Tournament with id=" + id
            });
        });
};

// Delete all Tournaments from the database.
exports.deleteAll = (req, res) => {
    Tournament.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Tournaments were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all tournaments."
            });
        });
};