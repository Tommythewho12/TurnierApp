module.exports = mongoose => {
    const TeamReference = mongoose.model(
        "teamReference",
        mongoose.Schema(
            {
                team: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
                group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
                rank: Number
                // label: String // e.g. "Winner Group 1"
            }
        )
    );

    return TeamReference;
}