import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { withRouter } from '../common/with-router';

class ViewTournament extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // page controls
            activePhase: 0,

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
        tournament.phases[this.state.activePhase].groups.forEach((group, groupIndex, groups) => {
            group.teams = group.teams.map(team => (
                {
                    _id: team,
                    name: tournament.teams.find(t => t._id === team).name,
                    score: 0,
                    matchs: 0,
                    wins: 0,
                    losss: 0,
                    draws: 0,
                    pointsScored: 0,
                    pointsSuffered: 0
                }));
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
                    if (setsHome > setsGuest) {
                        homeTeam.score += 2;
                        homeTeam.wins++;
                        guestTeam.losses++;
                    } else if (setsHome < setsGuest) {
                        guestTeam.score += 2;
                        guestTeam.wins++;
                        homeTeam.losses++;
                    } else {
                        homeTeam.score += 1;
                        guestTeam.score += 1;
                        homeTeam.draws++;
                        guestTeam.draws++;
                    }
                }
            });
        });
        
        this.setState({tournament: tournament});
    }

    getTeamName(teamId) {
        for (let team of this.state.tournament.teams) {
            if (team._id === teamId) {
                return team.name;
            }
        }
        return "n/a";
    }

    isWinnerHomeTeam(sets) {
        return 
    }

    isWinnerGuestTeam(sets) {
        console.log("sets", sets);
        let x = sets.reduce((c, v) => v.scoreHome > v.scoreGuest ? c++ : c--, 0)
        return x < 0;
    }

    render() {
        const { activePhase, tournament } = this.state;

        return (
            <div className="row">
                <div className="col-3"></div>
                <div className="col-9">
                    <h4>Tournaments</h4>
                    {tournament && tournament.phases && tournament.phases[activePhase].groups.map((group, groupIndex) => (
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
                                                {this.getTeamName(match.homeTeam)}
                                            </div>
                                            <div className="col score-col winner-column">
                                            </div>
                                            {match.sets && match.sets.map(set => (
                                                <div className="col set-score-col">
                                                    {set.scoreHome}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={"row guest-row " + (match.sets.reduce((c, v) => (v.scoreHome > v.scoreGuest ? ++c : --c), 0) < 0 && "winner")}>
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
                                        <tr className={(match.sets.reduce((c, v) => (v.scoreHome > v.scoreGuest ? ++c : --c), 0) > 0 && "winner")}>
                                                <td>{this.getTeamName(match.homeTeam)}</td>
                                                <td className="winner-column"></td>
                                                {match.sets && match.sets.map(set => (
                                                    <td>{set.scoreHome}</td>
                                                ))}
                                            </tr>
                                            <tr className={(match.sets.reduce((c, v) => (v.scoreHome > v.scoreGuest ? ++c : --c), 0) < 0 && "winner")}>
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