import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import api, { setAuthToken } from "../api";

const Logout = ({ onLogout }) => {
  const history = useHistory();

  useEffect(() => {
    const logout = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser?.refreshToken) {
        try {
          await api.post('api/logout', { refreshToken: storedUser.refreshToken });
        } catch (err) {
          console.error(err.response?.data || err.message);
        }
      }

      // Cleanup
      localStorage.removeItem('user');
      setAuthToken(null);
      onLogout();
      history.push('/login');
    };

    logout();
  }, [onLogout, history]);

  return <div className="container"><h2>You are logged out!</h2></div>;
};

export default Logout;