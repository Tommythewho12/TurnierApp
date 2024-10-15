module.exports = mongoose => {
    const Group = mongoose.model(
        "group",
        mongoose.Schema(
            {
                order: Number,
                teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
                teamReferences: [{ type: mongoose.Schema.Types.ObjectId, ref: "teamReference" }],
                matchs: [{ type: mongoose.Schema.Types.ObjectId, ref: "match" }]
            }
        )
    );

    return Group;
}