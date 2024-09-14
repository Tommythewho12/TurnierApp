import React, { Component } from "react";
import MatchDataService from "../services/match.service.js";
import TeamDataService from "../services/team.service.js";

export default class MatchsList extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.createMatch = this.createMatch.bind(this);
        this.onChangeHomeSelection = this.onChangeHomeSelection.bind(this);
        this.onChangeGuestSelection = this.onChangeGuestSelection.bind(this);
        this.saveMatch = this.saveMatch.bind(this);
        this.deleteMatch = this.deleteMatch.bind(this);
        this.deleteAllMatchs = this.deleteAllMatchs.bind(this);
        this.addingSet = this.addingSet.bind(this);
        this.onChangeScoreHome = this.onChangeScoreHome.bind(this);
        this.onChangeScoreGuest = this.onChangeScoreGuest.bind(this);
        this.saveSet = this.saveSet.bind(this);
        this.saveTeam = this.saveTeam.bind(this);

        this.state = {
            matchs: [],
            teams: [],
            creatingNewMatch: false,
            homeTeam: null,
            guestTeam: null,
            editingScore: -1, // simultaneously used to pinpoint the correct match
            scoreHome: 0,
            scoreGuest: 0
        };
    }

    refreshList() {
        this.retrieveMatchs();
        this.setState({
            creatingNewMatch: false,
            homeTeam: null,
            guestTeam: null,
            editingScore: -1,
            scoreHome: 0,
            scoreGuest: 0
        });
    }

    componentDidMount() {
        this.retrieveMatchs();
        this.retrieveTeams();
    }

    retrieveMatchs() {
        MatchDataService.getAll()
            .then(response => {
                this.setState({
                    matchs: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    retrieveTeams() {
        TeamDataService.getAll()
            .then(response => {
                this.setState({
                    teams: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    createMatch() {
        this.setState({
            creatingNewMatch: true,
            homeTeam: null,
            guestTeam: null
        });
    }

    onChangeHomeSelection(e) {
        this.setState({
            homeTeam: e.target.value
        });
    }

    onChangeGuestSelection(e) {
        this.setState({
            guestTeam: e.target.value
        });
    }

    saveMatch() {
        var data = {
            order: this.state.matchs.length + 1,
            homeTeam: this.state.homeTeam,
            guestTeam: this.state.guestTeam
        };
        let newMatchs = this.state.matchs;
        MatchDataService.create(data)
            .then(response => {
                newMatchs.push = response.data;
                console.log("response:", response);
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            });

        this.setState({
            matchs: newMatchs,
            creatingNewMatch: false
        });
        console.log("after create", this.state);
    }

    deleteMatch(e) {
        MatchDataService.delete(e)
            .then(response => {
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            });
    }

    deleteAllMatchs() {
        MatchDataService.deleteAll()
            .then(response => {
                console.log(response.data);
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            });
    }

    addingSet(e) {
        console.log("adding set", e)
        this.setState({
            editingScore: e
        });
    }

    onChangeScoreHome(e) {
        this.setState({
            scoreHome: e.target.value
        });
    }

    onChangeScoreGuest(e) {
        this.setState({
            scoreGuest: e.target.value
        });
    }

    saveSet(e) {
        let matchToUpdate = this.state.matchs[e];
        matchToUpdate.sets.push({
            scoreHome: this.state.scoreHome,
            scoreGuest: this.state.scoreGuest
        });
        MatchDataService.update(matchToUpdate._id, matchToUpdate)
            .then(response => {
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            })
    }

    saveTeam(e) {
        MatchDataService.update(e.matchId, {[e.side]: e.teamId})
            .catch(e => {
                console.log(e);
            })
    }

    render() {
        const { matchs, teams } = this.state;

        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Matchs List <button onClick={this.deleteAllMatchs} className="btn btn-danger">DELETE ALL</button></h4>
                    {
                        matchs &&
                        matchs.map((match, index) => (
                            <table class="table">
                                <thead>
                                    <tr>
                                        <td colSpan="2"># {match.order}</td>
                                    </tr>
                                    {match.field && (
                                        <tr>
                                            <td colSpan="2">Feld {match.field}</td>
                                        </tr>)
                                    }
                                    <tr>
                                        <th scope="col">
                                            <select onChange={v => this.saveTeam({side: 'homeTeam', matchId: match._id, teamId: v.target.value})}>
                                                <option hidden disabled selected={!match.homeTeam}>-- select guest team --</option>
                                                {
                                                    teams &&
                                                    teams.map((team) => (
                                                        <option value={team._id} selected={match.homeTeam && match.homeTeam._id==team._id}>{team.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </th>
                                        <th scope="col">
                                            <select onChange={v => this.saveTeam({side: 'guestTeam', matchId: match._id, teamId: v.target.value})}>
                                                <option hidden disabled selected={!match.guestTeam}>-- select guest team --</option>
                                                {
                                                    teams &&
                                                    teams.map((team) => (
                                                        <option value={team._id} selected={match.guestTeam && match.guestTeam._id==team._id}>{team.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        match.sets &&
                                        match.sets.map((set, index) => (
                                            <tr>
                                                <td>{set.scoreHome}</td>
                                                <td>{set.scoreGuest}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>

                                {
                                    this.state.editingScore === index ? (
                                        <div className="submit-form">
                                            <label>Home Score</label>
                                            <input type="number" className="form-control" id="scoreHome" required value={this.state.scoreHome} onChange={this.onChangeScoreHome} name="scoreHome" />

                                            <label>Guest Score</label>
                                            <input type="number" className="form-control" id="scoreGuest" required value={this.state.scoreGuest} onChange={this.onChangeScoreGuest} name="scoreGuest" />
                                            <button onClick={() => this.saveSet(index)} className="btn btn-success">Save</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => this.addingSet(index)} className="btn btn-success">add set</button>
                                    )
                                }

                                <button onClick={() => this.deleteMatch(match._id)} className="btn btn-danger">delete match</button>
                            </table>
                        ))
                    }                    

                    <div className="submit-form">
                        {
                            this.state.creatingNewMatch ? (
                                <div>
                                    <div className="form-group">
                                        <label htmlFor="homeTeamSelection">Home Team</label>
                                        <select name="homeTeamSelection" id="homeTeamSelection" onChange={this.onChangeHomeSelection}>
                                            <option hidden disabled selected>-- select home team --</option>
                                            {
                                                teams &&
                                                teams.map((team) => (
                                                    <option value={team._id}>{team.name}</option>
                                                ))
                                            }
                                        </select>
                                        <label htmlFor="guestTeamSelection">Guest Team</label>
                                        <select name="guestTeamSelection" id="guestTeamSelection" onChange={this.onChangeGuestSelection}>
                                            <option hidden disabled selected>-- select guest team --</option>
                                            {
                                                teams &&
                                                teams.map((team) => (
                                                    <option value={team._id}>{team.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <button onClick={this.saveMatch} className="btn btn-success">
                                        Submit
                                    </button>
                                </div>
                            ) : (
                                <button onClick={this.createMatch} className="m-3 btn btn-sm btn-info">
                                    Create
                                </button>
                            )}
                    </div>

                </div>
            </div>
        );
    }
}