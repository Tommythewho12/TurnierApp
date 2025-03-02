module.exports = mongoose => {
    const TeamReferenceSchema = new mongoose.Schema({
        phase: Number,
        group: Number,
        rank: Number
    });

    const SetSchema = new mongoose.Schema({
        order: Number,
        scoreHome: { type: Number, default: 0 },
        scoreGuest: { type: Number, default: 0 },
        concluded: { type: Boolean, default: false }
    });

    const MatchSchema = new mongoose.Schema({
        order: Number,
        field: Number,
        homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
        guestTeam: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
        sets: [ SetSchema ],
        concluded: { type: Boolean, default: false }
    });

    const GroupSchema = new mongoose.Schema({
        order: Number,
        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
        teamReferences: [ TeamReferenceSchema ],
        matchs: [ MatchSchema ],
        concluded: { type: Boolean, default: false }
    });

    const PhaseSchema = new mongoose.Schema({
        order: Number,
        groups: [ GroupSchema ],
        concluded: { type: Boolean, default: false }
    });

    const Tournament = mongoose.model(
        "tournament",
        mongoose.Schema(
            {
                name: String,
                noOfFields: Number,
                teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
                phases: [ PhaseSchema ]
            }
        )
    );

    return Tournament;
};