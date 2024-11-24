import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import Leonschwonz from "./components/leonschwonz.component.js";
import ListTournaments from "./components/list-tournaments.component.js";
import CreateTournaments from "./components/create-tournament.component.js";
import ViewTournament from "./components/view-tournament.component.js";
import Tutorial from "./components/tutorial.component";
import TutorialsList from "./components/tutorials-list.component.js";
import AddTeam from "./components/add-team.component";
import TeamsList from "./components/teams-list.component.js";
import EditMatch from "./components/edit-match.component.js";

class App extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <Link to={"/"} className="navbar-brand">
            Tommythewho12
          </Link>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/tournaments"} className="nav-link">
                Tournaments
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/teams"} className="nav-link">
                Teams
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/add"} className="nav-link">
                Add Team
              </Link>
            </li>
          </div>
        </nav>

        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Leonschwonz />} />

            <Route path="/tournaments" element={<ListTournaments />} />
            <Route path="/tournaments/new" element={<CreateTournaments />} />
            <Route path="/tournaments/:id" element={<ViewTournament />} />

            <Route path="/add" element={<AddTeam />} />
            <Route path="/teams" element={<TeamsList />} />

            <Route path="/matchs/:matchId" element={<EditMatch />} />
          </Routes>
        </div>
      </div>
    );
  }
}

export default App;