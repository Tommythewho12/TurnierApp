module.exports = mongoose => {
    const Team = mongoose.model(
        "team",
        mongoose.Schema(
            {
                name: String
            }
        )
    );

    return Team;
};