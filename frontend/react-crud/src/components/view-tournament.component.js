import React, { Component } from "react";
import { Link } from "react-router-dom";
import http from "../http-common";
import { withRouter } from '../common/with-router';

import TournamentDataService from "../services/tournament.service.js";

class ViewTournament extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // page controls
            activePhase: 0,
            activeGroup: undefined,

            // data
            tournament: {}
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
        tournament.phases.forEach((phase, phaseIndex, phases) => {
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
            });
        });

        this.setState({tournament: tournament});
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
        const { activePhase, activeGroup, tournament } = this.state;

        return (
            <div className="row">
                <div className="col-3">
                    <div className="list-group">
                        <div className={"list-group-item list-group-item-action " + (activePhase === -1 ? "active" : "")} onClick={() => this.setState({activePhase: -1, activeGroup: undefined})}>Overview</div>
                        {tournament && tournament.phases && tournament.phases.map((phase, phaseIndex) =>
                            <div key={"phase-" + phase._id} className={"list-group-item list-group-item-action " + (activePhase === phaseIndex ? "active" : "")} onClick={() => this.setState({activePhase: phaseIndex, activeGroup: undefined})}>Phase { phaseIndex + 1 }</div>
                        )}
                    </div>
                </div>
                <div className="col-9">
                    <h4>Tournaments</h4>
                    {tournament && tournament.phases && activePhase === -1 && (
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
                        </>
                    )}
                    {tournament && tournament.phases && activePhase >= 0 && tournament.phases[activePhase].groups.map((group, groupIndex) => (
                        <div className="group-container">
                            <div className="group-header">
                            </div>
                            <div className="group-body">
                                <table className="table" onClick={() => {this.setState({activeGroup: groupIndex === activeGroup ? undefined : groupIndex})}}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Spiele</th>
                                            <th>Siege</th>
                                            <th>Niederlagen</th>
                                            <th>Punkte</th>
                                            <th>Punktdifferenz</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.teams != null && group.teams.map(team => (
                                            <tr>
                                                <td>{team.name}</td>
                                                <td>{team.matchs}</td>
                                                <td>{team.wins}</td>
                                                <td>{team.losss}</td>
                                                <td>{team.score}</td>
                                                <td>{team.pointsScored} : {team.pointsSuffered}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div className="matches">
                                        {group.matchs && activeGroup === groupIndex && group.matchs.map(match => (
                                            <>
                                                <div className="row align-items-center">
                                                    <div className="col text-center text-truncate">
                                                        <h3>
                                                            <Link to={"/matchs/" + match._id}>
                                                                {this.getTeamName(match.homeTeam)}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    <div className="col-auto">
                                                        <h2 className={(match.homeSets > match.guestSets ? "fw-bold" : "")}>{match.homeSets ? match.homeSets : 0}</h2>
                                                    </div>
                                                    <div className="col-auto score-divider">
                                                        <h2>:</h2>
                                                    </div>
                                                    <div className="col-auto">
                                                        <h2 className={(match.homeSets < match.guestSets ? "fw-bold" : "")}>{match.guestSets ? match.guestSets : 0}</h2>
                                                    </div>
                                                    <div className="col text-center text-truncate">
                                                        <h3>
                                                            {this.getTeamName(match.guestTeam)}
                                                        </h3>
                                                    </div>
                                                </div>
                                                {match.sets && match.sets.map(set => (
                                                    <div className="row">
                                                        <div className="col text-center">
                                                            <h4>
                                                                {set.scoreHome ? set.scoreHome : 0} : {set.scoreGuest ? set.scoreGuest : 0}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withRouter(ViewTournament);