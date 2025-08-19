const API_BASE = "http://localhost:8080";

const api = {
  async request(path, method = "GET", data) {
    const token = localStorage.getItem("token");
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }
    if (data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(API_BASE + path, options);
    if (!res.ok) {
      let errMsg = `Error ${res.status}`;
      try {
        const errData = await res.json();
        errMsg = errData.message || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  get(path) {
    return this.request(path, "GET");
  },
  post(path, data) {
    return this.request(path, "POST", data);
  },
  put(path, data) {
    return this.request(path, "PUT", data);
  },
  delete(path) {
    return this.request(path, "DELETE");
  },
};
