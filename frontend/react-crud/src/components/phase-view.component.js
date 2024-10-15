import React, { Component } from "react";
import PhaseDataService from "../services/phase.service.js";
import GroupDataService from "../services/group.service.js";
import MatchDataService from "../services/match.service.js";
import { withRouter } from '../common/with-router';

class Team {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class PhaseView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: []
        };
    }

    componentDidMount() {
        this.getPhase();
        this.getGroups();
    }

    getPhase() {
        PhaseDataService
            .get(this.props.router.params.id)
            .then(response => {
                this.setState({phase: {id: response.data._id, order: response.data.order}});
            })
            .catch(e => {
                console.log(e);
            });
    }

    getGroups() {
        GroupDataService.getByPhaseId(this.props.router.params.id)
            .then(response => {
                this.getMatchs(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    async getMatchs(groups) {
        const promises = [];
        groups.forEach((group, index) => {
            const promise = MatchDataService.getByGroupId(group._id)
                .then(response => {
                    group.matchs = response.data;
                })
                .catch(e => {
                    console.log(e);
                });
            promises.push(promise);
        });
        await Promise.all(promises);
        this.calculateScoreForEachTeam(groups);
    }

    getTeamNameFromTeamReference(team) {

    }

    calculateScoreForEachTeam(groups) {
        // this loop creates a map 'teams' and calculates the stats for each
        groups.forEach(group => {
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
        this.setState({groups: groups});
    }

    render() {
        const { groups } = this.state;

        return (
            <div>
                {groups && groups.map(group => (
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
                                    {group.teams && Object.values(group.teams).map(team => (
                                        <tr>
                                            <td>{team.name}</td>
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
                                                {match.homeTeam.team.name}
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
                                                {match.guestTeam.team.name}
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
                                                <td>{match.homeTeam.team.name}</td>
                                                <td></td>
                                                {match.sets && match.sets.map(set => (
                                                    <td>{set.scoreHome}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td>{match.guestTeam.team.name}</td>
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
        );
    }
}

export default withRouter(PhaseView);