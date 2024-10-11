module.exports = mongoose => {
    const Group = mongoose.model(
        "group",
        mongoose.Schema(
            {
                phase: { type: mongoose.Schema.Types.ObjectId, ref: "phase" },
                number: Number, // TODO: rename to order?
                noOfTeams: Number
                // name: String
            }
        )
    );

    return Group;
}