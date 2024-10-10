import http from "../http-common";

class TeamReferenceDataService {
    getAllByGroupId() {
        return http.get(`/team-references/group/${groupId}`);
    }

    get(id) {
        return http.get(`/team-references/${id}`);
    }

    getByTeamId(teamId) {
        return http.get(`/team-references/team/${teamId}`);
    }

    create(data) {
        return http.post(`/team-references`, data);
    }

    update(id, data) {
        return http.put(`/team-references/${id}`, data);
    }

    delete(id) {
        return http.delete(`/team-references/${id}`);
    }

    deleteAll() {
        return http.delete(`/team-references`);
    }
}

export default new TeamReferenceDataService();
