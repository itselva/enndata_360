import React, { useEffect, useState } from "react";
import "../Styles/ViewTimeSheet.css";
import Header from "../Components/header";
import TableCreationTimeSheet from "../Components/TableofCreateTimeSheet";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import HomeIcon from '@mui/icons-material/Home';

const ViewTimeSheet = () => {
  // const [rejectionComments, setRejectionComments] = useState("");
  const accessToken = localStorage.getItem('access_token');
  const [employeeData, setEmployeeData] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projectRows, setProjectRows] = useState({});
  const [projectsData, setProjectsData] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [buttonStates, setButtonStates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [weekDayList, setWeekDayList] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [totalWeekTime, setTotalWeekTime] = useState("");
  const [, setApproverDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [ARMessage, setARMessage] = useState('');
  const [status, setStatus] = useState('')


  useEffect(() => {
    if (location.state?.employeeData) {
      const empData = location.state.employeeData;
      setEmployeeData(empData);
      const startDate = new Date(empData.start_date);
      const computedWeekDays = getWeekDays(startDate);
      setWeekDays(computedWeekDays);
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
    setTotalWeekTime(total)
  }, [projectRows, weekDayList]);

  // Trigger only when weekDays are updated
  useEffect(() => {
    if (employeeData && weekDays.length > 0) {
      fetchTimeEntries(employeeData);
    }
  }, [employeeData, weekDays]);

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

  const fetchTimeEntries = async (empData) => {
    try {
      setIsLoading(true);

      // Build form data
      const formData = new FormData();
      formData.append("fetch_id", empData.emp_id);
      formData.append("start_date", empData.start_date);
      formData.append("end_date", empData.end_date);
      // Make the API call to updated endpoint
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_details`, {
        headers: {
          "Authorization": `${accessToken}`
        },
        method: "POST",
        body: formData,
      });

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: "fetch-session-expired"
        })
      }

      if (!response.ok) throw new Error("Network response was not ok");

      const apiResponse = await response.json();
      if (response.headers.get('Refresh-Token')) {
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      const allEntries = apiResponse.timeEntries || [];

      // // Filter entries by status
      // const submittedEntries = allEntries.filter(e => e.status_flag === "submitted");
      // const approvedEntries = allEntries.filter(e => e.status_flag === "approved");
      // const rejectedEntries = allEntries.filter(e => e.status_flag === "rejected");

      // // Approval status metadata
      // if (approvedEntries.length > 0) {
      //   setApprovalStatus("approved");
      //   setApproverDetails({
      //     name: approvedEntries[0].approved_by_name || approvedEntries[0].approved_by,
      //     date: approvedEntries[0].approval_date,
      //     comments: approvedEntries[0].approver_remarks,
      //   });
      // } else if (rejectedEntries.length > 0) {
      //   setApprovalStatus("rejected");
      //   setApproverDetails({
      //     name: rejectedEntries[0].approved_by_name || rejectedEntries[0].approved_by,
      //     date: rejectedEntries[0].approval_date,
      //     comments: rejectedEntries[0].approver_remarks,
      //   });
      // }

      // Choose entries to display
      // const entriesToDisplay =
      //   submittedEntries.length > 0
      //     ? submittedEntries
      //     : approvedEntries.length > 0
      //       ? approvedEntries
      //       : rejectedEntries;

      //       console.log("entriesToDisplay",submittedEntries,approvedEntries)
      // setTimeEntries(entriesToDisplay);

      // Generate weekDays from start_date
      const getWeekDays = (startDateStr) => {
        const start = new Date(startDateStr);
        const days = [];
        for (let i = 0; i < 7; i++) {
          const next = new Date(start);
          next.setDate(start.getDate() + i);
          days.push(next);
        }
        return days;
      };

      const weekDays = getWeekDays(empData.start_date);

      if (apiResponse?.employeeProjects?.length > 0) {
        const allProjects = apiResponse.employeeProjects[0].projects || [];

        const projectsWithEntries = new Map();
        allEntries.forEach(entry => {
          if (!projectsWithEntries.has(entry.project_code)) {
            const project = allProjects.find(p => p.projectCode === entry.project_code);
            if (project) {
              projectsWithEntries.set(entry.project_code, project);
            }
          }
        });



        const displayProjects = Array.from(projectsWithEntries.values());
        setProjectsData(displayProjects);
        const newProjectRows = {};
        const initialButtonStates = {};

        displayProjects.forEach(project => {
          const projectKey = `project_${project.projectCode}`;
          const taskRows = [];
          const taskKeyMap = {};

          allEntries
            .filter(e => e.project_code === project.projectCode)
            .forEach(entry => {
              if (!project.tasks) {
                return;
              }

              if (entry.status_flag === 'approved' || entry.status_flag === 'rejected') {
                setARMessage(entry.approver_or_rejected_remarks);
                setStatus((entry.status_flag || '').trim().charAt(0).toLocaleUpperCase() + (entry.status_flag || '').trim().slice(1))
              }
              const task = project.tasks.find(t => t.taskCode === entry.task_code);


              if (!task) return;

              const taskKey = `${entry.task_code}_${entry.is_billable}`;
              if (!taskKeyMap[taskKey]) {
                const timeEntries = {};
                const timeEntryIDs = {};
                const remarks = {};

                weekDays.forEach(day => {
                  const label = day.toLocaleDateString("en-GB", { weekday: "long" });
                  timeEntries[label] = "";
                  remarks[label] = "";
                });
                taskKeyMap[taskKey] = {
                  taskCode: task.taskCode,
                  taskName: task.taskName,
                  timeEntries,
                  remarks,
                  timeEntryIDs,
                  isChecked: entry.is_billable,
                  status: entry.status_flag
                };
              }

              const entryDate = new Date(entry.entry_date);
              const label = entryDate.toLocaleDateString("en-GB", { weekday: "long" });

              taskKeyMap[taskKey].timeEntries[label] = entry.time_spent || "0:00";
              taskKeyMap[taskKey].timeEntryIDs[label] = entry.id;
              taskKeyMap[taskKey].remarks[label] = entry.remark || "";
            });

          Object.values(taskKeyMap).forEach(row => taskRows.push(row));

          if (taskRows.length > 0) {
            newProjectRows[projectKey] = taskRows;
            const anyBillable = allEntries.some(
              e => e.project_code === project.projectCode && e.is_billable
            );
            initialButtonStates[projectKey] = anyBillable ? "B" : "NB";
          }
        });

        setProjectRows(newProjectRows);
        setButtonStates(initialButtonStates);
      } else {
        console.warn("No employeeProjects found in API response.");
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      toast.error("Failed to load timesheet data", {
        toastId: "failed-to-load-TS"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // localStorage.setItem("selectedTab", "report"); // Save the tab state
    navigate("/CreateTimesheet", {
      state: { activeTab: "reports" }
    });
  };

  if (!employeeData) {
    return;
  }
  return (
    <div>
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
      <div className={`over-all-bg `}>
        <div className="apporvetable-align">
          <div className="home-icon" onClick={() => navigate('/CreateTimeSheet')} style={{ cursor: 'pointer' }}>
            <HomeIcon />
          </div>

          <div className="employee-name">
            {formatWeekRange(employeeData?.week_range)}
          </div>
          <div className="timesheet-view-wrappers">
            <div className="approvetime">
              {isLoading ? (
                <div className="loader-container">
                  <div className="loader"></div>
                </div>
              ) : (
                <>
                  <TableCreationTimeSheet
                    projectRows={projectRows}
                    setProjectRows={setProjectRows}
                    projectsData={projectsData}
                    weekDays={weekDays}
                    stateDisable={true}
                    timeEntries={timeEntries}
                    buttonStates={buttonStates}
                    isApprovalMode={true}
                    approvalStatus={approvalStatus}
                    viewmode={true}
                    setWeekDayList={setWeekDayList}
                    className="table"
                  />
                  <div className="summary-container">
                    {status === 'Approved' || status === 'Rejected' ? (
                      <div className="ar-section">
                        <div className="AR-data">{status} remarks</div>
                        <div className="AR-data AR-message">{ARMessage}</div>
                      </div>
                    ) : (
                      <div className="ar-section" />  // Placeholder to keep layout
                    )}


                    <div className="total-week-hours">
                      <span className="tab-text"><strong>Total Week Hours: </strong>{Math.floor(totalWeekTime / 60).toString().padStart(2, '0')}:
                        {(totalWeekTime % 60).toString().padStart(2, '0')} hrs</span>
                    </div>
                  </div>
                  <div className="back-div">
                    <button className="view-back" onClick={handleBack}>
                      Back
                    </button>
                  </div>

                  {/* <div className="hours-container-view">
                    <div className="total-week-hours">
                      <span className="tab-text"><strong>Total Week Hours: </strong>{Math.floor(totalWeekTime / 60).toString().padStart(2, '0')}:
                        {(totalWeekTime % 60).toString().padStart(2, '0')} hrs</span>
                    </div>
                  </div> */}
                  <div className="button">
                    {/* <div className="back">
                      <button className="back-btn" onClick={handleBack}>
                        Back
                      </button>
                    </div> */}

                  </div>
                  {/* <div className="hours-container">
                <div className="total-week-hours">
                  <div>Total Week Hours:</div>
                  <div>
                    {Math.floor(totalWeekTime / 60).toString().padStart(2, '0')}:
                    {(totalWeekTime % 60).toString().padStart(2, '0')} hrs
                  </div>
                </div>
              </div> */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTimeSheet;