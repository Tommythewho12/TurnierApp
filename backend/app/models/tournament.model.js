module.exports = mongoose => {
    const TeamReferenceSchema = new mongoose.Schema({
        // ref: { type: mongoose.Schema.Types.ObjectId, ref: "teamReference" },
        phase: Number,
        group: Number,
        rank: Number
    });

    const MatchsSchema = new mongoose.Schema({
        order: Number,
        homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
        guestTeam: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
        sets: [],
        concluded: { type: Boolean, default: false }
    });

    const GroupSchema = new mongoose.Schema({
        order: Number,
        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
        teamReferences: [TeamReferenceSchema],
        matchs: [MatchsSchema]
    });

    const PhaseSchema = new mongoose.Schema({
        order: Number,
        groups: [GroupSchema]
    });

    const Tournament = mongoose.model(
        "tournament",
        mongoose.Schema(
            {
                name: String,
                teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
                phases: [PhaseSchema]
            }
        )
    );

    return Tournament;
};