export default mongoose => {
    const Match = mongoose.model(
        "match",
        mongoose.Schema(
            {
                order: Number,
                homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
                guestTeam: { type: mongoose.Schema.Types.ObjectId, ref: "team" },
                sets: [],
                concluded: { type: Boolean, default: false }
            }
        )
    );

    return Match;
};