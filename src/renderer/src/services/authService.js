import api from "./api";

const login = async ({ username, password }) => {
  const res = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

export { login, logout };
