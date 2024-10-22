import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { withRouter } from '../common/with-router';

class EditMatch extends Component {
    constructor(props) {
        super(props);
        this.tournamentId = this.props.router.params.tournamentId;
        this.phase = this.props.router.params.phase;
        this.group = this.props.router.params.group;
        this.match = this.props.router.params.match;
        
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
        TournamentDataService
            .getMatch({
                tournamentId: "67156bd76f8bfe42692f0ece",// this.tournamentId,
                phase: "0", // this.phase,
                group: "0", // this.group,
                match: "1" // this.match
            })
            .then(response => {
                console.log("response", response);
                const match = response.data.match;
                this.setState({ 
                    homeTeamId: match.homeTeam._id, 
                    guestTeamId: match.guestTeam._id,
                    homeTeamName: match.homeTeam.name,
                    guestTeamName: match.guestTeam.name,
                    sets: match.sets,
                    concluded: match.concluded
                });
                console.log("this.state.matchData", this.state.matchData);
            })
            .catch(e => {
                console.log(e);
            });
    }

    concludeSet(setIndex) {
        const newSets = this.state.sets;
        newSets[setIndex].concluded = true;
        this.setState({sets: newSets});
    }

    concludeMatch() {
        this.setState({concluded: true});
    }

    updateMatch(match) {
        TournamentDataService
            .updateMatch({
                tournamentId: "67156bd76f8bfe42692f0ece",// this.tournamentId,
                phase: "0", // this.phase,
                group: "0", // this.group,
                match: "1", // this.match
                data: match
            })
            .then(res => {
                console.log(res);
            })
            .catch(e => {
                console.log(e);
            });
    }

    debug() {
        console.log("this.state.matchData", this.state);
        this.setState({concluded: false});
    }

    render() {
        const { homeTeamName, guestTeamName, sets, concluded } = this.state;

        return (
            <div className="container text-center">
                <div className="row justify-content-center">
                    <div className="col">
                        <h3 onClick={() => this.debug()}>Spiel 4</h3>
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
                    <div className="row justify-content-center">
                        <div className="col-4">
                            <h2>{set.scoreHome}</h2>
                        </div>
                        <div className="col-1"></div>
                        <div className="col-4">
                            <h2>{set.scoreGuest}</h2>
                        </div>
                    </div>
                ))}
                {concluded === false && (
                    <div className="row justify-content-center">
                        <div className="col-2">
                            <button className="btn btn-info" onClick={() => this.concludeMatch()}>
                                Upload Score
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );        
    }
}

export default withRouter(EditMatch);