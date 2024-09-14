import React, { Component } from "react";
import GroupDataService from "../services/group.service.js";
import MatchDataService from "../services/match.service.js";
import { Link } from "react-router-dom";
import { withRouter } from '../common/with-router';

class PhaseView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: []
        };
    }

    componentDidMount() {
        this.getGroups();
        console.log("finally", this.state);
    }

    getGroups() {
        GroupDataService.getByPhaseId(this.props.router.params.id)
            .then(response => {
                this.setState({
                    groups: response.data
                });
                this.getMatchs();
            })
            .catch(e => {
                console.log(e);
            });
    }

    getMatchs() {
        this.state.groups.forEach((group, index) => {
            MatchDataService.getByGroupId(group._id)
                .then(response => {
                    this.handleshit(index, response.data);
                    this.calculateStuff();
                })
                .catch(e => {
                    console.log(e);
                })
        });
    }

    handleshit(index, matchs) {
        const nextGroups = this.state.groups.map((group, i) => {
            if (i === index) {
                group.matchs = matchs;
                this.getTeamInfo(group, matchs);
                return group;
            } else {
                return group;
            }
        });
        console.log("nextGroups", nextGroups);
        this.setState(nextGroups);
    }

    getTeamInfo(group, matchs) {
        // find all teams for each group to display
        const teams = new Set();
        console.log("new set");
        const x = matchs.map((match) => {
            teams.add(match.homeTeam); // make sure only adding homeTeam fills the lists properly
            // TODO count points for teams as well
            console.log("teams", teams);
        })
        group.teams = Array.from(teams);
        return;
    }

    calculateScores() {
        this.groups.forEach(group => {
            group.matchs.forEach(match => {
                let homeScore = 0, guestScore = 0;
                match.sets.forEach(set => {
                    homeScore += set.homeScore;
                    guestScore += set.guestScore;
                });
            })
        })
    }

    calculateStuff() {
        let teams = new Map();
        
        this.state.groups.forEach(group => {
            group.matchs.forEach(match => {
                if (!teams.has(match.homeTeam)) {
                    teams.set(match.homeTeam, {score: 0});
                }
                if (!teams.has(match.guestTeam)) {
                    teams.set(match.guestTeam, {score: 0});
                }
                match.sets.forEach(set => {
                    teams.get(match.homeTeam).score += Number(set.scoreHome);
                    teams.get(match.guestTeam).score += Number(set.scoreGuest);
                });
            })
        });
        console.log("calculateStuff.teams", teams);


    }

    render() {
        const { currentTutorial } = this.state;

        return (
            <div>
                {this.state.groups && this.state.groups.map(group => (
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
                                        <th>Remis</th>
                                        <th>Niederlagen</th>
                                        <th>Punkte</th>
                                        <th>Punktdifferenz</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.teams && group.teams.map(team => (
                                        <tr>
                                            <td>{team ? (team.name) : "penis"}</td>
                                            <td>Spiele</td>
                                            <td>Siege</td>
                                            <td>Remis</td>
                                            <td>Niederlagen</td>
                                            <td>Punkte</td>
                                            <td>Punktdifferenz</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="matches">
                                {group.matchs && group.matchs.map(match => (
                                    <div className="container match-container">
                                        <div className="row home-row">
                                            <div className="col team-name-col">
                                                {match.homeTeam.name}
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
                                                {match.guestTeam.name}
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
                                                <td>{match.homeTeam.name}</td>
                                                <td></td>
                                                {match.sets && match.sets.map(set => (
                                                    <td>{set.scoreHome}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td>{match.guestTeam.name}</td>
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