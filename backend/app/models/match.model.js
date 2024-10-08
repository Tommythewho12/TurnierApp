module.exports = mongoose => {
    const Match = mongoose.model(
        "match",
        mongoose.Schema(
            {
                group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
                order: Number,
                homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "teamReference" },
                guestTeam: { type: mongoose.Schema.Types.ObjectId, ref: "teamReference" },
                sets: []
                // homeTeamLabel: String
                // guestTeamLabel: String
                // field: String, 
                // time: DateTime
            }
        )
    );

    return Match;
};