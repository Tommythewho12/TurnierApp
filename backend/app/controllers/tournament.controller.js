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

    Tournament
        .find()
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
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all tournaments."
            });
        });
};

// Matches
// Find a single Match
exports.findMatch = (req, res) => {
    const tournamentId = req.params.tournamentId;
    const phase = req.params.phase;
    const group = req.params.group;
    const match = req.params.match;

    Tournament
        .findById(tournamentId)
        .populate("phases.groups.matchs.homeTeam")
        .populate("phases.groups.matchs.guestTeam")
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Tournament with id " + tournamentId });
            if (!data.phases[phase])
                res.status(404).send({ message: "Not found phase " + phase + " for Tournament with id " + tournamentId });
            if (!data.phases[phase].groups[group])
                res.status(404).send({ message: "Not found group " + group + " in phase + " + phase + " for Tournament with id " + tournamentId });
            if (!data.phases[phase].groups[group].matchs[match])
                res.status(404).send({ message: "Not found match " + match + " in group " + group + " in phase + " + phase + " for Tournament with id " + tournamentId });
            
            res.send({match: data.phases[phase].groups[group].matchs[match]});
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Tournament with id=" + tournamentId });
        });
};

// Update a single Match
exports.updateMatch = (req, res) => {
    const tournamentId = req.params.tournamentId;
    const phase = req.params.phase;
    const group = req.params.group;
    const match = req.params.match;

    // Tournament
    //     .update(
    //         { 
    //         },
    //         {}
    //     )
}