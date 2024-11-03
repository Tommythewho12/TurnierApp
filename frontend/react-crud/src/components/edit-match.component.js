import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { withRouter } from '../common/with-router';

class EditMatch extends Component {
    constructor(props) {
        super(props);
        this.tournamentId = undefined;
        this.phaseId = undefined;
        this.groupId = undefined;
        this.matchId = this.props.router.params.matchId;

        this.state = {
            // page controls
            activePhase: 0,

            // data
            homeTeamId: "",
            guestTeamId: "",
            homeTeamName: "",
            guestTeamName: "",
            sets: [],
            concluded: undefined
        };
    }

    componentDidMount() {
        this.retrieveMatch();
    }

    retrieveMatch() {
        console.log("matchId: ", this.matchId)
        TournamentDataService
            .getMatch(this.matchId)
            .then(response => {
                console.log("response: ", response);
                const match = response.data.match;
                this.tournamentId = response.data._id;
                this.phaseId = response.data.phaseId;
                this.groupId = response.data.groupId;
                this.setState({
                    homeTeamId: match.homeTeam._id,
                    guestTeamId: match.guestTeam._id,
                    homeTeamName: match.homeTeam.name,
                    guestTeamName: match.guestTeam.name,
                    sets: match.sets,
                    concluded: match.concluded
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    increaseScoreHome() { // TODO persist data
        const newSets = [...this.state.sets];
        newSets[newSets.length - 1].scoreHome++;
        this.setState({
            sets: newSets
        });
    }

    increaseScoreGuest() { // TODO persist data
        const newSets = [...this.state.sets];
        newSets[newSets.length - 1].scoreGuest++;
        this.setState({
            sets: newSets
        });
    }

    addSet() {
        TournamentDataService
            .createSet({
                tournamentId: this.tournamentId,
                phaseId: this.phaseId,
                groupId: this.groupId,
                matchId: this.matchId,
                setOrder: this.state.sets.length
            })
            .then(res => {
                this.setState({
                    sets: [...this.state.sets, res.data]
                })
            })
            .catch(e => {
                console.log(e);
            });
    }

    concludeSet() {
        const newSets = this.state.sets;
        newSets[newSets.length - 1].concluded = true;
        this.setState({ sets: newSets });

        this.updateSet();
    }

    updateSet() {
        const newSets = this.state.sets;
        const newSet = newSets[newSets.length - 1];
        TournamentDataService
            .updateSet({
                tournamentId: this.tournamentId,
                phaseId: this.phaseId,
                groupId: this.groupId,
                matchId: this.matchId,
                set: newSet
            })
            .then(res => {
                console.log(res);
            })
            .catch(e => {
                console.log(e);
            });
    }

    concludeMatch() {
        TournamentDataService
            .concludeMatch({
                tournamentId: this.tournamentId,
                phaseId: this.phaseId,
                groupId: this.groupId,
                matchId: this.matchId
            })
            .then(res => {
                this.setState({ concluded: true });
            })
            .catch(e => {
                console.log(e);
            });
    }

    debug() {
        console.log(this.state);
        this.setState({concluded: false});
    }

    render() {
        const { homeTeamName, guestTeamName, sets, concluded } = this.state;

        return (
            <div className="container text-center">
                <div className="row justify-content-center">
                    <div className="col">
                        <h3 onClick={() => this.debug()}>Match {this.matchId}</h3>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-4">
                        <h2>{homeTeamName}</h2>
                    </div>
                    <div className="col-1"></div>
                    <div className="col-4">
                        <h2>{guestTeamName}</h2>
                    </div>
                </div>
                {sets && sets.length > 0 && sets.map((set, setIndex) => (
                    <>
                        <div className="row justify-content-center">
                            <div className="col-4">
                                <h2>
                                    {set.concluded === false && <button className="btn btn-success" onClick={() => this.increaseScoreHome()}>+</button>}
                                    {set.scoreHome}</h2>
                            </div>
                            <div className="col-1">
                                {set.concluded === false && (
                                    <button className="btn btn-info" onClick={() => this.concludeSet(setIndex)}>conclude set</button>
                                )}
                            </div>
                            <div className="col-4">
                                <h2>
                                    {set.scoreGuest}
                                    {set.concluded === false && <button className="btn btn-success" onClick={() => this.increaseScoreGuest()}>+</button>}
                                </h2>
                            </div>
                        </div>
                        {sets.length - 1 === setIndex && set.concluded && concluded === false && (
                            <div className="row justify-content-center">
                                <div className="col-2">
                                    <button className="btn btn-info" onClick={() => this.addSet()}>
                                        + new Set
                                    </button>
                                </div>
                                <div className="col-2">
                                    <button className="btn btn-info" onClick={() => this.concludeMatch()}>
                                        Upload Match
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ))}
                {sets && sets.length === 0 && (
                    <div className="row justify-content-center">
                        <div className="col-2">
                            <button className="btn btn-info" onClick={() => this.addSet()}>
                                + new Set
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(EditMatch);