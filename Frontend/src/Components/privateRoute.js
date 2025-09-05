import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children }) => {
   const token = localStorage.getItem('access_token');
  // let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTkwMDAwMDAwLCJleHAiOjE1OTAwMDM2MDB9._F-UeMGZMOv4yQ4f9KHHE5aZDNkIOErphOlId1QJrPQ'

  function isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) {
        // No expiry info in token, consider it invalid or handle accordingly
        return true;
      }

      // JWT 'exp' is in seconds; convert to ms and compare to current time
      const expiryTime = decoded.exp * 1000;
      return Date.now() > expiryTime;
    } catch (error) {
      // Token is malformed or invalid
      return true;
    }
  }
  return isTokenExpired(token) === false ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;