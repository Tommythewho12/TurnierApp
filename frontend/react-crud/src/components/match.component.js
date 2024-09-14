import React, { Component } from "react";


class Match extends Component {
    constructor(props) {
        super(props);
        this.onChangeTitle = this.onChangeTitle.bind(this);

        this.state = {
            currentMatch: {
                id: null,
                homeTeam: "",
                guestTeam: "",
                kickoff: "",
                noOfSets: null,
                sets: []
            },
            message: ""
        };
    }

    componentDidMount() {
        this.getMatch(this.props.router.params.id);
    }

    onChangeHomeTeam(e) {
        const homeTeam = e.target.value;

        this.setState(function (prevState) {
            return {
                currentMatch: {
                    ...prevState.currentMatch,
                    homeTeam: homeTeam
                }
            };
        });
    }

    onChangeGuestTeam(e) {
        
    }
}