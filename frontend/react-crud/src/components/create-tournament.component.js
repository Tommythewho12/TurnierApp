import React, { Component } from "react";
import TeamDataService from "../services/team.service.js";
import TournamentDataService from "../services/tournament.service.js";

export default class CreateTournaments extends Component {
    constructor(props) {
        super(props);
        this.creationStages = 3;

        this.state = {
            // static values
            allTeams: [],
            
            // page controls
            stage: 0,
            unavailableTeams: [],

            // editing values
            tournament: {
                name: "",
                noOfFields: 1,
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
        this.setState({ stage: this.state.stage + 1 });
    }

    previousStage() {
        this.setState({ stage: this.state.stage - 1 });
    }

    updateTournamentName(input) {
        this.setState({ tournament: { ...this.state.tournament, name: input } });
    }

    updateTournamentNoOfFields(value) {
        this.setState({ tournament: {...this.state.tournament, noOfFields: value }});
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
                        ? [{ order: 0, teams: [0, 0], teamReferences: undefined, matchs: [] }]
                        : [{ order: 0, teams: [undefined, undefined], teamReferences: [0, 0], matchs: [] }]
                }]
            }
        });
    }

    popPhase() {
        const newPhases = this.state.tournament.phases;
        newPhases.pop();
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    pushGroup(phaseIndex) {
        const newPhases = this.state.tournament.phases;
        newPhases[phaseIndex].groups = [...newPhases[phaseIndex].groups, {
            order: newPhases[phaseIndex].groups.length,
            teams: phaseIndex === 0 ? [0, 0] : [undefined, undefined],
            teamReferences: phaseIndex === 0 ? undefined : [0, 0],
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
        if (phaseIndex !== 0) {
            newPhases[phaseIndex].groups[groupIndex].teamReferences = [];
        }

        for (let i = 0; i < Number(value); i++) {
            newPhases[phaseIndex].groups[groupIndex].teams.push(phaseIndex === 0 ? 0 : undefined);
            if (phaseIndex !== 0) {
                newPhases[phaseIndex].groups[groupIndex].teamReferences.push(0);
            }
        }
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    updateTeam(value, phaseIndex, groupIndex, teamIndex) {
        // Create a new reference for phases
        const newPhases = this.state.tournament.phases.map((phase, pIndex) => {
            if (pIndex === phaseIndex) {
                const newGroups = phase.groups.map((group, gIndex) => {
                    // Create a new reference for groups and teams/teamReferences
                    return {
                        ...group,
                        teams: group.teams.map((team, tIndex) => {
                            if (pIndex === 0 && gIndex === groupIndex && tIndex === teamIndex) {
                                return value; // Set the selected value
                            } else if (team === value) {
                                return 0; // Clear duplicate selection
                            }
                            return team;
                        }),
                        teamReferences: group.teamReferences != undefined
                            ? group.teamReferences.map((ref, refIndex) => {
                                if (gIndex === groupIndex && refIndex === teamIndex) {
                                    return { phase: parseInt(value.split("-")[0]), group: parseInt(value.split("-")[1]), rank: parseInt(value.split("-")[2]) };
                                } else if (ref && `${ref.phase}-${ref.group}-${ref.rank}` === value) {
                                    return 0;
                                }
                                return ref;
                            })
                            : undefined
                    };
                });
                return { ...phase, groups: newGroups };
            }
            return phase;
        });
    
        this.setState({ tournament: { ...this.state.tournament, phases: newPhases } });
    }

    createTournament() {
        const updatedTournament = this.state.tournament;
        let phaseIndex = 0;
        let matchOrder = 0;
        for (let phase of updatedTournament.phases) {
            let groupIndex = 0;
            for (let group of phase.groups) {
                const noOfTeams = Number(group.teams.length);
                // create matches for every team to play vs each other once
                for (let i = 0; i < noOfTeams * (noOfTeams - 1) / 2; i++) {
                    group.matchs.push({
                        order: matchOrder++,
                        field: (groupIndex % updatedTournament.noOfFields) + 1,
                        homeTeam: phaseIndex === 0 ? group.teams[i % noOfTeams] : null,
                        guestTeam: phaseIndex === 0 ? group.teams[(i + Math.floor(i / noOfTeams) + 1) % noOfTeams] : null
                    });
                }
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
        const finalStage = this.creationStages;
        const { allTeams, stage, unavailableTeams, tournament } = this.state;
        const { name, noOfFields, phases, teams: tournamentTeams } = tournament;

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
                                    <label>Number of Fields</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        id="noOfFields"
                                        required
                                        min={1}
                                        value={noOfFields}
                                        onChange={v => this.updateTournamentNoOfFields(v.target.value)}
                                    />
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
                                                    checked={tournamentTeams.includes(team._id)}
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
                                                                        <select 
                                                                            id={phaseIndex + "-" + groupIndex + "-" + teamIndex} 
                                                                            value={phases[phaseIndex].groups[groupIndex].teams[teamIndex]} 
                                                                            onChange={v => this.updateTeam(v.target.value, phaseIndex, groupIndex, teamIndex)}>
                                                                            <option value={0} hidden>-- select team --</option>
                                                                            {tournamentTeams.length > 0 && tournamentTeams.map((tournamentTeam) => (
                                                                                <option value={tournamentTeam}>
                                                                                    {allTeams.filter(t => t._id === tournamentTeam).map(q => (<>{q.name}</>))}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ))}
                                                                {phaseIndex !== 0 && group.teamReferences && group.teamReferences.map((teamRef, teamRefIndex) => (
                                                                    <div>
                                                                        <label htmlFor={phaseIndex + "-" + groupIndex + "-" + teamRefIndex}>Team {teamRefIndex + 1}</label>
                                                                        <select 
                                                                            id={phaseIndex + "-" + groupIndex + "-" + teamRefIndex} 
                                                                            value={phases[phaseIndex].groups[groupIndex].teamReferences[teamRefIndex] == 0 ? 0 : (phases[phaseIndex].groups[groupIndex].teamReferences[teamRefIndex].phase + "-" + phases[phaseIndex].groups[groupIndex].teamReferences[teamRefIndex].group + "-" + phases[phaseIndex].groups[groupIndex].teamReferences[teamRefIndex].rank)} 
                                                                            onChange={v => this.updateTeam(v.target.value, phaseIndex, groupIndex, teamRefIndex)}>
                                                                            <option value={0} hidden>-- select team --</option>
                                                                            {phases[phaseIndex - 1].groups.map((groupReference, groupReferenceIndex) => (
                                                                                <>
                                                                                    {groupReference.teams != null && groupReference.teams.map((_, rank) => (
                                                                                        <option value={phaseIndex - 1 + "-" + groupReferenceIndex + "-" + rank}>
                                                                                            Phase {phaseIndex - 1} - Group {groupReferenceIndex} - Rank{rank + 1}
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
