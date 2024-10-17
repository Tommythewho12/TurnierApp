import React, { Component } from "react";
import TeamDataService from "../services/team.service.js";
import TournamentDataService from "../services/tournament.service.js";

const delay = ms => new Promise(res => setTimeout(res, ms));

export default class CreateTournaments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // page controls
            stage: 0,

            // static values
            allTeams: [],

            // editing values
            tournament: {
                name: "",
                teams: [],
                phases: []
            }
        };
    }

    componentDidMount() {
        this.getAllTeams();
    }

    getAllTeams() {
        TeamDataService.getAll()
            .then(response => {
                this.setState({
                    allTeams: response.data
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    nextStage() {
        console.log(this.state);
        this.setState({ stage: this.state.stage + 1 });
    }

    previousStage() {
        console.log(this.state);
        this.setState({ stage: this.state.stage - 1 });
    }

    updateTournamentName(input) {
        this.setState({ tournament: { ...this.state.tournament, name: input } });
    }

    updateTournamentTeams(teamId) {
        if (this.state.tournament.teams.includes(teamId)) {
            let newTeams = this.state.tournament.teams.filter(item => item !== teamId);
            this.setState({ tournament: { ...this.state.tournament, teams: newTeams } });
        } else {
            this.setState({ tournament: { ...this.state.tournament, teams: [...this.state.tournament.teams, teamId] } });
        }
    }

    inputIsValid() {
        switch (this.state.stage) {
            case 0: return this.state.tournament.name.length > 0;
            case 1: return this.state.tournament.teams.length > 2;
            case 2: return this.state.tournament.phases.length > 0;
            case 3:
            default: return true;
        }
    }

    pushPhase() {
        this.setState({
            tournament: {
                ...this.state.tournament, phases: [...this.state.tournament.phases, {
                    order: this.state.tournament.phases.length,
                    groups: this.state.tournament.phases.length === 0
                        ? [{ order: 0, teams: [undefined, undefined], teamReferences: undefined, matchs: [] }]
                        : [{ order: 0, teams: undefined, teamReferences: [undefined, undefined], matchs: [] }]
                }]
            }
        });
    }

    popPhase() {
        const newPhases = this.state.phases;
        newPhases.pop();
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    pushGroup(phaseIndex) {
        const newPhases = this.state.tournament.phases;
        newPhases[phaseIndex].groups = [...newPhases[phaseIndex].groups, {
            order: newPhases[phaseIndex].groups.length,
            teams: phaseIndex === 0 ? [undefined, undefined] : undefined,
            teamReferences: phaseIndex === 0 ? undefined : [undefined, undefined],
            matchs: []
        }];
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    popGroup(phaseIndex) {
        const newPhases = this.state.tournament.phases;
        newPhases[phaseIndex].groups.pop();
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    updateGroupSize(value, phaseIndex, groupIndex) {
        const newPhases = this.state.tournament.phases;
        newPhases[phaseIndex].groups[groupIndex].teams = [];
        for (let i = 0; i < Number(value); i++) {
            if (phaseIndex === 0) {
                newPhases[phaseIndex].groups[groupIndex].teams.push(undefined);
            } else {
                newPhases[phaseIndex].groups[groupIndex].teamReferences.push(undefined);
            }
        }
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    updateTeam(value, phaseIndex, groupIndex, teamIndex) {
        const newPhases = this.state.tournament.phases;
        const splitValue = value.split("-");
        if (splitValue.length === 1) {
            newPhases[phaseIndex].groups[groupIndex].teams[teamIndex] = value;
        } else {
            newPhases[phaseIndex].groups[groupIndex].teamReferences[teamIndex] = { phase: splitValue[0], group: splitValue[1], rank: splitValue[2] };
        }

        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    createTournament() {
        console.log(this.state);

        const updatedTournament = this.state.tournament;
        let phaseIndex = 0;
        for (let phase of updatedTournament.phases) {
            for (let group of phase.groups) {
                if (phaseIndex === 0) {
                    const noOfTeams = Number(group.teams.length);
                    // create matches for every team to play vs each other once
                    for (let i = 0; i < noOfTeams * (noOfTeams - 1) / 2; i++) {
                        group.matchs.push({
                            order: i,
                            homeTeam: group.teams[i % noOfTeams],
                            guestTeam: group.teams[(i + Math.floor(i / noOfTeams) + 1) % noOfTeams]
                        });
                    }
                } else {
                    const noOfTeams = Number(group.teamReferences.length);
                    // create matches for every team to play vs each other once
                    for (let i = 0; i < noOfTeams * (noOfTeams - 1) / 2; i++) {
                        group.matchs.push({
                            order: i,
                            homeTeam: null,
                            guestTeam: null
                        });
                    }
                }
                console.log("group", group);
            }
            phaseIndex++;
        }

        TournamentDataService
            .create(updatedTournament)
            .then(res => console.log("response", res))
            .catch(e => console.log(e));
    }

    parseTeamReference(phases, teamReference) {
        const teamReferenceSplit = teamReference.split("-");
        return { group: phases[teamReferenceSplit[0]].groups[teamReferenceSplit[1]].id, rank: Number(teamReferenceSplit[2]) };
    }

    render() {
        const finalStage = 3; // TODO: fetch this value from outside render(). Possible?
        const { stage, allTeams, tournament } = this.state;
        const { name, phases, teams } = tournament;

        return (
            <div className="row">
                <div className="col-3">
                    <h4>Stage: {stage} / {finalStage}</h4>
                    <h4>{name}</h4>
                </div>
                <div className="col-9">
                    <h4>Tournament Creation</h4>
                    <div className="row mb-2">
                        <div className="col">
                            {stage === 0 && (
                                <>
                                    <label htmlFor="name">Name</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="name"
                                        required
                                        value={name}
                                        onChange={v => this.updateTournamentName(v.target.value)} />
                                </>
                            )}
                            {stage === 1 && (
                                allTeams.length !== 0 ? (
                                    <>
                                        {allTeams.map((team, index) => (
                                            <>
                                                <input
                                                    className="btn-check"
                                                    type="checkbox"
                                                    id={team._id}
                                                    autoComplete="off"
                                                    checked={teams.includes(team._id)}
                                                    onChange={() => this.updateTournamentTeams(team._id)} />
                                                <label className="btn btn-primary" htmlFor={team._id}>
                                                    {team.name}
                                                </label>
                                            </>
                                        ))}
                                    </>
                                ) : (
                                    <div className="row align-items-center missing-content-div">
                                        <div className="col">
                                            Looks like there are no teams yet! Create teams in the "Teams" tab or click here.
                                        </div>
                                    </div>
                                )
                            )}
                            {stage === 2 && (
                                <>
                                    {phases.length !== 0 ? (
                                        phases.map((phase, phaseIndex) => (
                                            <div className="row mb-2">
                                                <div className="col-12">
                                                    <h3>Phase {phaseIndex}</h3>
                                                </div>
                                                {phase.groups && phase.groups.length > 0 &&
                                                    phase.groups.map((group, groupIndex) => (
                                                        <div className="col-auto">
                                                            <div className="card">
                                                                <div className="card-body">
                                                                    <h4>Group {groupIndex}</h4>
                                                                    <div className="input-group" style={{ width: "9rem" }}>
                                                                        <span className="input-group-text">Teams</span>
                                                                        <input
                                                                            className="form-control"
                                                                            type="number"
                                                                            id={phaseIndex + "-" + groupIndex}
                                                                            defaultValue={phaseIndex === 0 ? group.teams.length : group.teamReferences.length}
                                                                            min={2}
                                                                            onChange={v => this.updateGroupSize(v.target.value, phaseIndex, groupIndex)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                <div className="col-auto">
                                                    <div className="card" style={{ width: "12rem" }}>
                                                        <div className="card-body">
                                                            <button className="btn btn-success" onClick={() => this.pushGroup(phaseIndex)}>
                                                                + group
                                                            </button>
                                                            <button className="btn btn-danger" onClick={() => this.popGroup(phaseIndex)}>
                                                                - group
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="row align-items-center missing-content-div mb-2">
                                            <div className="col">
                                                Looks like there are no phases yet! Create a new one with the button below.
                                            </div>
                                        </div>
                                    )}
                                    <div className="row justify-content-between">
                                        <div className="col">
                                            {phases.length !== 0 && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => this.popPhase()}>
                                                    - Phase
                                                </button>
                                            )}
                                        </div>
                                        <div className="col-auto">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => this.pushPhase()}>
                                                + Phase
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {stage === 3 && (
                                <>
                                    {phases.map((phase, phaseIndex) => (
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <h3>Phase {phaseIndex}</h3>
                                            </div>
                                            {phase.groups &&
                                                phase.groups.map((group, groupIndex) => (
                                                    <div className="col">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <h4>Group {groupIndex}</h4>
                                                                {phaseIndex === 0 && group.teams && group.teams.map((team, teamIndex) => (
                                                                    <div>
                                                                        <label htmlFor={phaseIndex + "-" + groupIndex + "-" + teamIndex}>Team {teamIndex + 1}</label>
                                                                        <select id={phaseIndex + "-" + groupIndex + "-" + teamIndex} onChange={v => this.updateTeam(v.target.value, phaseIndex, groupIndex, teamIndex)}>
                                                                            <option hidden disabled selected={team === undefined}>-- select team --</option>
                                                                            {teams.length > 0 && teams.map((teamSelection, index) => (
                                                                                <option value={teamSelection} selected={team === teamSelection}>
                                                                                    {teamSelection}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ))}
                                                                {phaseIndex !== 0 && group.teamReferences && group.teamReferences.map((teamRef, teamRefIndex) => (
                                                                    <div>
                                                                        <label htmlFor={phaseIndex + "-" + groupIndex + "-" + teamRefIndex}>Team {teamRefIndex + 1}</label>
                                                                        <select id={phaseIndex + "-" + groupIndex + "-" + teamRefIndex} onChange={v => this.updateTeam(v.target.value, phaseIndex, groupIndex, teamRefIndex)}>
                                                                            <option hidden disabled selected={teamRef === undefined}>-- select team --</option>
                                                                            {phases[phaseIndex - 1].groups.map((groupInt, groupIntIndex) => (
                                                                                <>
                                                                                    {groupInt.teams.map((_, rank) => (
                                                                                        <option value={phaseIndex - 1 + "-" + groupIntIndex + "-" + rank}>
                                                                                            Phase {phaseIndex - 1} - Group {groupIntIndex} - Rank{rank + 1}
                                                                                        </option>
                                                                                    ))}
                                                                                </>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="row justify-content-between">
                        <div className="col">
                            {stage !== 0 && (
                                <button className="btn btn-success" onClick={() => this.previousStage()}>
                                    Back
                                </button>
                            )}
                        </div>
                        <div className="col-auto">
                            {stage != finalStage ? (
                                <button className="btn btn-success" disabled={!this.inputIsValid()} onClick={() => this.nextStage()}>
                                    Next
                                </button>
                            ) : (
                                <button className="btn btn-info" onClick={() => this.createTournament()}>
                                    Create
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
