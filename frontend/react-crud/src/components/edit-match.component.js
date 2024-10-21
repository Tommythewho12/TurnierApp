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
            sets: []
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
                    sets: match.sets
                });
                console.log("this.state.matchData", this.state.matchData);
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {

        return (
            <>
                <div className="row">
                    <div className="col-5">{this.state.homeTeamName}</div>
                    <div className="col-2"></div>
                    <div className="col-5">{this.state.guestTeamName}</div>
                </div>
                <div className="row">
                    <div className="col-5"></div>
                    <div className="col-2"></div>
                    <div className="col-5"></div>
                </div>
            </>
        );        
    }
}

export default withRouter(EditMatch);