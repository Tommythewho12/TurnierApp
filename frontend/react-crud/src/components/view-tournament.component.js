import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from '../common/with-router';
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";

import TournamentDataService from "../services/tournament.service.js";
import MyDocument from "../PDF.js";

class ViewTournament extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // page controls
            activePhase: -1,

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
        const { activePhase, tournament } = this.state;

        return (
            <div className="row">
                <div className="col-3">
                    <div className="list-group">
                        <div className={"list-group-item list-group-item-action " + (activePhase === -1 ? "active" : "")} onClick={() => this.setState({activePhase: -1})}>Overview</div>
                        {tournament && tournament.phases && tournament.phases.map((phase, phaseIndex) =>
                            <div className={"list-group-item list-group-item-action " + (activePhase === phaseIndex ? "active" : "")} onClick={() => this.setState({activePhase: phaseIndex})}>Phase { phaseIndex + 1 }</div>
                        )}
                    </div>
                </div>
                <div className="col-9">
                    <h4>Tournaments</h4>
                    {activePhase === -1 && (
                        <div>
                            <PDFDownloadLink document={<MyDocument />} fileName="myPDF.pdf">
                                {({ blob, url, loading, error }) => 
                                    loading ? 'Loading document...' : 'Download now!'
                                }
                            </PDFDownloadLink>
                        </div>
                    )}
                    {tournament && tournament.phases && activePhase >= 0 && tournament.phases[activePhase].groups.map((group, groupIndex) => (
                        <div className="group-container">
                        <div className="group-header">
                        </div>
                        <div className="group-body">
                            <table className="table">
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
                                {group.matchs && group.matchs.map(match => (
                                    <div className="container match-container">
                                        <div className={"row home-row " + (match.sets.reduce((c, v) => (v.scoreHome > v.scoreGuest ? ++c : --c), 0) > 0 && "winner")}>
                                            <div className="col team-name-col">
                                                <Link to={"/matchs/" + match._id}>
                                                    {this.getTeamName(match.homeTeam)}
                                                </Link>
                                            </div>
                                            <div className="col score-col winner-column">
                                            </div>
                                            {match.sets && match.sets.map(set => (
                                                <div className="col set-score-col">
                                                    {set.scoreHome}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={"row guest-row " + (match.sets.reduce((c, v) => (v.scoreHome < v.scoreGuest ? ++c : --c), 0) > 0 && "winner")}>
                                            <div className="col team-name-col">
                                            {this.getTeamName(match.guestTeam)}
                                            </div>
                                            <div className="col score-col winner-column">
                                            </div>
                                            {match.sets && match.sets.map(set => (
                                                <div className="col set-score-col">
                                                    {set.scoreGuest}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="matches">
                                {group.matchs && group.matchs.map(match => (
                                    <div className="container match-container">
                                        <table className="table home-row">
                                        <tr className={((match.sets.reduce((c, v) => (v.scoreHome > v.scoreGuest ? ++c : --c), 0) > 0) ? "winner" : undefined)}>
                                                <td>{this.getTeamName(match.homeTeam)}</td>
                                                <td className="winner-column"></td>
                                                {match.sets && match.sets.map(set => (
                                                    <td>{set.scoreHome}</td>
                                                ))}
                                            </tr>
                                            <tr className={((match.sets.reduce((c, v) => (v.scoreHome < v.scoreGuest ? ++c : --c), 0) > 0) ? "winner" : undefined)}>
                                                <td>{this.getTeamName(match.guestTeam)}</td>
                                                <td className="winner-column"></td>
                                                {match.sets && match.sets.map(set => (
                                                    <td>{set.scoreGuest}</td>
                                                ))}
                                            </tr>
                                        </table>
                                    </div>
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