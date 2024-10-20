import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { withRouter } from '../common/with-router';

class ViewTournament extends Component {
    constructor(props) {
        super(props);
        // this.retrieveTournament = this.retrieveTournament.bind(this);
        // this.getTeamName = this.getTeamName.bind(this);

        this.state = {
            // page controls
            activePhase: 0,

            // data
            tournament: {}
        };
    }

    componentDidMount() {
        this.retrieveTournament(this.props.router.params.id);
        // this.calculateStats();
    }

    retrieveTournament(id) {
        TournamentDataService.get(id)
            .then(response => {
                this.setState({
                    tournament: response.data
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    calculateStats() {
        // this loop creates a map 'teams' and calculates the stats for each
        this.state.tournament.phases[this.activePhase].groups.forEach(group => {
            let teams = {};
            group.matchs.forEach(match => {
                const homeId = match.homeTeam.team._id, guestId = match.guestTeam.team._id;
                if (!teams[homeId]) {
                    teams[homeId] = {id: homeId, name: match.homeTeam.team.name, score: 0, matches: 0, wins: 0, losses: 0, draws: 0, pointsScored: 0, pointsSuffered: 0};
                }
                if (!teams[guestId]) {
                    teams[guestId] = {id: guestId, name: match.guestTeam.team.name, score: 0, matches: 0, wins: 0, losses: 0, draws: 0, pointsScored: 0, pointsSuffered: 0};
                }

                teams[homeId].matches++;
                teams[guestId].matches++;

                let homeSets = 0, guestSets = 0;
                match.sets.forEach(set => {
                    const scoreHome = Number(set.scoreHome), scoreGuest = Number(set.scoreGuest);

                    teams[homeId].score += scoreHome;
                    teams[guestId].score += scoreGuest;

                    if (scoreHome > scoreGuest) homeSets++;
                    else if (scoreHome < scoreGuest) guestSets++;

                    teams[homeId].pointsScored += scoreHome;
                    teams[homeId].pointsSuffered += scoreGuest;
                    teams[guestId].pointsScored += scoreGuest;
                    teams[guestId].pointsSuffered += scoreHome;
                });
                if (homeSets > guestSets) {
                    teams[homeId].wins++;
                    teams[guestId].losses++;
                } else if (homeSets < guestSets) {
                    teams[guestId].wins++;
                    teams[homeId].losses++;
                } else {
                    teams[homeId].draws++;
                    teams[guestId].draws++;
                }
            });
            group.teams = teams;
            console.log("teams", teams)
        });
        this.setState({tournament: {...this.state.tournament, phases: [...this.state.tournament.phases]}});
    }

    getTeamName(teamId) {
        for (let team of this.state.tournament.teams) {
            if (team._id === teamId) {
                return team.name;
            }
        }
        return "n/a";
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
                                    {group.teams && group.teams.map(team => (
                                        <tr>
                                            <td>{this.getTeamName(team)}</td>
                                            <td>{team.matches}</td>
                                            <td>{team.wins}</td>
                                            <td>{team.losses}</td>
                                            <td>{team.score}</td>
                                            <td>{team.pointsScored} : {team.pointsSuffered}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="matches">
                                {group.matchs && group.matchs.map(match => (
                                    <div className="container match-container">
                                        <div className="row home-row">
                                            <div className="col team-name-col">
                                                {this.getTeamName(match.homeTeam)}
                                            </div>
                                            <div className="col score-col">
                                            </div>
                                            {match.sets && match.sets.map(set => (
                                                <div className="col set-score-col">
                                                    {set.scoreHome}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="row guest-row">
                                            <div className="col team-name-col">
                                            {this.getTeamName(match.guestTeam)}
                                            </div>
                                            <div className="col score-col">

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
                                            <tr>
                                                <td>{this.getTeamName(match.homeTeam)}</td>
                                                <td></td>
                                                {match.sets && match.sets.map(set => (
                                                    <td>{set.scoreHome}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td>{this.getTeamName(match.guestTeam)}</td>
                                                <td></td>
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