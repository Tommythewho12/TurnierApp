import React, { Component } from "react";
import { Link } from "react-router-dom";
import http from "../http-common";
import { withRouter } from '../common/with-router';

import TournamentDataService from "../services/tournament.service.js";
import ScoreTableGroup from "./score-table-group.component.js";
import MatchOrderEditor from "./match-order-editor.component.js";

class ViewTournament extends Component {
    constructor(props) {
        super(props);
        this.getTeamName = this.getTeamName.bind(this);

        this.state = {
            // page controls
            activePhase: undefined,

            // data
            tournament: {},
            matchs: []
        };
    }

    componentDidMount() {
        this.retrieveTournament(this.props.router.params.id);
    }

    retrieveTournament(id) {
        TournamentDataService.get(id)
            .then(response => {
                console.log(response.data);
                this.setState({
                    tournament: response.data
                });
                this.enrichTeamStats(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    enrichTeamStats(tournament) {
        let startPhase = 0;
        const matchss = [];
        tournament.phases.forEach((phase, phaseIndex, phases) => {
            if (phase.concluded) {
                startPhase = (phaseIndex + 1 > phases.length) ? phases.length : phaseIndex + 1;
            }

            phase.groups.forEach((group, groupIndex, groups) => {
                if (group.teams != undefined && group.teams.length > 0) {
                    group.teams = group.teams.map((team, teamIndex) => (
                        {
                            _id: team,
                            name: team != null ? tournament.teams.find(t => t._id === team).name : this.getDescriptionFromTeamReference(group.teamReferences[teamIndex]),
                            score: 0,
                            matchs: 0,
                            wins: 0,
                            losss: 0,
                            draws: 0,
                            pointsScored: 0,
                            pointsSuffered: 0
                        }));
                }
                group.matchs.forEach((match, matchIndex, matchs) => {
                    matchss.push({id: match._id, order: match.order, phase: phaseIndex, group: groupIndex, home: match.homeTeam, guest: match.guestTeam});
                    if (match.concluded) { // TODO this will not allow to see live results / allow only finished results
                        const homeTeam = group.teams.find(t => t._id === match.homeTeam);
                        const guestTeam = group.teams.find(t => t._id === match.guestTeam);
        
                        homeTeam.matchs++;
                        guestTeam.matchs++;
        
                        let setsHome = 0, setsGuest = 0;
                        match.sets.forEach(set => {
                            const scoreHome = Number(set.scoreHome), scoreGuest = Number(set.scoreGuest);
        
                            if (scoreHome > scoreGuest) setsHome++;
                            else if (scoreHome < scoreGuest) setsGuest++;
        
                            homeTeam.pointsScored += scoreHome;
                            homeTeam.pointsSuffered += scoreGuest;
                            guestTeam.pointsScored += scoreGuest;
                            guestTeam.pointsSuffered += scoreHome;
                        });
                        
                        match.homeSets = setsHome;
                        match.guestSets = setsGuest;

                        // TODO fetch points from tournament settings
                        if (setsHome > setsGuest) {
                            homeTeam.score += 2;
                            homeTeam.wins++;
                            guestTeam.losss++;
                        } else if (setsHome < setsGuest) {
                            guestTeam.score += 2;
                            guestTeam.wins++;
                            homeTeam.losss++;
                        } else {
                            homeTeam.score += 1;
                            guestTeam.score += 1;
                            homeTeam.draws++;
                            guestTeam.draws++;
                        }
                    }
                });
                group.teams.sort((a,b) => b.pointsScored - b.pointsSuffered - (a.pointsScored - a.pointsSuffered));
                group.teams.sort((a,b) => b.score - a.score);
            });
        });
        matchss.sort((a,b) => a.order - b.order);

        this.setState({
            activePhase: startPhase,
            tournament: tournament,
            matches: matchss
        });
    }

    getTeamName(teamId) {
        return teamId != undefined ? this.state.tournament.teams.find(t => t._id === teamId).name : "n/a";
    }

    getDescriptionFromTeamReference(teamRef) {
        let result = "";
        switch(teamRef.rank) {
            case 0: result += "1st"; break;
            case 1: result += "2nd"; break;
            case 2: result += "3rd"; break;
            default: result += (teamRef.rank + 1) + "th";
        }
        result += " place of group " + (teamRef.group + 1);
        return result;
    }

    render() {
        const { activePhase, tournament, matches } = this.state;

        return (
            <>
                <div className="row mb-3">
                    <div className="col-3"></div>
                    <div className="col-9">
                        <h1>{tournament.name}</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3">
                        <div className="list-group">
                            <div className={"list-group-item list-group-item-action " + (activePhase === "settings" ? "active" : "")} onClick={() => this.setState({activePhase: "settings", activeGroup: undefined})}>Settings</div>
                            <div className={"list-group-item list-group-item-action " + (activePhase === "matchOrder" ? "active" : "")} onClick={() => this.setState({activePhase: "matchOrder", activeGroup: undefined})}>Match Order</div>
                            {tournament && tournament.phases && tournament.phases.map((phase, phaseIndex) =>
                                <div key={"phase-" + phase._id} className={"list-group-item list-group-item-action " + (activePhase === phaseIndex ? "active" : "")} onClick={() => this.setState({activePhase: phaseIndex, activeGroup: undefined})}>Phase { phaseIndex + 1 }</div>
                            )}
                        </div>
                    </div>
                    <div className="col-9">
                        {tournament && tournament.phases && activePhase === "settings" && (
                            <>
                                <div className="row">
                                    <div className="col">
                                        <Link to={http.getUri() + "/tournaments/" + tournament._id + "/pdf/" + tournament.name.trim().replaceAll(" ", "_")}>
                                            <button className="btn btn-success">
                                                Download Tournament PDF
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-3">
                                        <label htmlFor="inputNoOfFields" className="form-label">Number of Fields</label>
                                        <input type="number" className="form-control" id="noOfFields" disabled value={tournament.noOfFields} />
                                    </div>
                                </div>
                            </>
                        )}
                        {tournament && tournament.phases && activePhase === "matchOrder" && (
                            <>
                                <div className="row">
                                    <h1>Match Order</h1>
                                </div>
                                <div className="row">
                                    <div className="col-1">
                                        Order
                                    </div>
                                    <div className="col-1">
                                        Phase
                                    </div>
                                    <div className="col-1">
                                        Group
                                    </div>
                                    <div className="col-3">
                                        Home Team
                                    </div>
                                    <div className="col-3">
                                        Guest Team
                                    </div>
                                </div>
                                
                                <MatchOrderEditor data={
                                    matches
                                }/>
                            </>
                        )}
                        {tournament && tournament.phases && typeof activePhase === "number" && tournament.phases[activePhase].groups.map((group, groupIndex) => (
                            <div key={"phase-" + activePhase + "-group-" + groupIndex} className="group-container mb-4">
                                <div className="group-header">
                                </div>
                                <div className="group-body">
                                    <ScoreTableGroup group={group} teams={tournament.teams} getTeamName={this.getTeamName} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }
}

export default withRouter(ViewTournament);