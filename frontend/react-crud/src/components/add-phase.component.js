import React, { Component } from "react";
import PhaseDataService from "../services/phase.service.js";
import GroupDataService from "../services/group.service.js";
import MatchDataService from "../services/match.service.js";
import TeamDataService from "../services/team.service.js";

export default class AddPhase extends Component {
    constructor(props) {
        super(props);
        this.nextStage = this.nextStage.bind(this);
        this.onChangeOrder = this.onChangeOrder.bind(this);
        this.onChangeGroups = this.onChangeGroups.bind(this);
        this.onChangeTeams = this.onChangeTeams.bind(this);
        this.onChangeMatchs = this.onChangeMatchs.bind(this);
        this.savePhase = this.savePhase.bind(this);

        this.state = {
            id: "", // needed?
            order: -1,
            noOfGroups: 1,
            teamsEachGroup: 2,
            matchsEachGroup: 1,

            stage: 0,
            allTeams: [],
            selectedTeams: [],
            submitted: false
        };
    }

    componentDidMount() {
        this.retrieveTeams();
    }

    retrieveTeams() {
        TeamDataService.getAll()
            .then(response => {
                this.setState({
                    allTeams: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    onChangeOrder(e) {
        this.setState({
            order: e.target.value
        });
    }

    onChangeGroups(e) {
        this.setState({
            noOfGroups: e.target.value
        });
    }

    onChangeTeams(e) {
        this.setState({
            teamsEachGroup: e.target.value
        });
    }

    onChangeMatchs(e) {
        this.setState({
            matchsEachGroup: e.target.value
        });
    }

    savePhase() {
        let phaseId;
        PhaseDataService
            .create({ order: this.state.order })
            .then(response => {
                phaseId = response.data._id;
                console.log(response.data);

                for (let i = 1; i <= this.state.noOfGroups; i++) {
                    let groupId;
                    console.log("phaseId: ", phaseId);
                    GroupDataService
                        .create({
                            phase: phaseId,
                            number: i,
                            noOfTeams: this.state.teamsEachGroup
                        })
                        .then(response => {
                            groupId = response.data._id;
                            console.log(response.data);

                            for (let j = 1; j <= this.state.matchsEachGroup; j++) {
                                MatchDataService
                                    .create({
                                        group: groupId,
                                        order: j
                                    })
                                    .catch(e => {
                                        console.log("creating match failed", e);
                                    });
                            }
                        })
                        .catch(e => {
                            console.log("creating group failed", e);
                        });
                }
            })
            .catch(e => {
                console.log("creating phase failed", e);
            });

        this.nextStage();
    }

    nextStage() {
        this.setState({
            stage: this.state.stage + 1
        });
    }

    render() {
        const { allTeams } = this.state;

        return (
            <div className="submit-form">
                <h1>{this.state.stage}</h1>
                {this.state.stage === 0 && (
                    <div>
                        <div className="form-group">
                            <h3>Select teams</h3>
                            {allTeams && (
                                allTeams.map((team, index) => (
                                    <div>
                                        <input type="checkbox" id="{team._id}" />
                                        <label>{team.name}</label>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="btn btn-success" onClick={this.nextStage}>
                            Next
                        </button>
                    </div>
                )}
                {this.state.stage === 1 && (
                    <div>
                        <div className="form-group">
                            <label htmlFor="order">Order</label>
                            <input
                                type="number"
                                className="form-control"
                                id="order"
                                required
                                value={this.state.order}
                                onChange={this.onChangeOrder}
                                name="order"
                            />
                            <label>Number of Groups</label>
                            <input
                                type="number"
                                className="form-control"
                                id="groups"
                                required
                                value={this.state.noOfGroups}
                                onChange={this.onChangeGroups}
                                name="groups"
                            />
                            <label>Number of Teams for each Group</label>
                            <input
                                type="number"
                                className="form-control"
                                id="teams"
                                required
                                value={this.state.teamsEachGroup}
                                onChange={this.onChangeTeams}
                                name="teams"
                            />
                            <label>Number of Matches for each Group</label>
                            <input
                                type="number"
                                className="form-control"
                                id="matchs"
                                required
                                value={this.state.matchsEachGroup}
                                onChange={this.onChangeMatchs}
                                name="matchs"
                            />
                        </div>

                        <button onClick={this.savePhase} className="btn btn-success">
                            Submit
                        </button>
                    </div>
                )}
                {this.state.stage === 2 && (
                    <div>
                        <h4>You submitted successfully!</h4>
                        <button className="btn btn-success" onClick={this.newPhase}>
                            Add
                        </button>
                    </div>
                )}
            </div>
        );
    }
}