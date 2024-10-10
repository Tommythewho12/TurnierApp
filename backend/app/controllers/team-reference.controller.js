const db = require("../models");
const TeamReference = db.teamReferences;

// Create and Save a new TeamReference
exports.create = (req, res) => {
    // Validate request
    if (req.body.team ^ (req.body.group && req.body.rank)) {
        res.status(400).send({ message: "Content must either be a team id or a group id and rank!" });
        return;
    }

    // Create a TeamReference
    const team = new TeamReference({
        team: req.body.team,
        group: req.body.group,
        rank: req.body.rank
    });

    // Save TeamReference in the database
    team
        .save(team)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the TeamReference."
            });
        });
};

// Retrieve all TeamReferences from the database.
// exports.findAll = (req, res) => {
//     TeamReference.find({})
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while retrieving TeamReferences."
//             });
//         });
// };

// Find all TeamReferences by groupId
exports.findAllByGroupId = (req, res) => {
    const id = req.params.groupId;
    TeamReference.find({ group: id })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving TeamReferences."
            });
        });
};

// Find a single TeamReference by id
exports.findOne = (req, res) => {
    const id = req.params.id;

    TeamReference.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found TeamReference with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving TeamReference with id=" + id });
        });
};

// Find a single TeamReference by teamId
exports.findOneByTeamId = (req, res) => {
    const id = req.params.teamId;
    TeamReference.find({ team: id })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving TeamReferences."
            });
        });
};

// Update a TeamReference by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    TeamReference.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update TeamReference with id=${id}. Maybe TeamReference was not found!`
                });
            } else res.send({ message: "TeamReference was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating TeamReference with id=" + id
            });
        });
};

// Delete a TeamReference with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    TeamReference.findByIdAndRemove(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete TeamReference with id=${id}. Maybe TeamReference was not found!`
                });
            } else {
                res.send({
                    message: "TeamReference was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete TeamReference with id=" + id
            });
        });
};

// Delete all Teams from the database.
exports.deleteAll = (req, res) => {
    TeamReference.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Teams were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all TeamReferences."
            });
        });
};
