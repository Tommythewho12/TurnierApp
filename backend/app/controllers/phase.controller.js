const db = require("../models");
const Phase = db.phases;

exports.create = (req, res) => {
    // Validate request
    if (!req.body.order) {
        res.status(400).send({ message: "You must specify order!" });
        return;
    }

    // Create a Phase
    const phase = new Phase({ order: req.body.order });
    phase
        .save(phase)
        .then(data => { res.send(data); })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the phase."
            });
        });
};

// Retrieve all Phases from the database.
exports.findAll = (req, res) => {
    Phase.find()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Phases."
            });
        });
};

// Find a single Phase with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Phase.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Phase with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Phase with id=" + id });
        });
};

// Update a Phase by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Phase.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Phase with id=${id}. Maybe Phase was not found!`
                });
            } else res.send({ message: "Phase was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Phase with id=" + id
            });
        });
};

// Delete a Phase with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Phase.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Phase with id=${id}. Maybe Phase was not found!`
                });
            } else {
                res.send({
                    message: "Phase was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Phase with id=" + id
            });
        });
};

// Delete all Phase from the database.
exports.deleteAll = (req, res) => {
    Phase.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Phase were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all Phases."
            });
        });
};
