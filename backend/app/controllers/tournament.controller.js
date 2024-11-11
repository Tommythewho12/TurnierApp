const db = require("../models");
const PDFDocument = require("pdfkit");
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

    // const pdf = createPdf(req.body);

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
    // TODO improve result. Only return tournament names
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
    const matchId = req.params.matchId;

    Tournament
        .aggregate()
        .match({ "phases.groups.matchs._id": db.mongoose.Types.ObjectId.createFromHexString(matchId) })
        .unwind("$phases")
        .unwind("$phases.groups")
        .unwind("$phases.groups.matchs")
        .lookup({ "from": "teams", "localField": "phases.groups.matchs.homeTeam", "foreignField": "_id", "as": "homeTeamData" })
        .lookup({ "from": "teams", "localField": "phases.groups.matchs.guestTeam", "foreignField": "_id", "as": "guestTeamData" })
        .match({ "phases.groups.matchs._id": db.mongoose.Types.ObjectId.createFromHexString(matchId) })
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
            }
        })
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
exports.concludeMatch = async (req, res) => {
    const tournamentId = req.params.tournamentId;
    const phaseId = req.params.phaseId;
    const groupId = req.params.groupId;
    const matchId = req.params.matchId;

    try {
        let tournamentDoc = await Tournament.findById(tournamentId);
        tournamentDoc.phases.id(phaseId).groups.id(groupId).matchs.id(matchId).concluded = true;

        if (tournamentDoc.phases.id(phaseId).groups.id(groupId).matchs.every(match => match.concluded === true)) {
            tournamentDoc.phases.id(phaseId).groups.id(groupId).concluded = true;

            const currentPhaseOrder = tournamentDoc.phases.id(phaseId).order;
            const currentGroupOrder = tournamentDoc.phases.id(phaseId).groups.id(groupId).order;

            const rankedTeams = getTeamsRanked(tournamentDoc, currentPhaseOrder, currentGroupOrder);

            // update all group.teams that reference this group
            tournamentDoc.phases.forEach((phase, phaseIndex) => {
                if (phase.order > tournamentDoc.phases.id(phaseId).order) {
                    phase.groups.forEach((group, groupIndex) => {
                        group.teamReferences.forEach((teamRef, teamRefIndex) => {
                            if (teamRef.phase === currentPhaseOrder && teamRef.group === currentGroupOrder) {
                                group.teams[teamRefIndex] = rankedTeams[teamRef.rank];
                                if (group.teams.every(team => team != undefined)) {
                                    group.matchs = group.matchs.map((match, i) => ({
                                        ...match, 
                                        homeTeam: group.teams[i % group.teams.length],
                                        guestTeam: group.teams[(i + Math.floor(i / group.teams.length) + 1) % group.teams.length]}));
                                }
                            }
                        })
                    })
                }
            });

            if (tournamentDoc.phases.id(phaseId).groups.every(group => group.concluded === true)) {
                tournamentDoc.phases.id(phaseId).concluded = true;
            }
        }

        tournamentDoc.save().then(data => {
            res.send(data);
        });
    } catch (err) {
        console.error("error while concluding match with id: " + matchId, err);
        res
            .status(500)
            .send({message: "An internal server error has occured."});
    }
};

function getTeamsRanked(tournamentDoc, phaseOrder, groupOrder) {
    const teams = [];
    tournamentDoc.phases[phaseOrder].groups[groupOrder].teams.forEach(team => {
        teams.push({_id: team._id, score: 0, pointsScored: 0, pointsSuffered: 0});
    });

    tournamentDoc.phases[phaseOrder].groups[groupOrder].matchs.forEach(match => {
        const homeTeam = teams.find(t => t._id.toString() === match.homeTeam.toString());
        const guestTeam = teams.find(t => t._id.toString() === match.guestTeam.toString());

        let setsHome = 0;
        let setsGuest = 0;
        match.sets.forEach(set => {
            const scoreHome = Number(set.scoreHome);
            const scoreGuest = Number(set.scoreGuest);
            if (scoreHome > scoreGuest) setsHome++;
            else if (scoreHome < scoreGuest) setsGuest++;

            homeTeam.pointsScored += scoreHome;
            guestTeam.pointsScored += scoreGuest;
            homeTeam.pointsSuffered += scoreGuest;
            guestTeam.pointsSuffered += scoreHome;
        });

        // TODO fetch points from tournament settings
        if (setsHome > setsGuest) {
            homeTeam.score += 2;
        } else if (setsHome < setsGuest) {
            guestTeam.score += 2;
        } else {
            homeTeam.score += 1;
            homeGuest.score += 1;
        }
    });

    return teams
            .sort((a,b) => (b.pointsScored - b.pointsSuffered) - (a.pointsScored - a.pointsSuffered))
            .sort((a,b) => b.score - a.score);
}

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
            res.send(data.phases.id(phaseId).groups.id(groupId).matchs.id(matchId).sets[setOrder]);
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

// create and fetch PDF document of tournament
exports.fetchPDF = (req, res) => {
    const id = req.params.tournamentId;
    const pdf = new PDFDocument({
        size:"A4",
        autoFirstPage: false,
        Author:"TournamentApp made by Tommythewho12",
    });

    Tournament
        .findById(id)
        .populate({
            path: "teams"
        })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Not found Tournament with id " + id });
            } else {
                writePdf(pdf, data, res);
                res.send();
            }
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Error retrieving Tournament with id=" + id });
        });
};

const styles = {
    pageWidth: 595.28,
    pagePadding: 72,
    margin: 5,
    qrCodeWidth: 80
};

function writePdf(doc, data, res) {
    doc.addPage();
    doc.fontSize(24);
    doc.text(`Turnierspielbogen`, {
        align: "center"
    });
    const matchInfoBoxY = doc.currentLineHeight() + 16;

    doc.fontSize(10);
    const matchInfoColumn0Width = doc.widthOfString("Schiedsgericht");
    const matchInfoColumn2Width = doc.widthOfString("Feld");
    const matchInfoColumn3Width = doc.widthOfString("00");

    doc.text("Team A", styles.pagePadding, styles.pagePadding + matchInfoBoxY);
    doc.moveDown(0.3);
    doc.text("Team B");
    doc.moveDown(0.3);
    doc.text("Schiedsgericht");

    doc.text("Platzhalter", styles.pagePadding + matchInfoColumn0Width + styles.margin, styles.pagePadding + matchInfoBoxY);
    doc.moveDown(0.3);
    doc.text("Platzhalter");
    doc.moveDown(0.3);
    doc.text("Platzhalter");

    doc.text("Gr", styles.pageWidth - (styles.pagePadding + styles.qrCodeWidth + matchInfoColumn3Width + matchInfoColumn2Width + styles.margin * 2), styles.pagePadding + matchInfoBoxY);
    doc.moveDown(0.3);
    doc.text("Feld");

    doc.text("1", styles.pageWidth - (styles.pagePadding + styles.qrCodeWidth + matchInfoColumn3Width + styles.margin), styles.pagePadding + matchInfoBoxY);
    doc.moveDown(0.3);
    doc.text("A");

    // close document
    doc.pipe(res);
    doc.end();
}