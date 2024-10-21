import http from "../http-common";

class TournamentDataService {
    getAll() {
        return http.get("/tournaments");
    }

    get(id) {
        return http.get(`/tournaments/${id}`);
    }

    create(data) {
        return http.post("/tournaments", data);
    }

    update(id, data) {
        return http.put(`/tournaments/${id}`, data);
    }

    delete(id) {
        return http.delete(`/tournaments/${id}`);
    }

    deleteAll() {
        return http.delete(`/tournaments`);
    }

    // Matchs
    getMatch(data) {
        return http.get(`/tournaments/${data.tournamentId}/phases/${data.phase}/groups/${data.group}/matchs/${data.match}`);
    }
}

export default new TournamentDataService();
