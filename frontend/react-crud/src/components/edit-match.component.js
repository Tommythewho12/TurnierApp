import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { withRouter } from '../common/with-router';

class EditMatch extends Component {
    constructor(props) {
        super(props);
        this.tournamentId = undefined;
        this.phaseId = undefined;
        this.phaseOrder = undefined;
        this.groupId = undefined;
        this.groupOrder = undefined;
        this.matchId = this.props.router.params.matchId;

        this.state = {
            // page controls
            activePhase: 0,
            lastScored: 0,

            // data
            homeTeamId: "",
            guestTeamId: "",
            homeTeamName: "",
            guestTeamName: "",
            sets: undefined,
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
                this.phaseOrder = response.data.phaseOrder;
                this.groupId = response.data.groupId;
                this.groupOrder = response.data.groupOrder;
                this.matchOrder = response.data.match.order;
                let homeTeamSets = 0, guestTeamSets = 0;
                match.sets.forEach(e => {
                    if (e.scoreHome > e.scoreGuest) homeTeamSets++;
                    else if (e.scoreHome < e.scoreGuest) guestTeamSets++;
                });
                this.setState({
                    homeTeamId: match.homeTeam._id,
                    guestTeamId: match.guestTeam._id,
                    homeTeamName: match.homeTeam.name,
                    guestTeamName: match.guestTeam.name,
                    homeTeamSets: homeTeamSets,
                    guestTeamSets: guestTeamSets,
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
        const { homeTeamName, guestTeamName, homeTeamSets, guestTeamSets, sets, concluded } = this.state;

        return (
            <div className="container text-center">
                <div className="row align-items-center match-id" onClick={() => this.debug()}>
                    <h6>Match-ID {this.matchId}</h6>
                </div>
                <div className="row align-items-center">
                    <h3>Match {this.phaseOrder}-{this.groupOrder}-{this.matchOrder}</h3>
                </div>
                <div className="row align-items-center">
                    <div className="col text-center text-truncate">
                        <h3>
                            {homeTeamName}
                        </h3>
                    </div>
                    <div className="col-auto">
                        <h1 className={(homeTeamSets > guestTeamSets && concluded ? "fw-bold" : "")}>{homeTeamSets ? homeTeamSets : 0}</h1>
                    </div>
                    <div className="col-auto score-divider">
                        <h2>:</h2>
                    </div>
                    <div className="col-auto">
                        <h1 className={(homeTeamSets < guestTeamSets && concluded ? "fw-bold" : "")}>{guestTeamSets ? guestTeamSets : 0}</h1>
                    </div>
                    <div className="col text-center text-truncate">
                        <h3>
                            {guestTeamName}
                        </h3>
                    </div>
                </div>
                {sets && sets.length > 0 && sets.map((set, setIndex) => (
                    <div className="row justify-content-center">
                        <div className="col">
                            <h2>
                                {set.scoreHome}
                            </h2>
                            {set.concluded === false && <button className="btn btn-success" onClick={() => this.increaseScoreHome()}>+</button>}
                        </div>
                        <div className="col-auto">
                            <h5>Set {setIndex+1}</h5>
                        </div>
                        <div className="col">
                            <h2>
                                {set.scoreGuest}
                            </h2>
                            {set.concluded === false && <button className="btn btn-success" onClick={() => this.increaseScoreGuest()}>+</button>}
                        </div>
                    </div>
                ))}
                {sets && concluded === false && (
                    <div className="row justify-content-center">
                    <div className="col-2">
                        <button className="btn btn-info" disabled={sets[sets.length-1]?.concluded === false} onClick={() => this.addSet()}>
                            + New Set
                        </button>
                    </div>
                    <div className="col-2">
                        <button className="btn btn-info" disabled={sets[sets.length-1]?.concluded !== false} onClick={() => this.concludeSet(sets.length-1)}>
                            Conclude Set
                        </button>
                    </div>
                    <div className="col-2">
                        <button className="btn btn-info" disabled={sets.length === 0 || sets[sets.length-1]?.concluded !== true} onClick={() => this.concludeMatch()}>
                            Conclude Match
                        </button>
                    </div>
                </div>
                )}
            </div>
        );
    }
}

export default withRouter(EditMatch);