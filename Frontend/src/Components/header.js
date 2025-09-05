import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/header.css";
import logo from "../assets/Ennvee_logo.svg";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";

function Header() {
  const accessToken = localStorage.getItem('access_token')
  const [employeeData, setEmployeeData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const empName = localStorage.getItem("emp_name");
  const emp_code = localStorage.getItem("emp_code");
  const user_role = localStorage.getItem("user_role");
  const work_location = localStorage.getItem("work_location");
  const department = localStorage.getItem("department");
  const profileRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("emp_id");
    if (!userId) return;
    setUserId(userId)
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const getUser = async () => {
    const formData = new FormData();
    formData.append("emp_id", userId);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_details`, {
      headers: {
        "Authorization": `${accessToken}`
      },
      method: "POST",
      body: formData,
    })

      .then((res) => {
        const refreshToken = res.headers.get('Refresh-Token');
        if (refreshToken) {
          localStorage.setItem('access_token', refreshToken);
        }
        if (res.data && Array.isArray(res.data.employeeProjects)) {
          const employee = res.data.employeeProjects[0];
          setEmployeeData(employee);
        }
      })
      .catch((err) => {
        console.error("Error fetching employee data:", err.message);
      });
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="header">
      <div className="left">
        <img
          src={logo}
          alt="Logo"
          className="logo"
          onClick={() => (window.location.href = "/CreateTimesheet")}
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="right">
        <div className="profile-box" onClick={toggleDropdown} ref={profileRef}>
          <AccountCircleIcon className="icon" />
          <span className="profile-name">{empName || "Guest"}</span>
          <ArrowDropDownIcon className="dropdown-icon" />
          {showDropdown && (
            <div className="dropdown-container">
              {/* <div className="dropdown-close" onClick={toggleDropdown}>
      <CloseIcon fontSize="small" />
    </div> */}
              <div className="profile-header">Profile</div>
              <div className="profile-item">
                <span className="label">Designation</span>
                <span className="value">
                  {(emp_code.includes('CBL') || emp_code.includes('USC')) ? `${user_role} (Contractor)` : (user_role || "Manager")}
                </span>
              </div>
              <div className="profile-item">
                <span className="label">Department</span>
                <span className="value">
                  {department || "Data&AI"}
                </span>
              </div>
              <div className="profile-item">
                <span className="label">Location</span>
                <span className="value">
                  {work_location || "Chennai"}
                </span>
              </div>
              {/* <div className="profile-item">
                <span className="label">Cost Centre</span>
                <span className="value">
                  {employeeData?.costCentre ||
                    "Lorem ipsum dolo"}
                </span>
              </div> */}
              <button onClick={() => navigate("/ChangePassword")} className="change-password">Change Password</button>
            </div>
          )}
        </div>
        <PowerSettingsNewIcon className="logout-icon" onClick={logout} />
      </div>
    </div>
  );
}

export default Header;
