import React, { useEffect, useState } from "react";
import "../Styles/Approve.css";
import Header from "../Components/header";
import TableCreationTimeSheet from "../Components/TableofCreateTimeSheet";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import HomeIcon from '@mui/icons-material/Home';

const Approve = () => {
  const accessToken = localStorage.getItem('access_token');
  const permissions = localStorage.getItem('permissions');
  const [rejectionComments, setRejectionComments] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projectRows, setProjectRows] = useState({});
  const [projectsData, setProjectsData] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [buttonStates, setButtonStates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [screenBlur, setScreenBlur] = useState(false);
  const [weekDayList, setWeekDayList] = useState([]);
  const [totalWeekTime, setTotalWeekTime] = useState("");
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (location.state?.employeeData) {
      const empData = location.state.employeeData;
      setEmployeeData(empData);
      const startDate = new Date(empData.start_date);
      setWeekDays(getWeekDays(startDate));
      fetchTimeEntries(empData);
    }

  }, [location]);

  useEffect(() => {
    let total = 0;

    Object.values(projectRows).forEach((tasks) => {

      tasks.forEach((task) => {
        weekDayList.forEach((day) => {
          const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
          const timeStr = task.timeEntries?.[dayLabel] || "0:00";
          total += convertToMinutes(timeStr);
        });
      });
    });





    setTotalWeekTime(total);
  }, [projectRows, weekDayList]);

  const getWeekDays = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return day;
    });
  };

  const convertToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // const fetchTimeEntries = async (empData) => {
  //     try {
  //         setIsLoading(true);
  //         const formData = new FormData();
  //         formData.append("emp_id", empData.emp_id);
  //         formData.append("start_date", empData.start_date);
  //         formData.append("end_date", empData.end_date);

  //         const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_details`, {
  //             method: "POST",
  //             body: formData,
  //         });

  //         if (!response.ok) {
  //             throw new Error("Network response was not ok");
  //         }

  //         const apiResponse = await response.json();

  //         const submittedEntries = apiResponse.timeEntries?.filter(
  //             entry => entry.status_flag === "submitted"
  //         ) || [];

  //         setTimeEntries(submittedEntries);

  //         if (apiResponse?.employeeProjects?.length > 0) {
  //             const allProjects = apiResponse.employeeProjects[0].projects || [];

  //             const projectsWithSubmissions = new Map();
  //             submittedEntries.forEach(entry => {
  //                 if (!projectsWithSubmissions.has(entry.project_code)) {
  //                     const project = allProjects.find(
  //                         p => p.projectCode === entry.project_code
  //                     );
  //                     if (project) {
  //                         projectsWithSubmissions.set(entry.project_code, project);
  //                     }
  //                 }
  //             });

  //             const submittedProjects = Array.from(projectsWithSubmissions.values());
  //             setProjectsData(submittedProjects);

  //             const newProjectRows = {};
  //             const initialButtonStates = {};

  //             submittedProjects.forEach(project => {
  //                 const projectKey = `project_${project.projectCode}`;

  //                 const submittedTasks = new Map();
  //                 submittedEntries
  //                     .filter(entry => entry.project_code === project.projectCode)
  //                     .forEach(entry => {
  //                         if (!submittedTasks.has(entry.task_code)) {
  //                             const task = project.tasks.find(
  //                                 t => t.taskCode === entry.task_code
  //                             );
  //                             if (task) {
  //                                 submittedTasks.set(entry.task_code, task);
  //                             }
  //                         }
  //                     });

  //                 const taskRows = Array.from(submittedTasks.values()).map(task => {
  //                     const timeEntries = {};
  //                     const timeEntryIDs = {};
  //                     const remarks = {}

  //                     weekDays.forEach(day => {
  //                         const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
  //                         timeEntries[dayLabel] = "";
  //                     });

  //                     submittedEntries
  //                         .filter(entry =>
  //                             entry.project_code === project.projectCode &&
  //                             entry.task_code === task.taskCode
  //                         )
  //                         .forEach(entry => {
  //                             const entryDate = new Date(entry.entry_date);
  //                             const dayLabel = entryDate.toLocaleDateString("en-GB", { weekday: "long" });
  //                             timeEntries[dayLabel] = entry.time_spent || "0:00";
  //                             timeEntryIDs[dayLabel] = entry.id;
  //                             remarks[dayLabel] = entry.remark || '';
  //                         });

  //                     const sampleEntry = submittedEntries.find(
  //                         e => e.project_code === project.projectCode
  //                     );

  //                     return {
  //                         taskCode: task.taskCode,
  //                         taskName: task.taskName,
  //                         remarks,
  //                         isChecked: sampleEntry?.is_billable ?? false,
  //                         timeEntries,
  //                         timeEntryIDs
  //                     };
  //                 });

  //                 if (taskRows.length > 0) {
  //                     newProjectRows[projectKey] = taskRows;
  //                     initialButtonStates[projectKey] =
  //                         submittedEntries.find(e => e.project_code === project.projectCode)?.is_billable
  //                             ? "B" : "NB";
  //                 }
  //             });

  //             setProjectRows(newProjectRows);
  //             setButtonStates(initialButtonStates);
  //         }
  //     } catch (error) {
  //         console.error("Error fetching time entries:", error);
  //         toast.error("Failed to load timesheet data");
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };
  const fetchTimeEntries = async (empData) => {
    try {
      setScreenBlur(true)
      const formData = new FormData();
      formData.append("target_emp_id", empData.emp_id);
      formData.append("start_date", empData.start_date);
      formData.append("end_date", empData.end_date);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approval_fetch_explicit`, {
        headers: {
          "Authorization": `${accessToken}`
        },
        method: "POST",
        body: formData,
      });

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:"fetch-session"
        })
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const apiResponse = await response.json();
      if (response.headers.get('Refresh-Token')) {
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

      const newProjectRows = {};
      const timeEntriesFromAPI = apiResponse.entries[0].time_entries;



      const groupedByProject = {};
      timeEntriesFromAPI.forEach(entry => {
        const projectKey = `project_${entry.project_code}`;

        if (!groupedByProject[projectKey]) {
          groupedByProject[projectKey] = {};
        }

        const billableKey = `${entry.task_code}_${entry.is_billable}`;

        if (!groupedByProject[projectKey][billableKey]) {
          groupedByProject[projectKey][billableKey] = {
            taskCode: entry.task_code,
            taskName: entry.task_name,
            isChecked: entry.is_billable,
            weekentry_id: entry.weekentry_id,
            projectName: entry.project_name,
            timeEntries: {},
            timeEntryIDs: {},
            remarks: {},
            is_allowed_approval: entry.is_allowed_approval,
          };
        }

        const entryDate = new Date(entry.entry_date);
        const dayLabel = entryDate.toLocaleDateString("en-GB", { weekday: "long" });

        groupedByProject[projectKey][billableKey].timeEntries[dayLabel] = entry.time_spent || "";
        groupedByProject[projectKey][billableKey].timeEntryIDs[dayLabel] = entry.id || "";
        groupedByProject[projectKey][billableKey].remarks[dayLabel] = entry.remark || "";
      });

      // Now, transform the grouped data into the final `newProjectRows`
      Object.keys(groupedByProject).forEach(projectKey => {
        newProjectRows[projectKey] = Object.values(groupedByProject[projectKey]);
      });

      setProjectRows(newProjectRows);
      if (response.status === 200) {
        setScreenBlur(false)
      }
      // setButtonStates(initialButtonStates);
      // }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      toast.error("Failed to load timesheet data", {
        onClose: () => navigate("/CreateTimesheet", {
          state: { selectedTab: "Approvals" }
        }),toastId:"fetch-erro"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Naveen Retun null data for errors 
  const prepareApprovalPayload = (status) => {
    const timeEntries = [];
    let isValid = true;

    for (const [projectKey, tasks] of Object.entries(projectRows)) {
      const projectCode = projectKey.replace("project_", "");

      for (const task of tasks) {
        if (task.is_allowed_approval === false) {
          continue;
        }
        for (const day of weekDays) {
          const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
          const entryId = task.timeEntryIDs?.[dayLabel];
          const timeSpent = task.timeEntries?.[dayLabel];
          const remarks = task.remarks?.[dayLabel] || '';
          const deleteDay = task.deletedDay?.[dayLabel];

          if ((timeSpent && timeSpent !== "0:00") || deleteDay) {
            if (!remarks.trim()) {
              toast.error(`Please enter remark for the time(s) entered`,{
                toastId:"prep-remarks"
              });
              isValid = false;
              return null; 
            }

            if (remarks.trim().length < 20) {
              toast.error(`Missing 20 characters in remarks`,{
                toastId:"prep-20remarkenter"
              });
              isValid = false;
              return null; 
            }
                let ticketNumber = null;
                let baseProjectCode = projectCode;

                if (projectCode.includes("-")) {
                  const parts = projectCode.split("-");
                  baseProjectCode = parts[0];   // "5"
                  ticketNumber = parts[1];      // "38479"
                }
                const normalizeProjectCode = (baseProjectCode) => {
                  if (typeof baseProjectCode === "string" && !isNaN(baseProjectCode)) {
                    return Number(baseProjectCode);
                  }
                  return baseProjectCode;
                };
            timeEntries.push({
              id: entryId || null,
              week_start_date: employeeData.start_date,
              week_end_date: employeeData.end_date,
              project_code: normalizeProjectCode(baseProjectCode),
              ticket_number: ticketNumber,
              project_name: task.projectName,
              task_code: task.taskCode,
              task_name: task.taskName,
              weekentry_id: task.weekentry_id,
              is_billable: task.isChecked ?? true,
              remark: remarks,
              entry_date: formatDate(day),
              time_spent: deleteDay ? '00:00' : timeSpent,
              status_flag: status,
              approver_remarks: rejectionComments,
              approved_by: localStorage.getItem("emp_id")
            });
          }
        }
      }
    }

    if (!isValid || timeEntries.length === 0) {
      return null;
    }

    return {
      entries: [{
        employee_id: employeeData.emp_id,
        employee_name: employeeData.emp_name,
        time_entries: timeEntries
      }]
    };
  };



  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleApprove = async () => {
    if (!permissions.includes('approve_timesheet')) {
      toast.error("Access denied",{
        toastId:"approve-denied"
      });
      setScreenBlur(false)
      return;
    }
    setScreenBlur(true)
    try {
      const payload = prepareApprovalPayload("approved");
      //Naveen Return if no data in payload
      if (!payload) {
        setScreenBlur(false)
        toast.warn('You are not authorized to Approve other projects',{
          toastId:"authorized"
        })
        return
      }
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approve_timesheet_explicit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${accessToken}`
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
          toastId:"approve-session"
        })
      }
      if (response.ok && result.status === true) {
        toast.success("Timesheet approved successfully", {
          onClose: () => {
            navigate("/CreateTimesheet", {
              state: { selectedTab: "Approvals" }
            });
          }
        });
      } else {
        throw new Error(result.message || "Failed to approve timesheet");
      }
    } catch (error) {
      setScreenBlur(false)
      console.error("Approval error:", error);
      toast.error(`Approval failed: ${error.message}`,{
        toastId:"failed-handleApproved"
      });
    }
  };

  const handleReject = async () => {

    if (!permissions.includes('reject_timesheet')) {
      let id = 'reject-accessdenied'
      if (!toast.isActive(id)) {
        toast.error("Access denied", {
          toastId: id
        });
      }
      return;
    }

    setScreenBlur(true)
    
    
    try {
      const payload = prepareApprovalPayload("rejected");
      //Naveen Return if no data in payload
      if (!payload) {
        setScreenBlur(false)
        let id = 'authorized'
        toast.dismiss(id)
        toast.warn('You are not authorized to Reject other projects', {
          toastId: id
        })
        return
      }

      if (rejectionComments.trim() === "") {
        let id = 'rejection-comments';
        toast.dismiss(id)
        toast.error("Please enter rejection comments", {
          toastId: id
        });
        setScreenBlur(false);
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approve_timesheet_explicit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${accessToken}`
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
          toastId:"reject-session"
        })
      }
      if (response.ok && result.status === true) {
        toast.success("Timesheet rejected successfully", {
          onClose: () => {
            navigate("/CreateTimesheet", {
              state: { selectedTab: "Approvals" }
            });
          },toastId:"reject-successfully"
        });
      } else {
        throw new Error(result.message || "Failed to reject timesheet");
      }
    } catch (error) {
      setScreenBlur(false)
      console.error("Rejection error:", error);
      toast.error(`Rejection failed: ${error.message}`,{
        toastId:"reject-err"
      });
    }
  };

  // const handleBack = () => {
  //     navigate("/CreateTimesheet", {
  //         state: { selectedTab: "Approvals" }
  //     });
  // };

  const handleBack = () => {
    localStorage.setItem("selectedTab", "Approvals"); // Save the tab state
    navigate("/CreateTimesheet");
  };


  const handleBackhome = () => {
    navigate("/CreateTimesheet", {
      state: { selectedTab: "create" }
    });
  };

  const handleComments=(e)=>{
    e.preventDefault();
    toast.dismiss('rejection-comments')
    toast.dismiss('authorized')
    setRejectionComments(e.target.value)
  }

  const formatWeekRange = (weekRangeStr) => {
    if (!weekRangeStr || !weekRangeStr.includes(" to ")) return weekRangeStr;

    const [start, end] = weekRangeStr.split(" to ");
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedStart = startDate.toLocaleDateString("en-GB", options).replace(/ /g, "-");
    const formattedEnd = endDate.toLocaleDateString("en-GB", options).replace(/ /g, "-");

    return `${formattedStart} to ${formattedEnd}`;
  };

  if (!employeeData) {
    return;
  }

  return (
    <>


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
      <Header />
      <div className={`over-all-bg ${screenBlur ? 'blurred' : ""}`}>
        {screenBlur && (
          <div className="screen-spinner">
            <div className="spinner" />
          </div>
        )}
        <div className="apporvetable-align">
          <div className="home-icon" onClick={handleBackhome} style={{ cursor: 'pointer' }}>
            <HomeIcon />
          </div>

          <div className="employee-name">
            {employeeData.emp_name} ({formatWeekRange(employeeData.week_range)})
          </div>
          <div className="timesheet-view-wrappers">
            <div className="approvetime">

              <>
                <TableCreationTimeSheet
                  projectRows={projectRows}
                  setProjectRows={setProjectRows}
                  projectsData={projectsData}
                  weekDays={weekDays}
                  isTableDisabled={false}
                  timeEntries={timeEntries}
                  buttonStates={buttonStates}
                  isApprovalMode={true}
                  setWeekDayList={setWeekDayList}
                />
                <div className="hours-container" style={{ marginLeft: '0px' }}>
                  <div className="reject">
                    <div className="reject-comments">Comments</div>
                    <textarea
                      className="reject-input"
                      value={rejectionComments}
                      onChange={(e) => handleComments(e)}
                      placeholder="Enter your comments here"
                      rows={5}
                    />
                  </div>
                  <div className="total-week-hours" style={{ flexDirection: 'column' }}>
                    <span className="tab-text"><strong>Total Week Hours: </strong>{Math.floor(totalWeekTime / 60).toString().padStart(2, '0')}:
                      {(totalWeekTime % 60).toString().padStart(2, '0')} hrs</span>

                    <div className="action-button" style={{ paddingTop: '0px', paddingRight: '0px', paddingLeft: '0px' }}>
                      <button
                        className="reject-btn"
                        disabled={Object.keys(projectRows).length === 0}
                        onClick={handleReject}
                      >
                        Reject
                      </button>
                      <button
                        className="approve-btn"
                        disabled={Object.keys(projectRows).length === 0}
                        onClick={handleApprove}
                      >
                        Approve
                      </button>
                    </div>
                  </div>

                </div>



                <div className="button">
                  <div className="back" style={{ paddingTop: "0px", margin: '0px' }}>
                    <button className="back-btn" onClick={handleBack}>
                      Back
                    </button>
                  </div>

                </div>
              </>

            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default Approve;