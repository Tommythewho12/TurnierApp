const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tutorials = require("./tutorial.model.js")(mongoose);
db.teams = require("./team.model.js")(mongoose);
db.teamReferences = require("./team-reference.model.js")(mongoose);
db.matchs = require("./match.model.js")(mongoose);
db.groups = require("./group.model.js")(mongoose);
db.phases = require("./phase.model.js")(mongoose);


module.exports = db;
