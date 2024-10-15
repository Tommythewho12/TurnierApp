module.exports = mongoose => {
    const Tournament = mongoose.model(
        "tournament",
        mongoose.Schema(
            {
                name: String,
                teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
                phases: [{ type: mongoose.Schema.Types.ObjectId, ref: "phase" }]
            }
        )
    );

    return Tournament;
};