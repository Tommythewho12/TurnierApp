const db = require("../models");
const Group = db.groups;

exports.create = (req, res) => {
    // Validate request
    if (!req.body.phase || !req.body.number || !req.body.noOfTeams) {
        res.status(400).send({ message: "You must specify phase, number and noOfTeams!" });
        return;
    }

    // Create a Group
    const group = new Group({
        phase: req.body.phase,
        number: req.body.number,
        size: req.body.size
    });

    group.save(group)
        .then(data => { res.send(data); })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the group."
            });
        });
};

// Retrieve all Groups from the database.
exports.findAll = (req, res) => {
    Group.find()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Groups."
            });
        });
};

// Find Groups linked to Phase with id phaseId
exports.findAllByPhaseId = (req, res) => {
    const id = req.params.phaseId;
    Group.find({ phase: id })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Groups."
            });
        });
};

// Find a single Group with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Group.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Group with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Group with id=" + id });
        });
};

// Update a Group by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Group.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Group with id=${id}. Maybe Group was not found!`
                });
            } else res.send({ message: "Group was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Group with id=" + id
            });
        });
};

// Delete a Group with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Group.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Group with id=${id}. Maybe Group was not found!`
                });
            } else {
                res.send({
                    message: "Group was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Group with id=" + id
            });
        });
};

// Delete all Group from the database.
exports.deleteAll = (req, res) => {
    Group.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Group were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all Groups."
            });
        });
};