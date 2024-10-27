const db = require("../models");
const Tournament = db.tournaments;
const mongoose = require("mongoose");

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
            console.log(err);
            res
                .status(500)
                .send({ message: "Some error occurred while creating the Tournament." });
        });
};

// Retrieve all Tournaments from the database.
exports.findAll = (req, res) => {

    Tournament
        .find()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Some error occurred while retrieving tournaments." });
        });
};

// Find a single Tournament with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    // TODO extract function coming below to use in all fetch cases
    // TODO move stats calculations server-side

    Tournament
        .findById(id)
        .populate({
            path: "teams"
        })
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Tournament with id " + id });
            else res.send(data);
        })
        .catch(err => {
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

    Tournament
        .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Tournament with id=${id}. Maybe Tournament was not found!`
                });
            } else res.send({ message: "Tournament was updated successfully." });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({
                message: "Error updating Tournament with id=" + id
            });
        });
};

// Delete a Tournament with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Tournament
        .findByIdAndRemove(id)
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
            console.log(err);
            res.status(500).send({
                message: "Could not delete Tournament with id=" + id
            });
        });
};

// Delete all Tournaments from the database.
exports.deleteAll = (req, res) => {
    Tournament
        .deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Tournaments were deleted successfully!`
            });
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Some error occurred while removing all tournaments." });
        });
};

// Matches
// Find a single Match by matchId only
exports.findMatch = (req, res) => {
    console.log("req.params", req.params);
    const matchId = req.params.matchId;

    Tournament
        .aggregate()
        .match({ "phases.groups.matchs._id": mongoose.Types.ObjectId.createFromHexString(matchId) })
        .unwind( "$phases" )
        .unwind( "$phases.groups" )
        .unwind( "$phases.groups.matchs" )
        .lookup({ "from": "teams", "localField": "phases.groups.matchs.homeTeam", "foreignField": "_id", "as": "homeTeamData" })
        .lookup({ "from": "teams", "localField": "phases.groups.matchs.guestTeam", "foreignField": "_id", "as": "guestTeamData" })
        .match({ "phases.groups.matchs._id": mongoose.Types.ObjectId.createFromHexString(matchId) })
        .project({ 
            phaseId: "$phases._id", 
            groupId: "$phases.groups._id",
            match: {
                _id: "$phases.groups.matchs._id",
                order: "$phases.groups.matchs.order",
                sets: "$phases.groups.matchs.sets",
                concluded: "$phases.groups.matchs.concluded",
                homeTeam: { $arrayElemAt: ["$homeTeamData", 0] },
                guestTeam: { $arrayElemAt: ["$guestTeamData", 0] }
            }})
        .then(data => {
            res.send(data[0]);
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .set({ message: "Error retrieving Tournament by Match with id=" + matchId });
        })
};

// Conclude match
exports.concludeMatch = (req, res) => {
    const tournamentId = req.params.tournamentId;
    const phaseId = req.params.phaseId;
    const groupId = req.params.groupId;
    const matchId = req.params.matchId;

    Tournament
        .updateOne(
            {
                "_id": tournamentId,
                "phases._id": phaseId,
                "phases.groups._id": groupId,
                "phases.groups.matchs._id": matchId
            },
            {
                $set: {
                    [`phases.$[p].groups.$[g].matchs.$[m].concluded`]: true
                }
            },
            {
                arrayFilters: [
                    { "p._id": phaseId },
                    { "g._id": groupId },
                    { "m._id": matchId }
                ]
            }
        )
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Error updating Set id=" + setId });
        });
};


// Create new Set
exports.createSet = (req, res) => {
    const tournamentId = req.params.tournamentId;
    const phaseId = req.params.phaseId;
    const groupId = req.params.groupId;
    const matchId = req.params.matchId;
    const setOrder = req.body.setOrder;

    Tournament
        .findOneAndUpdate(
            {
                "_id": tournamentId,
                "phases._id": phaseId,
                "phases.groups._id": groupId,
                "phases.groups.matchs._id": matchId
            },
            {
                $push: {
                    [`phases.$[p].groups.$[g].matchs.$[m].sets`]: {
                        "order": setOrder,
                        "scoreHome": 0,
                        "scoreGuest": 0,
                        "concluded": false
                    },
                }
            },
            {
                arrayFilters: [
                    { "p._id": phaseId },
                    { "g._id": groupId },
                    { "m._id": matchId }
                ],
                new: true
            }
        )
        .then(data => {
            res.send( data.phases.id(phaseId).groups.id(groupId).matchs.id(matchId).sets[setOrder] );
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Error creating set in Tournament with id=" + tournamentId });
        });
};

// Update a single Match
exports.updateSet = (req, res) => {
    const tournamentId = req.params.tournamentId;
    const phaseId = req.params.phaseId;
    const groupId = req.params.groupId;
    const matchId = req.params.matchId;
    const setId = req.params.setId;
    const newSet = req.body;

    Tournament
        .updateOne(
            {
                "_id": tournamentId,
                "phases._id": phaseId,
                "phases.groups._id": groupId,
                "phases.groups.matchs._id": matchId,
                "phases.groups.matchs.sets._id": setId
            },
            {
                $set: {
                    [`phases.$[p].groups.$[g].matchs.$[m].sets.$[s].scoreHome`]: newSet.scoreHome,
                    [`phases.$[p].groups.$[g].matchs.$[m].sets.$[s].scoreGuest`]: newSet.scoreGuest,
                    [`phases.$[p].groups.$[g].matchs.$[m].sets.$[s].concluded`]: newSet.concluded
                }
            },
            {
                arrayFilters: [
                    { "p._id": phaseId },
                    { "g._id": groupId },
                    { "m._id": matchId },
                    { "s._id": setId }
                ]
            }
        )
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Error updating Set id=" + setId });
        });
}