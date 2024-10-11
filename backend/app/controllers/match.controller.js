const db = require("../models");
const Match = db.matchs;
const TeamReference = db.teamReferences;

exports.create = async (req, res) => {
    // Validate request
    if (!req.body.group || req.body.order == null || !req.body.homeTeam || !req.body.guestTeam) {
        res.status(400).send({ message: "You must specify group, order, homeTeam, and guestTeam!" });
        return;
    }

    if (!(req.body.homeTeam.team != null ^ (req.body.homeTeam.group != null && req.body.homeTeam.rank != null))) {
        res.status(400).send({ message: "Home team is not correctly specified!", homeTeam: req.body.homeTeam, linkBool: req.body.homeTeam.team });
        return;
    }

    if (!(req.body.guestTeam.team != null ^ (req.body.guestTeam.group != null && req.body.guestTeam.rank != null))) {
        res.status(400).send({ message: "Guest team is not correctly specified!", guestTeam: req.body.guestTeam });
        return;
    }

    const homeTeamReference = new TeamReference({
        team: req.body.homeTeam.team,
        group: req.body.homeTeam.group,
        rank: req.body.homeTeam.rank
    });

    const guestTeamReference = new TeamReference({
        team: req.body.guestTeam.team,
        group: req.body.guestTeam.group,
        rank: req.body.guestTeam.rank
    });

    let homeTeamReferenceId;
    homeTeamReference.save(homeTeamReference)
        .then(data => {
            homeTeamReferenceId = data._id;
        })
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while creating the home team reference."
        }));

    let guestTeamReferenceId;
    guestTeamReference.save(guestTeamReference)
        .then(data => {
            guestTeamReferenceId = data._id;
        })
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while creating the guest team reference."
        }));

    await new Promise(res => setTimeout(res, 1000));

    // Create a Match
    const match = new Match({
        group: req.body.group,
        order: req.body.order,
        homeTeam: homeTeamReferenceId,
        guestTeam: guestTeamReferenceId,
        sets: req.body.sets ? req.body.sets : []
        // field: req.body.field ? req.body.field : ""
        // kickoff: req.body.kickoff,
        // noOfSets: req.body.noOfSets ? req.body.noOfSets : 5
    });

    match.save(match)
        .then(data => { res.send(data); })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the match."
            });
        });
};

// Retrieve all Matchs from the database.
exports.findAll = (req, res) => {
    Match.find()
        .populate("homeTeam")
        .populate("guestTeam")
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Matchs."
            });
        });
};

// Find Matchs linked to Group with id groupId
exports.findAllByGroupId = (req, res) => {
    const id = req.params.groupId;
    Match.find({ group: id })
        .populate("homeTeam")
        .populate("guestTeam")
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

// Find a single Match with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Match.findById(id)
        .populate("homeTeam")
        .populate("guestTeam")
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Match with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Match with id=" + id });
        });
};

// Add a point to a match to the home team
// exports.increaseScoreHome = (req, res) => {
//     const id = req.params.id;

//     var match = Match.findById(id)
//     .catch(err => {
//         res.status(500).send({
//             message:
//                 err.message || "Some error occurred while adding score to home."
//         });
//     });

//     // if match does not have any 
//     if (match.sets.length == 0) {
//         match.sets = [{
//             scoreHome: 1,
//             scoreGuest: 0
//         }];
//     } else if (match.sets[match.length-1].finished && match.size < match.maxNoOfSets) {
//         match.sets.push({
//             scoreHome: 1,
//             scoreGuest: 0
//         });
//     } else {
//         match.sets[match.length-1].scoreHome++;
//     }

//     Match.findByIdAndUpdate(id).then(data => {
//         if (!data) 
//             res.status(404).send({ message: "Not found Match with id " + id });
//         else res.send(data);
//     })
// }

// Update a Match by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Match.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Match with id=${id}. Maybe Match was not found!`
                });
            } else res.send({ message: "Match was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Match with id=" + id
            });
        });
};

// Delete a Match with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Match.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Match with id=${id}. Maybe Match was not found!`
                });
            } else {
                res.send({
                    message: "Match was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Match with id=" + id
            });
        });
};

// Delete all Match from the database.
exports.deleteAll = (req, res) => {
    Match.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Match were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all Matchs."
            });
        });
};