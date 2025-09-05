import React, { useState, useEffect } from 'react';
import "../Styles/settings.css";
import { toast,ToastContainer } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
const Settings = () => {
    const accessToken = localStorage.getItem('access_token');
    const roles = ["Employee", "PMO", "Manager", "Time Keeper", 'Export'];
    const exclusiveRoles = ["Employee", "PMO", "Manager", "Time Keeper"];
    const [employees, setEmployees] = useState(null)
    const [minimumHR, setMinimumHR] = useState('');
    const [launchDate, setLaunchDate] = useState('');
    const [showPermission, setShowPermission] = useState(false);
    const [disable,setDisable]=useState(true);
    const [screenBlur, setScreenBlur] = useState(false);
    const [id, setId] = useState('');
    
    useEffect(() => {
        // fetchDropDown()
        fetchEmployeesRoles()
    }, [])

    const fetchEmployeesRoles = async () => {
        setScreenBlur(true)
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/employees-with-role-flags`, {
                method: "GET",
                headers: {
                    "Authorization": `${accessToken}`
                },
            });

            const result = await response.json();
            if (response.headers.get('Refresh-Token')) {
                localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
            }
            if (response.status === 401) {
                toast.error('Session expired', {
                    onClose: () => window.location.reload(),
                    toastId:'session'
                })
            }
            setId(result?.id)
            setMinimumHR(result?.min_hours || '')
            setLaunchDate(result?.launch_date)
            setEmployees(result?.list)
            if(result?.launch_date === null){
               setDisable(false)
            }
            // setList(result?.reportees?.reportees)


            // Map API result to options format
            setScreenBlur(false)
        } catch (err) {
            setScreenBlur(false)
            console.log(err);
        }
    }


    const handleRoleChange = (empId, selectedRole) => {
        const updatedEmployees = employees.map(emp => {
            if (emp.emp_id === empId) {
                const updatedRoles = { ...emp.user_type };

                if (selectedRole === "Export") {
                    // Toggle Exports only
                    updatedRoles["Export"] = updatedRoles["Export"] ? 0 : 1;
                } else {
                    // Deselect all other exclusive roles
                    for (let role of exclusiveRoles) {
                        updatedRoles[role] = (role === selectedRole) ? 1 : 0;
                    }
                }

                return {
                    ...emp,
                    user_type: updatedRoles
                };
            }
            return emp;
        });

        setEmployees(updatedEmployees);
    };

    const handleSubmit = async (e) => {
        setScreenBlur(true)
        let payload = {
            'id':id,
            "min_hours": minimumHR,
            "launch_date": launchDate,
            "list": employees
        }
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/settings-upsert`, {
                method: "POST",
                headers: {
                    "Authorization": `${accessToken}`,
                     "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.headers.get('Refresh-Token')) {
                localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
            }

            if (response.status === 401) {
                toast.error('Session expired', {
                    onClose: () => window.location.reload(),
                    toastId:'session'
                })
            }
            // setList(result?.reportees?.reportees)

            if(response.status === 200){
                toast.success('Permissions Saved Successfully',{
                    toastId:"permission-success"
                })
            }else{
                toast.error('Error in Permissions save',{
                    toastId:"permission-error"
                })
            }
            // Map API result to options format
            setScreenBlur(false)
            setDisable(true)
            fetchEmployeesRoles()
        } catch (err) {
            setScreenBlur(false)
            toast.error(`Error in Permissions save ${err.message}`,{toastId:"save-permission-error"})
        }
        // You can send `employees` to the backend here
    };

    const formatTime = (val) => {
        // Remove all non-digit characters
        const digits = val.replace(/\D/g, '');

        if (digits.length === 0) return '';
        if (digits.length <= 2) return digits.padStart(2, '0') + ':00';
        if (digits.length === 3) return digits.slice(0, 2) + ':' + digits.slice(2) + '0';
        if (digits.length >= 4) return digits.slice(0, 2) + ':' + digits.slice(2, 4);
    };

    const handleChange = (e) => {
        // Allow only digits while typing
        const digitsOnly = e.target.value.replace(/\D/g, '');
        if (digitsOnly.length <= 4) {
            setMinimumHR(digitsOnly);
        }
    };

    const handleBlur = () => {
        const formatted = formatTime(minimumHR);
        setMinimumHR(formatted);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            // Clear both the formatted and raw input
            setMinimumHR('');
            e.preventDefault(); // prevent default delete behavior
        }
    };


    // ------------------- UI Rendering -------------------
    return (
        <div id='settings' className={`setting-div ${screenBlur ? 'blurred' : ""}`}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {screenBlur && (
                <div className="screen-spinner">
                    <div className="spinner" />
                </div>
            )}
            <p className='settings-header'>Configurable Parameters :</p>
            <table className="settings-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Minimum Hours Per Day</td>
                        <td><input
                            value={minimumHR}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className='setting-inputs'
                        // placeholder="HH:MM"
                        /></td>

                    </tr>
                    <tr>
                        <td>App Launch Date</td>
                        <td>
                            {/* <input

                            type="date"
                            min={`${new Date().getFullYear()}-01-01`}
                            max={`${new Date().getFullYear()}-12-31`}
                            className="date-input"
                            value={launchDate}
                            disabled={disable}
                            onChange={(e) => setLaunchDate(e.target.value)}
                        /> */}
                         <div style={{ position: "relative", display: "inline-block" }}>
                                                    <DatePicker
                                                    id='input-setting-date'
                                                      selected={launchDate}
                                                     
                                                     onChange={(date) => setLaunchDate(date)}
                                                      dateFormat="dd-MMM-yyyy"  
                                                      min={`${new Date().getFullYear()}-01-01`}
                                                      max={`${new Date().getFullYear()}-12-31`}
                                                      placeholderText="dd-mm-yyyy"
                                                      className="date-input"
                                                      disabled={disable}
                                                      showMonthDropdown    
                                                showYearDropdown      
                                                dropdownMode="select"
                                                    />
                                                    <CalendarMonthOutlinedIcon
                                                      onClick={() => document.querySelector(".date-input").focus()}
                                                      style={{
                                                        position: "absolute",
                                                        right: 10,
                                                        top: "55%",
                                                        transform: "translateY(-50%)",
                                                        cursor: "pointer",
                                                        color: "black",
                                                        fontSize:"18px"
                                                      }}
                                                    />
                                                  </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Permissions</td>
                        <td> <a href="#" onClick={(e) => { e.preventDefault(); setShowPermission(!showPermission); }}>
                            Click
                        </a></td>
                    </tr>
                </tbody>
            </table>

            {showPermission &&
                (
                    <form className="settings-form" >
                        <div style={{ overflowX: "auto" }}>
                            <table className="permission-table">
                                <thead>
                                    <tr>
                                        <th>Users</th>
                                        {roles.map(role => (
                                            <th key={role}>{role}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.emp_id}>
                                            <td className="employee-cell">{emp.name}</td>
                                            {roles.map(role => (
                                                <td key={role}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!emp.user_type[role]}
                                                        onChange={() => handleRoleChange(emp.emp_id, role)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    </form>
                )
            }
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button type="submit" onClick={handleSubmit} className="btn">
                    Submit
                </button>
            </div>


        </div>
    );
};

export default Settings;
