module.exports = mongoose => {
    const Tournament = mongoose.model(
        "tournament",
        mongoose.Schema(
            {
                name: String
            }
        )
    );

    return Tournament;
};