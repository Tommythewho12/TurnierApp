module.exports = mongoose => {
    const Phase = mongoose.model(
        "phase",
        mongoose.Schema(
            {
                // tournament: { type: mongoose.Schema.Types.ObjectId, ref: "tournament" },
                order: Number
                // time: someTime
            }
        )
    );

    return Phase;
};