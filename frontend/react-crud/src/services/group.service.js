import http from "../http-common";

class GroupDataService {
    getAll() {
        return http.get("/groups");
    }

    get(id) {
        return http.get(`/groups/${id}`);
    }

    getByPhaseId(phaseId) {
        return http.get(`/groups/WithPhase/${phaseId}`);
    }

    create(data) {
        return http.post("/groups", data);
    }

    update(id, data) {
        return http.put(`/groups/${id}`, data);
    }

    delete(id) {
        return http.delete(`/groups/${id}`);
    }

    deleteAll() {
        return http.delete(`/groups`);
    }
}

export default new GroupDataService();
