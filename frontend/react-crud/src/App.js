import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import Leonschwonz from "./components/leonschwonz.component.js";
import Tutorial from "./components/tutorial.component";
import TutorialsList from "./components/tutorials-list.component.js";
import AddTeam from "./components/add-team.component";
import TeamsList from "./components/teams-list.component.js"
import MatchsList from "./components/matchs-list.component.js"
import MatchsEditor from "./components/matchs-editor.component.js"
import PhaseEditor from "./components/add-phase.component.js"
import AddPhase from "./components/add-phase.component.js";
import PhasesList from "./components/phases-list.component.js";
import PhaseView from "./components/phase-view.component.js";

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
              <Link to={"/tutorials"} className="nav-link">
                Tutorials
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/matchs"} className="nav-link">
                Matches
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/teams"} className="nav-link">
                Teams
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/add"} className="nav-link">
                Add
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/admin/matchs"} className="nav-link">
                Edit Matches
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/admin/phase"} className="nav-link">
                Edit Phases
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/phases"} className="nav-link">
                Phases
              </Link>
            </li>
          </div>
        </nav>

        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Leonschwonz />} />
            <Route path="/tutorials" element={<TutorialsList />} />
            <Route path="/add" element={<AddTeam />} />
            <Route path="/tutorials/:id" element={<Tutorial />} />
            <Route path="/teams" element={<TeamsList />} />
            <Route path="/matchs" element={<MatchsList />} />
            <Route path="/phases" element={<PhasesList />} />
            <Route path="/phases/:id" element={<PhaseView />} />

            <Route path="/admin/matchs" element={<MatchsEditor />} />
            <Route path="/admin/phase" element={<AddPhase />} />
          </Routes>
        </div>
      </div>
    );
  }
}

export default App;