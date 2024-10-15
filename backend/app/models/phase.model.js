module.exports = mongoose => {
    const Phase = mongoose.model(
        "phase",
        mongoose.Schema(
            {
                order: Number,
                groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "group" }]
            }
        )
    );

    return Phase;
};