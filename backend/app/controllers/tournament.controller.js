const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
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
        noOfFields: req.body.noOfFields,
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
            phaseOrder: "$phases.order",
            groupId: "$phases.groups._id",
            groupOrder: "$phases.groups.order",
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
            guestTeam.score += 1;
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

    Tournament
        .findById(id)
        .populate({
            path: "teams"
        })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Not found Tournament with id " + id });
            } else {
                writePdf(data, res);
            }
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send({ message: "Error retrieving Tournament with id=" + id });
        });
};

const cm = 595.28 / 21;

const styles = {
    pageWidth: 595.28,
    pagePadding: 40,
    margin: 8,
    defaultFontSize: 15,
    qrCodeSize: 100,
    placeHolderBg: "#DCDCDC",
    teamNamePlaceHolder: {
        height: 0.6 * cm
    },
    scorePlaceHolder: {
        width: 3 * cm,
        height: 1 * cm
    },
    teamPlaceHolder: {
        width: 1 * cm,
        height: 1 * cm
    },
};

async function writePdf(data, res) {
    const doc = new PDFDocument({
        size:"A4",
        autoFirstPage: false,
        Author:"TournamentApp made by Tommythewho12",
    });

    doc.pipe(res);

    for (let phase of data.phases) {
        for (let group of phase.groups) {
            for (let match of group.matchs) {
                doc.addPage({margin: styles.pagePadding});
                doc.fontSize(30);
                doc.text(`Turnierspielbogen`, {
                    width: styles.pageWidth - 2 * styles.pagePadding - styles.qrCodeSize,
                    align: "center"
                });
                const matchInfoBoxY = doc.currentLineHeight() + 16;

                doc.fontSize(styles.defaultFontSize);
                const matchInfoColumn0Width = doc.widthOfString("Schiedsgericht");
                const matchInfoColumn2Width = doc.widthOfString("Feld");
                const matchInfoColumn3Width = doc.widthOfString("00");

                let x = styles.pagePadding;
                let x1 = styles.pagePadding + matchInfoColumn0Width + styles.margin;
                let x3 = styles.pageWidth - (styles.pagePadding + styles.qrCodeSize + matchInfoColumn3Width + styles.margin * 2);
                let x2 = x3 - (matchInfoColumn2Width + styles.margin);
                let y = styles.pagePadding + matchInfoBoxY;
                let y1 = y + doc.currentLineHeight() + styles.margin;
                let y2 = y1 + doc.currentLineHeight() + styles.margin;
                doc.text("Team A", x, y);
                doc.text("Team B", x, y1);
                doc.text("Schiedsgericht", x, y2);

                match.homeTeam == null ?
                    doc.rect(x1, y + doc.currentLineHeight() / 2 - styles.teamNamePlaceHolder.height / 2, x2 - x1 - styles.margin, styles.teamNamePlaceHolder.height).fill(styles.placeHolderBg) : 
                    doc.fillColor("black").text(data.teams.find(t => t._id.toString() === match.homeTeam.toString()).name, x1, y);
                match.guestTeam == null ?
                    doc.rect(x1, y1 + doc.currentLineHeight() / 2 - styles.teamNamePlaceHolder.height / 2, x2 - x1 - styles.margin, styles.teamNamePlaceHolder.height).fill(styles.placeHolderBg) :
                    doc.fillColor("black").text(data.teams.find(t => t._id.toString() === match.guestTeam.toString()).name, x1, y1);
                // TODO referee not provided dynamically yet
                doc.rect(x1, y2 + doc.currentLineHeight() / 2 - styles.teamNamePlaceHolder.height / 2, x2 - x1 - styles.margin, styles.teamNamePlaceHolder.height).fill(styles.placeHolderBg)

                // Group name, field not implemented existant
                // doc.fillColor("black").text("Grp", x2, y);
                // doc.text("Feld", x2, y1);
                // doc.text("", x2, y2);

                // doc.text("1", x3, y);
                // doc.text("A", x3, y1);
                // doc.text("", x3, y2);

                doc.image(await QRCode.toDataURL("http://192.168.0.154:8081/matchs/" + match._id.toString()), styles.pageWidth - styles.pagePadding - styles.qrCodeSize, styles.pagePadding, {height: styles.qrCodeSize});
                // doc.image(await QRCode.toDataURL("http://94.114.43.121:80/matchs/" + match._id.toString()), styles.pageWidth - styles.pagePadding - styles.qrCodeSize, styles.pagePadding, {height: styles.qrCodeSize});
                
                // TODO replace hardcoded noOfSets
                const noOfSets = 3;
                const scoreTableWidth = doc.widthOfString("Teams") + 4 * styles.margin + 2 * styles.teamPlaceHolder.width;
                const xs = [];
                for (let i = 0; i < noOfSets; i++) {
                    xs.push(styles.pagePadding + (i * scoreTableWidth) + (i + 1) * (((styles.pageWidth - 2 * styles.pagePadding) - (noOfSets * scoreTableWidth)) / (noOfSets + 1)));
                }
                
                y = y2 + doc.currentLineHeight() + styles.margin;
                y1 = y + styles.margin;
                y2 = y1 + styles.margin + doc.currentLineHeight();
                let y3 = y2 + doc.currentLineHeight() / 2 - styles.teamPlaceHolder.height / 2;
                let y4 = Math.max(y2 + styles.margin + doc.currentLineHeight(), y3 + styles.teamPlaceHolder.height + styles.margin);
                let y5 = y4 + doc.currentLineHeight() * 30 + styles.margin;
                let y6 = y5 + doc.currentLineHeight() + styles.margin;
                let y7 = y6 + styles.scorePlaceHolder.height + styles.margin
                for (let i = 0; i < noOfSets; i++) {
                    doc.fillColor("black");
                    doc.fontSize(styles.defaultFontSize);
                    doc.rect(xs[i], y, scoreTableWidth, y7 - y).stroke();
                    doc.text("Satz " + (i+1), xs[i], y1, {
                        width: scoreTableWidth,
                        align: "center"
                    });
                    doc.text("Teams", xs[i], y2, {
                        width: scoreTableWidth,
                        align: "center"
                    });
                    
                    doc.rect(
                        xs[i] + styles.margin,
                        y3,
                        styles.teamPlaceHolder.width,
                        styles.teamPlaceHolder.height).fill(styles.placeHolderBg);
                    doc.rect(
                        xs[i] + scoreTableWidth - styles.margin - styles.teamPlaceHolder.width,
                        y3,
                        styles.teamPlaceHolder.width,
                        styles.teamPlaceHolder.height).fill();

                    // mark-off-scores
                    doc.fontSize(12);
                    doc.fillColor("black");
                    doc.text("", xs[i] + styles.margin, y4);
                    for (let i = 1; i <= 30; i++) {
                        doc.text(i, {
                            align: "center",
                            width: styles.teamPlaceHolder.width,
                        });
                    }
                    doc.text("", xs[i] + scoreTableWidth - styles.margin - styles.teamPlaceHolder.width, y4);
                    for (let i = 1; i <= 30; i++) {
                        doc.text(i, {
                            align: "center",
                            width: styles.teamPlaceHolder.width,
                        });
                    }

                    doc.fontSize(styles.defaultFontSize);
                    doc.text("Ergebnis", xs[i], y5, {
                        width: scoreTableWidth,
                        align: "center"
                    });

                    doc.rect(xs[i] + (scoreTableWidth - styles.scorePlaceHolder.width) / 2, y6, styles.scorePlaceHolder.width, styles.scorePlaceHolder.height).fill(styles.placeHolderBg);
                    doc.fillColor("black").text(":", xs[i], y6 + styles.scorePlaceHolder.height / 2, {
                        width: scoreTableWidth,
                        align: "center",
                        baseline: "middle"
                    });
                }

                let y8 = y7 + styles.margin;
                let y9 = y8 + styles.scorePlaceHolder.height / 2;
                x = styles.pagePadding;
                const winnerTxt = "Gewinner", sets = "Sätze", points = "Punkte";
                x1 = x + doc.widthOfString(winnerTxt) + styles.margin;
                const x5 = styles.pageWidth - styles.pagePadding - styles.scorePlaceHolder.width;
                const x4 = x5 - styles.margin - doc.widthOfString(points);
                x3 = x4 - styles.margin - styles.scorePlaceHolder.width;
                x2 = x3 - styles.margin - doc.widthOfString(sets);
                doc.rect(x1, y8, x2 - x1 - styles.margin, styles.scorePlaceHolder.height).fill(styles.placeHolderBg);
                doc.rect(x3, y8, styles.scorePlaceHolder.width, styles.scorePlaceHolder.height).fill();
                doc.rect(x5, y8, styles.scorePlaceHolder.width, styles.scorePlaceHolder.height).fill();

                doc.fillColor("black").text(winnerTxt, x, y9, { baseline: "middle" });
                doc.text(sets, x2, y9, { baseline: "middle" });
                doc.text(points, x4, y9, { baseline: "middle" });
                doc.text(":", x3, y9, {
                    width: styles.scorePlaceHolder.width,
                    align: "center",
                    baseline: "middle"
                });
                doc.text(":", x5, y9, {
                    width: styles.scorePlaceHolder.width,
                    align: "center",
                    baseline: "middle"
                });
            }
        }
    }

    doc.end();
}