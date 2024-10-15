import React, { Component } from "react";
import TournamentDataService from "../services/tournament.service.js";
import { withRouter } from '../common/with-router';

class ViewTournament extends Component {
    constructor(props) {
        super(props);
        this.retrieveTournament = this.retrieveTournament.bind(this);

        this.state = {
            tournament: undefined
        };
    }

    componentDidMount() {
        this.retrieveTournament(this.props.router.params.id);
    }

    retrieveTournament(id) {
        TournamentDataService.get(id)
            .then(response => {
                this.setState({
                    tournament: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { tournaments } = this.state;

        return (
            <div className="row">
                <div className="col-3"></div>
                <div className="col-9">
                    <h4>Tournaments</h4>
                    
                </div>
            </div>
        );
    }
}

export default withRouter(ViewTournament);