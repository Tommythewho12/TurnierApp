export default mongoose => {
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

// import mongoose from "mongoose";

// const {Schema} = mongoose;

// const teamReferenceSchema = new Schema({
//     team: { type: Schema.Types.ObjectId, ref: "team" },
//     group: { type: Schema.Types.ObjectId, ref: "group" },
//     rank: Number
//     // label: String // e.g. "Winner Group 1"
// });

// const TeamReference = mongoose.model("teamReference", teamReferenceSchema);
// export default TeamReference;