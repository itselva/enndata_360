//-----------------import section--------------------------------//
import "../Styles/Table.css";
import "../index.css";
import { useState, useRef, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { getStartOfWeek } from '../Pages/CreateTimesheet';
import { getEndOfWeek } from '../Pages/CreateTimesheet';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useMemo } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useLocation, useNavigate } from "react-router-dom";

//--------------------declaration part----------------//
function TableCreationTimeSheet(props) {
  const {
    weekDayList,
    setTotalWeekMinutes,
    selectedEmpId,
    onRefetchReady,
    isRejectPage,
    setFinalStatus,
    setProjectRows,
    projectRows,
    projectsData,
    setProjectsData,
    setWeekDayList,
    isApprovalMode,
    finalStatus,
    stateDisable,
    setARMessage,
    viewmode = false,
    setStateDisable,
    activeSubTab, // <-- include this here
    setrevertSelected,
    revertSelected,
    setRevertDate,
    setShowPMO,
    setEnableWeekShow,
    setEnableWeek,
    notSubmittedCount,
    setNotSubmittedCount,
    setNotSubmittedLocked,
    notSubmittedLocked,
    showPartiallyApproved,
    setShowPartiallyApproved,
    setSelectedEmpId,
    isSubmitted,
    setIsSubmitted,
    setSubmitOnly,
    reload
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');
  const minDate=localStorage.getItem('launch_date');
  const [currentDate, setCurrentDate] = useState(() => {
    if (location.state?.status === 'Rejected') {
      return new Date(location.state?.employeeData?.start_date);
    }

    const savedDataRaw = localStorage.getItem('Saved_Data');
    try {
      const savedData = savedDataRaw ? JSON.parse(savedDataRaw) : null;
      if (savedData?.start) {
        return new Date(savedData.start);
      }
    } catch (err) {
      console.warn('Invalid Saved_Data format:', err);
    }

    return new Date(); // default to current date
  });

  const [showRemarkPopup, setShowRemarkPopup] = useState(false);
  const permissions = localStorage.getItem('permissions');
  const user_role = localStorage.getItem('user_role');
  const [selectedRemark, setSelectedRemark] = useState('');
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [clickedProjects, setClickedProjects] = useState({});
  const [activeTab, setActiveTab] = useState("Allocated Projects");
  const [ButtonStates, setButtonStates] = useState({});
  const [activeInputs, setActiveInputs] = useState({});
  const [TimeEntries, setTimeEntries] = useState([]);
  const [RowErrors, setRowErrors] = useState({});
  const [ColumnErrors, setColumnErrors] = useState({});
  const [selectedProjectKey, setSelectedProjectKey] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [activeDay, setActiveDay] = useState('mon');
  const [isDisabled, setIsDisabled] = useState({});
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [dialogSelectedProjects, setDialogSelectedProjects] = useState([]);
  const [popupTaskName, setPopupTaskName] = useState([]);
  const [popupProjectTitle, setPopupProjectTitle] = useState([]);
  const selectedEmpIdRef = useRef();
  const [screenBlur, setScreenBlur] = useState(false);
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const [remarkWarning, setRemarkWarning] = useState(false);
  const [bulkProjectKey, setBulkProjectKey] = useState([])
  const label = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Inside your component
  const dateInputRef = useRef(null);
  const originalValueRef = useRef({});
  const lastAlertedKeyRef = useRef(null); // to store last alerted field
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setCurrentDate(selectedDate);
  };
  // ----------validation row and columns 40hr && 8hr--------------//

  useEffect(() => {
    selectedEmpIdRef.current = selectedEmpId?.value;
  }, [selectedEmpId]);

  //  useEffect(() => {
  //   if (location.state?.status === "Rejected") {
  //     console.log(location, "location");
  //     const startDate = location.state?.employeeData?.start_date;
  //     if (startDate) {
  //       setCurrentDate(new Date(startDate));
  //     }
  //   }
  // }, [location.state]);

  const validateTimesheet = () => {
    const newRowErrors = {};
    const newColumnErrors = {};

    // Initialize column totals
    const columnTotals = {};
    weekDays.forEach(day => {
      const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
      columnTotals[dayLabel] = 0;
    });

    // Row validation
    Object.entries(projectRows).forEach(([projectKey, rows]) => {
      rows.forEach((row, rowIndex) => {
        let rowTotal = 0;
        weekDays.forEach(day => {
          const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
          const val = parseFloat(row.timeEntries?.[dayLabel]) || 0;
          rowTotal += val;
          columnTotals[dayLabel] += val;
        });

        if (rowTotal !== 40) {
          newRowErrors[`${projectKey}-${rowIndex}`] = true;
        }
      });
    });

    // Column validation
    Object.entries(columnTotals).forEach(([dayLabel, total]) => {
      if (total !== 8) {
        newColumnErrors[dayLabel] = true;
      }
    });

    // setRowErrors(newRowErrors);
    // setColumnErrors(newColumnErrors);
  };



  // ----week start -----//
  // const getStartOfWeek2 = (date) => {
  //   const start = new Date(date);
  //   const day = start.getDay();
  //   const diffToMonday = day === 0 ? -6 : 1 - day;
  //   start.setDate(start.getDate() + diffToMonday);
  //   return start;
  // };

  //  -----weekDays ------
  const getWeekDays = (startOfWeek) => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };


  //  -----billiable and nonbillable btn click-----//
  //  const handleButtonToggle = (projectKey, index) => {
  //   setProjectRows(prev => {
  //     const updated = [...prev[projectKey]];
  //     const row = { ...updated[index] }; // Clone the row object
  //     row.isChecked = !row.isChecked;   // Toggle only this row
  //     updated[index] = row;

  //     return {
  //       ...prev,
  //       [projectKey]: updated,
  //     };
  //   });
  // };

  const handleButtonToggle = (projectKey, index) => {
    const currentRow = projectRows[projectKey][index];
    // Only show confirmation in manager approval view when changing from B to NB
    if (isApprovalMode && currentRow.isChecked) {
      const shouldProceed = window.confirm(
        "This is billable. Confirm non-billable update"
      );
      if (!shouldProceed) {
        return; // Don't proceed if user cancels
      }
    }

    // Proceed with the toggle
    setProjectRows(prev => {
      const updated = [...prev[projectKey]];
      const row = { ...updated[index] };
      row.isChecked = !row.isChecked;
      updated[index] = row;
      return {
        ...prev,
        [projectKey]: updated,
      };
    });
  };


  // ----DoubleArrow PrevMonth action-----//
  // const handlePrevMonth = () => {
  //   setCurrentDate(prevDate => {
  //     const newDate = new Date(prevDate);
  //     newDate.setMonth(prevDate.getMonth() - 1);
  //     newDate.setDate(1);
  //     return newDate >new Date(minDate) ? newDate : prevDate;
  //   });
  // };

  const handlePrevMonth = () => {
  setCurrentDate(prevDate => {
    const newDate = new Date(prevDate);
    newDate.setMonth(prevDate.getMonth() - 1);
    newDate.setDate(1); // Go to the start of the previous month

    const endOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0); // last day of new month

    if (endOfMonth < new Date(minDate)) {
      return prevDate; // Don't allow navigating if entire month is before minDate
    }

    return newDate;
  });
};


  

  // ----DoubleArrow NextMonth action-----------//
  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      newDate.setDate(1);
      return newDate;
    });
  };


  // ----single arrow action PrevWeek----//
  // const handlePrevWeek = () =>
  //   setCurrentDate(prev => {
  //     const newDate = new Date(prev);
  //     newDate.setDate(newDate.getDate() - 7);

  //      return newDate >new Date(minDate) ? newDate : prev;
  //   });

  const handlePrevWeek = () => {
  setCurrentDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(newDate.getDate() - 7);

    const endOfWeek = new Date(newDate);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // end of that week

    if (endOfWeek < new Date(minDate)) {
      return prev; // Don't allow going earlier
    }

    return newDate;
  });
};
  


  // ----single arrow action NextWeek----//
  const handleNextWeek = () =>
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      getStartOfWeek(newDate);
      return newDate;
    });

  // Usage
  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = getEndOfWeek(currentDate);
  const weekDays = getWeekDays(startOfWeek);

  const isWeekValid =
    weekDays.length === 7 &&
    weekDays[0] instanceof Date &&
    weekDays[6] instanceof Date;

  const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
  const monthName = isWeekValid
    ? (monthFormatter.format(weekDays[0]) === monthFormatter.format(weekDays[6])
      ? monthFormatter.format(weekDays[0])
      : `${monthFormatter.format(weekDays[0])} / ${monthFormatter.format(weekDays[6])}`)
    : '';


  //---- Mon to sun  day theader----//
  const formatDay = (date) => {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  };



  const formattedDateRange = useMemo(() => {
    const start = weekDays[0]?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const end = weekDays[6]?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    return `${start} to ${end}`;
  }, [weekDays]);


  // -----Add Task Plus icon row add action----//
  const handleAddRow = (projectKey) => {
    const selectedProject = projectsData.find(p => `project_${p.projectCode}` === projectKey);
    const allocatedTasks = selectedProject?.tasks || [];
    // const currentRows = projectRows[projectKey] || [];
    const currentRows = (projectRows[projectKey] || []).filter(row => row.status_flag !== 'deleted');
    if (currentRows.length  >= allocatedTasks.length) {
      toast.error("Maximum tasks listed",{
        toastId:"handleAdd-max-taask"
      });
      return;
    }
    // Optional: Prevent duplicate tasks
    const availableTasks = allocatedTasks.filter(task =>
      !currentRows.some(row => row.taskCode === task.taskCode)
    );

    if (availableTasks.length === 0) {
      toast.error("No available tasks to add",{
        toastId:"handleAddrow-no-task"
      });
      return;
    }

    // Initialize time entries & remarks
    const newTimeEntries = {};
    const newRemarks = {};
    weekDays.forEach(day => {
      const label = day.toLocaleDateString('en-GB', { weekday: 'long' });
      newTimeEntries[label] = "";
      newRemarks[label] = "";
    });

    // Add new row with NO default task
    setProjectRows(prev => ({
      ...prev,
      [projectKey]: [
        ...(prev[projectKey] || []),
        {
          taskCode: "",            // ✅ Empty task
          taskName: "",
          isChecked: true,
          remarks: { ...newRemarks },
          timeEntries: { ...newTimeEntries },
          timeEntryIDs: {},
          status_flag: "new"
        }
      ]
    }));

    setClickedProjects(prev => ({
      ...prev,
      [projectKey]: true
    }));
  };



  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };


  const fetchProjectsAndTimeEntries = async () => {
     setScreenBlur(true)
    try {
      const loggedInEmployeeId = localStorage.getItem("emp_id");
      let empId = selectedEmpIdRef.current || loggedInEmployeeId;
      
      if (!empId) {
        console.error("No employee ID in localStorage.");
        return;
      }
      //    if(location.state?.status === 'Rejected'){
      //   console.log(location,'location')
      //   setCurrentDate(new Date(location.state?.employeeData?.start_date))
      // }
      let startDate;
      let endDate;
      let pmoEditEnabled = false;
      if (location.state?.status === 'Rejected') {
        startDate = location.state?.employeeData?.start_date;
        endDate = location.state?.employeeData?.end_date;
        empId=location.state?.employeeData?.emp_id;
        setSelectedEmpId({
          value:empId,
          label:location.state?.employeeData?.emp_name
        })
      } else if (localStorage.getItem('Saved_Data')) {
        let values = localStorage.getItem('Saved_Data')
        let { start, end, selectedEmpId } = JSON.parse(values)
        startDate = start;
        endDate = end;
        empId = selectedEmpId?.value;
        setSelectedEmpId({
          value: selectedEmpId?.value,
          label: selectedEmpId?.label
        })
      } else {
        startDate = formatDate(weekDays[0]);
        endDate = formatDate(weekDays[6]);
      }
   


      const formData = new FormData();
      formData.append("fetch_id", empId);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_details`, {
        headers: {
          "Authorization": `${accessToken}`,
        },
        method: "POST",
        body: formData,
      });

      const apiResponse = await response.json();
      if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:"sess-expiry"
        })
      }
      // const notSubmittedRes = await notSubmitted.json()
      const entries = apiResponse?.timeEntries || [];
      entries.forEach((entry, index) => {
        localStorage.setItem(`status_flag_${index}`, entry.status_flag);
      });
      const statusList = ["Saved", "Draft", "Rejected"];
      const notSubmittedResponse = apiResponse?.not_submitted || [];
      const statusString = notSubmittedResponse[0] || "";
      const lockFlag = notSubmittedResponse[1] || false;

      // Determine status from the response
      const statuses = statusString.split(",") || [];
      // console.log(statuses, "statuses,statuses");
      const hasNotSubmitted = statuses.some(status => statusList.includes(status));

      if (hasNotSubmitted) {
        setNotSubmittedCount(1);
        setNotSubmittedLocked(lockFlag);
      } else {
        setNotSubmittedCount(0);
        setNotSubmittedLocked(false);
      }
      const timeEntries = entries || [];
      let finalStatus = "Draft";

      if (timeEntries.length > 0) {
        const flags = timeEntries.map(e => e.status_flag).filter(flag => flag !== null);;
        const uniqueFlags = [...new Set(flags)];
        const hasReverted = flags.includes("reverted");

        setShowPMO(hasReverted);

        if (uniqueFlags.length === 1) {
          const status = uniqueFlags[0];
          if (status === "approved") finalStatus = "Approved";
          else if (status === "submitted") finalStatus = "Submitted";
          else if (status === "saved") finalStatus = "Saved";
          else if (status === "rejected") finalStatus = "Rejected";
          else if (status === "reverted") finalStatus = "Rejected";
          setShowPartiallyApproved(false)
          setIsSubmitted(false)
          setStateDisable(false)
        } else {
          const hasRejected = uniqueFlags.includes("rejected");
          const hasApproved = uniqueFlags.includes("approved");
          const hasSubmitted = uniqueFlags.includes("submitted");
          const hasSaved = uniqueFlags.includes("saved");
          const hasReverted = uniqueFlags.includes("reverted");

          if (hasSubmitted ) {
            setIsSubmitted(true)
            setStateDisable(true)
          }else{
             setIsSubmitted(false)
            setStateDisable(false)
          }

          // REJECTED + SUBMITTED
          if (hasRejected && hasSubmitted && !hasApproved) {
            finalStatus = "Rejected";
          }
          // REJECTED + APPROVED
          else if (hasRejected && hasApproved) {
            setShowPartiallyApproved(true)

            finalStatus = "Partially Approved";
          }
          // SUBMITTED + APPROVED
          else if (hasSubmitted && hasApproved) {
            setShowPartiallyApproved(true)
            finalStatus = "Partially Approved";
          }
          else if (hasSaved && hasApproved) {
            setShowPartiallyApproved(true)
            finalStatus = "Partially Approved";
          }
          // rejected + saved
          else if(hasRejected && hasSaved) {
            finalStatus = "Rejected";
          }else if (hasReverted){
            finalStatus = 'Rejected'
          }
        }
       
      }

      setFinalStatus(finalStatus);

     

     
      localStorage.setItem("final_status", finalStatus);
      setFinalStatus(finalStatus)

      if (apiResponse?.employeeProjects?.length > 0) {
        const projects = apiResponse.employeeProjects[0].projects || [];
        // const projects = projectData.filter((ele) => ele.project_access === true);
        setProjectsData(projects);

        const newProjectRows = {};
        const initialButtonStates = {};
        const selectedProjectIds = [];
        const timeEntriesFromAPI = timeEntries || [];
        
        let submit = false
        let is_week=false
        let reverted = timeEntries.some(e => e.status_flag === 'reverted');
        if (reverted) {
         submit =true
        }
        setSubmitOnly(submit)
        projects.forEach((proj) => {
          const projectKey = `project_${proj.projectCode}`;
          const taskRows = [];

          const savedTasks = proj.tasks.filter(task =>
            timeEntriesFromAPI.some(entry =>
              entry.project_code === proj.projectCode &&
              entry.task_code === task.taskCode
            )
          );




          getActiveWeekdaysBeforeJoin(
            weekDays,
            apiResponse?.employeeProjects[0]?.employeeDOJ,
            proj.projectStartDate ? proj.projectStartDate : "",
            proj.projectCode
          );
          
          savedTasks.forEach((task) => {
            ["true", "false"].forEach((isBillableValue) => {
              const matchingEntries = timeEntriesFromAPI.filter(
                (e) =>
                  e.project_code === proj.projectCode &&
                  e.task_code === task.taskCode &&
                  String(e.is_billable) === isBillableValue
              );
        
              if (matchingEntries.length > 0) {
                const timeEntries = {};
                const timeEntryIDs = {};
                const remarks = {};
                let weekEntryId = '';
                const billingHours={};
                let is_hidden=false;
                
                const hasReverted = matchingEntries.some(e => e.status_flag === 'reverted');
                const allApproved = matchingEntries.every(e => e.status_flag === 'approved');
                const allSubmitted = matchingEntries.every(e => e.status_flag === 'submitted');
                const isPMOEditEnabled = matchingEntries.some(e => e.pmo_edit_enabled === 1);
                if(isPMOEditEnabled){
                  is_week=true
                }
                if (allApproved && !hasReverted && !isPMOEditEnabled) {
                  is_hidden = true;
                }
                if (allSubmitted && !isPMOEditEnabled) {
                  is_hidden = true;
                }
                if (proj?.project_access === false) {
                  is_hidden = true
                }
                if ((finalStatus === "Submitted" || finalStatus === "Approved") && !isPMOEditEnabled) {
                  setStateDisable(true)
                } else {
                  setStateDisable(false)
                }

                

                weekDays.forEach((dayObj) => {
                  const entryDate = dayObj.toLocaleDateString("en-CA");
                  const dayLabel = dayObj.toLocaleDateString("en-GB", { weekday: "long" });

                  
                  const matchingEntry = matchingEntries.find(e => e.entry_date === entryDate);
                  if (matchingEntry?.status_flag === 'approved' || matchingEntry?.status_flag === 'rejected') {
                    setARMessage(matchingEntry?.approver_or_rejected_remarks)
                  }

                 

                  timeEntries[dayLabel] = matchingEntry?.time_spent || "";
                  timeEntryIDs[dayLabel] = matchingEntry?.id || "";
                  remarks[dayLabel] = matchingEntry?.remark || "";
                  billingHours[dayLabel]=matchingEntry?.approver_or_rejected_hours || '';
                  weekEntryId = matchingEntries[0]?.weekentry_id;
                 
                  if (matchingEntries[0]?.pmo_edit_enabled === 1) {
                    pmoEditEnabled = true;
                  }
                });
                taskRows.push({
                  taskCode: task.taskCode,
                  taskName: `${task.taskName}`, // Optional: add "(B)" or "(NB)" here
                  weekentry_id: weekEntryId,
                  remarks,
                  isChecked: isBillableValue === "true",
                  timeEntries,
                  timeEntryIDs,
                  billingHours,
                  is_hidden:is_hidden ? is_hidden : false
                });
              }
            });
          });

          if (taskRows.length > 0) {
            selectedProjectIds.push(proj.projectCode);
            newProjectRows[projectKey] = taskRows;

            const sampleEntry = timeEntriesFromAPI.find(e => e.project_code === proj.projectCode);
            initialButtonStates[projectKey] = sampleEntry?.is_billable ? "B" : "NB";
          }
        });

        const matchPMO = timeEntries.filter((e) => e.project_code === 'PMO001');
        if (matchPMO.length > 0 && matchPMO[0]?.pmo_edit_enabled === 1) {
          is_week = true;
        }

        setEnableWeek(is_week);
        setEnableWeekShow(is_week);
        
        setProjectRows(newProjectRows);
        // setButtonStates(initialButtonStates);
        setSelectedProjects(selectedProjectIds);
      } else {
        setProjectsData([]);
        setProjectRows({});
        // setButtonStates({});
        setSelectedProjects([]);
        setEnableWeekShow(false)
        setEnableWeek(false)
      }

      if (location.state?.status === 'Rejected') {
        navigate(location.pathname, { replace: true, state: null });
      }
      setScreenBlur(false)
      // setTimeEntries(apiResponse.timeEntries || []);
      if(user_role==='Employee'){
         localStorage.removeItem('Saved_Data')
      }
      return apiResponse.timeEntries;
    } catch (error) {
      console.error("Fetch failed:", error);
      setScreenBlur(false)
    } finally {
      // setLoading(false);
    }
  };


  // const fetchProjectsAndTimeEntries = async () => {
  //   try {
  //     const loggedInEmployeeId = localStorage.getItem("emp_id");
  //     // const empId = empId; //|| loggedInEmployeeId;
  //     const empId = selectedEmpIdRef.current || loggedInEmployeeId
  //     if (!empId) {
  //       console.error("No employee ID in localStorage.");
  //       return;
  //     }
  //     setWeekDayList(weekDays);

  //     const startDate = formatDate(weekDays[0]);
  //     const endDate = formatDate(weekDays[6]);

  //     const formData = new FormData();
  //     formData.append("emp_id", empId);
  //     formData.append("start_date", startDate);
  //     formData.append("end_date", endDate);

  //     const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_details`, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const apiResponse = await response.json();

  //     // Save status flag for each entry
  //     apiResponse.timeEntries.forEach((entry, index) => {
  //       localStorage.setItem(`status_flag_${index}`, entry.status_flag);
  //     });

  //     const timeEntries = apiResponse.timeEntries || [];
  //     let finalStatus = "Draft";


  //     if (timeEntries.length > 0) {
  //       const allApproved = timeEntries.every(e => e.status_flag === "approved");
  //       const allSubmitted = timeEntries.every(e => e.status_flag === "submitted");
  //       const allSaved = timeEntries.every(e => e.status_flag === "saved");
  //       const allRejected = timeEntries.every(e => e.status_flag === "rejected");

  //       if (allApproved) {
  //         finalStatus = "Approved";
  //       } else if (allSubmitted) {
  //         finalStatus = "Submitted";
  //       } else if (allSaved) {
  //         finalStatus = "Saved";
  //       } else if (allRejected) {
  //         finalStatus = "Rejected";
  //       }
  //     }
  //     localStorage.setItem("final_status", finalStatus);

  //     // Set employee project/task/timeEntry data
  //     if (apiResponse?.employeeProjects?.length > 0) {
  //       const projects = apiResponse.employeeProjects[0].projects || [];
  //       setProjectsData(projects);
  //       const newProjectRows = {};
  //       const initialButtonStates = {};
  //       const selectedProjectIds = [];
  //       const timeEntriesFromAPI = apiResponse.timeEntries || [];

  //       projects.forEach((proj) => {
  //         const projectKey = `project_${proj.projectCode}`;
  //         const savedTasks = proj.tasks.filter(task =>
  //           timeEntriesFromAPI.some(entry =>
  //             entry.project_code === proj.projectCode &&
  //             entry.task_code === task.taskCode
  //           )
  //         );
  //         getActiveWeekdaysBeforeJoin(weekDays, apiResponse?.employeeProjects[0]?.employeeDOJ, proj.projectStartDate, proj.projectCode)

  //         if (savedTasks.length > 0) {
  //           selectedProjectIds.push(proj.projectCode); // ✅ keep checkbox selected
  //           const taskRows = savedTasks.map((task) => {
  //             const timeEntries = {};
  //             const timeEntryIDs = {};
  //             const remarks = {};

  //             weekDays.forEach((dayObj) => {
  //               const entryDate = dayObj.toLocaleDateString('en-CA');
  //               const dayLabel = dayObj.toLocaleDateString("en-GB", { weekday: "long" });

  //               const matchingEntry = timeEntriesFromAPI.find(
  //                 (e) =>
  //                   e.project_code === proj.projectCode &&
  //                   e.task_code === task.taskCode &&
  //                   e.entry_date === entryDate
  //               );

  //               timeEntries[dayLabel] = matchingEntry?.time_spent || "";
  //               timeEntryIDs[dayLabel] = matchingEntry?.id || "";
  //               remarks[dayLabel] = matchingEntry?.remark || '';
  //               remarks[dayLabel] = matchingEntry?.remark || '';
  //             });

  //             const matchingTaskEntry = timeEntriesFromAPI.find(
  //               (e) =>
  //                 e.project_code === proj.projectCode &&
  //                 e.task_code === task.taskCode
  //             );
  //             // setARMessage(matchingTaskEntry?.approver_remarks)
  //             return {
  //               taskCode: task.taskCode,
  //               taskName: task.taskName,
  //               remarks,
  //               isChecked: matchingTaskEntry?.is_billable ?? false,
  //               timeEntries,
  //               timeEntryIDs,
  //             };
  //           });

  //           newProjectRows[projectKey] = taskRows;

  //           const sampleEntry = timeEntriesFromAPI.find(e => e.project_code === proj.projectCode);
  //           initialButtonStates[projectKey] = sampleEntry?.is_billable ? "B" : "NB";
  //         }
  //       });
  //       // ✅ Final assignment after mapping
  //       setProjectRows(newProjectRows);
  //       setButtonStates(initialButtonStates);
  //       setSelectedProjects(selectedProjectIds);
  //     } else {
  //       setProjectsData([]);
  //       setProjectRows({});
  //       setButtonStates({});
  //       setSelectedProjects([]);
  //     }

  //     setTimeEntries(apiResponse.timeEntries || []);
  //     return apiResponse.timeEntries;
  //   } catch (error) {
  //     console.error("Fetch failed:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // ---Initially loading---//
  useEffect(() => {
    if(revertSelected){
      setrevertSelected([])
    }

    if (typeof onRefetchReady === "function") {
      onRefetchReady(fetchProjectsAndTimeEntries);
    }

    if (weekDays.length === 7 && !isApprovalMode) {
       
      fetchProjectsAndTimeEntries();
    }
    if(weekDays.length === 7){
      setWeekDayList(weekDays);
    }

  }, [currentDate, activeSubTab,reload]);


  useEffect(() => {
    if (showRemarkPopup) {
      // Wait for Dialog to render before focusing
      const timeout = setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeout); // Clean up
    }
  }, [showRemarkPopup]);

  //   useEffect(() => {

  // }, [currentDate]);
  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeDay, finalStatus]);

  //  ----Remarks Commant box----//
  const handleRemarkChange = (projectKey, rowIndex, newRemark) => {
    const updatedRows = { ...projectRows };
    if (updatedRows[projectKey] && updatedRows[projectKey][rowIndex]) {
      updatedRows[projectKey][rowIndex].remark = newRemark;
      setProjectRows(updatedRows);
    }
  };



  // ----All weeks day Input type handlechange----//

  const handleTimeChange = (projectKey, rowIndex, day, value, event = {}) => {


    const key = `${projectKey}_${rowIndex}_${day}`;
    const currentValue = originalValueRef.current[key] || "";


    // Handle Backspace or Delete - clear the field without alert
    if (event.key === 'Backspace' || event.key === 'Delete') {

      setProjectRows(prev => {

        const updated = [...prev[projectKey]];
        const task = { ...updated[rowIndex] };
        task.deletedDay = task.deletedDay || {};
        task.timeEntries = { ...task.timeEntries, [day]: "" };
        task.deletedDay[day] = true;
        updated[rowIndex] = task;
        return { ...prev, [projectKey]: updated };
      });

      return;
    }

    const isBlurOrTab = event.key === 'Tab' || event.type === 'blur';

    // Step 2: Format if not delete
    let rawValue = value.replace(/\D/g, '');


    if (isBlurOrTab) {
      if (rawValue.length === 1) rawValue = `0${rawValue}00`;
      else if (rawValue.length === 2) rawValue = `${rawValue}00`;

      if (rawValue.length >= 3) {
        const hours = rawValue.slice(0, 2);
        const minutes = rawValue.slice(2, 4) || "00";

        if (+hours > 24 || (+hours === 24 && +minutes > 0)) {
          console.warn("Invalid time input (exceeds 24 hours):", hours, minutes);
          return;
        }

        value = `${hours}:${minutes.padEnd(2, "0")}`;
      } else {

        return;
      }
    } else {
      if (rawValue.length > 4) {

        return;
      }

      if (rawValue.length >= 5) {
        const hours = rawValue.slice(0, 4);
        const minutes = rawValue.slice(2);
        if (+hours > 24 || (+hours === 24 && +minutes > 0)) {

          return;
        }
        value = `${hours}:${minutes}`;
      } else if (rawValue.length >= 2) {
        value = `${rawValue.slice(0, 2)}:${rawValue.slice(2)}`;
      }
    }


    // Step 3: Approval Mode validation

    if (
      isApprovalMode &&
      currentValue &&
      /^\d{2}:\d{2}$/.test(value) &&
      rawValue.length === 4
    ) {
      const formatTime = (str) => {
        if (!str) return "00:00";
        const [h, m = "00"] = str.split(":");
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
      };

      const formattedCurrent = formatTime(currentValue);
      const formattedNew = formatTime(value);

      const key = `${projectKey}_${rowIndex}_${day}`;


      if (lastAlertedKeyRef.current === key + "_" + formattedNew) {
        console.log("Alert already shown once for this change, skipping");
        return;
      }

      const [currH, currM] = formattedCurrent.split(":").map(Number);
      const [newH, newM] = formattedNew.split(":").map(Number);
      const currTotal = currH * 60 + currM;
      const newTotal = newH * 60 + newM;

      if (newTotal > currTotal) {
        console.log("Alert triggered: New time is greater than actual");
        const proceed = window.confirm(
          "Update is for accounting only. Paid hours remain unchanged."
        );
        if (!proceed) {



          setProjectRows(prev => {
            const updated = [...prev[projectKey]];
            const task = { ...updated[rowIndex] };
            task.timeEntries = { ...task.timeEntries, [day]: formattedCurrent };
            updated[rowIndex] = task;
            return { ...prev, [projectKey]: updated };
          });

          return;
        }

      } else if (newTotal < currTotal) {
        console.log("Alert triggered: New time is less than actual");
        const proceed = window.confirm(
          "Billable hours less than actual. Paid hours will be impacted."
        );
        if (!proceed) {

          setProjectRows(prev => {
            const updated = [...prev[projectKey]];
            const task = { ...updated[rowIndex] };
            task.timeEntries = { ...task.timeEntries, [day]: formattedCurrent };
            updated[rowIndex] = task;
            return { ...prev, [projectKey]: updated };
          });

          return;
        }

      }
      lastAlertedKeyRef.current = key + "_" + formattedNew;
    }

    // Step 4: Daily limit check
    const [newHours, newMinutes] = value.split(':').map(Number);
    const newTotalMinutes = (newHours * 60) + newMinutes;

    const existingTotalMinutes = projectRows[projectKey]
      .reduce((total, row, idx) => {
        if (idx === rowIndex) return total;
        const timeStr = row.timeEntries[day];
        if (!timeStr) return total;
        const [h, m] = timeStr.split(':').map(Number);
        return total + (h * 60 + m);
      }, 0);

    const combinedTotal = existingTotalMinutes + newTotalMinutes;



       if (value.length === 5) {
      if (combinedTotal > 1440) {
        toast.warning("Total hours for the day cannot exceed 24.",{
          toastId:"total-hrs-cannot-exceed-24"
        });
        // value = ""
      }
    }

    // Step 5: Update the state
    setProjectRows(prev => {
      const updated = [...prev[projectKey]];
      const task = { ...updated[rowIndex] };

      task.timeEntries = { ...task.timeEntries, [day]: value };
      task.deletedDay = task.deletedDay || {};

      const hasTimeEntryID = task.timeEntryIDs?.[day];
      const isTimeEntryEmpty = !value || /^0+:?0*$/.test(value.trim());

      if (hasTimeEntryID && isTimeEntryEmpty) {
        task.deletedDay[day] = true;
      } else {
        delete task.deletedDay[day];
      }

      updated[rowIndex] = task;

      return { ...prev, [projectKey]: updated };
    });

    validateTimesheet();
  };





  const recalculateTotalWeekMinutes = (rows) => {
    let total = 0;

    const getMinutes = (timeStr) => {
      if (!timeStr || timeStr === "") return 0;
      const [hrs, mins] = timeStr.split(":").map(Number);
      return (hrs || 0) * 60 + (mins || 0);
    };

    weekDayList.forEach((day) => {
      const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
      const dayOfWeek = day.getDay();

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        Object.values(rows).forEach((taskList) => {
          taskList.forEach((task) => {
            const time = task.timeEntries?.[dayLabel];
            total += getMinutes(time);
          });
        });
      }
    });

    setTotalWeekMinutes(total); // this updates your UI
  };


  // // ---Remove row Task Remove minus action---//
  // const handleRemoveRow = (projectKey, index) => {
  //   setProjectRows((prev) => {
  //     const updatedProjectRows = { ...prev };
  //     const rows = updatedProjectRows[projectKey];

  //     if (rows.length <= 1) return prev;

  //     updatedProjectRows[projectKey] = rows.filter((_, i) => i !== index);
  //     return updatedProjectRows;
  //   });

  //   setShowRemarkPopup(false);
  // };

  const handleRemoveRow = (projectKey, index) => {
    setProjectRows((prev) => {
      const updatedProjectRows = { ...prev };
      const rows = updatedProjectRows[projectKey];

      if (!rows || rows.length === 0) return prev;

      updatedProjectRows[projectKey] = rows.map((row, i) => {
        if (i !== index) return row;

        const updatedRow = { ...row, status_flag: 'deleted' };


        if (row.timeEntries) {
          updatedRow.timeEntries = {
            monday: '00:00',
            tuesday: '00:00',
            wednesday: '00:00',
            thursday: '00:00',
            friday: '00:00',
            saturday: '00:00',
            sunday: '00:00'
          };
        }

        return updatedRow;
      });

      return updatedProjectRows;
    });

    setShowRemarkPopup(false);
  };


  // const handleRemoveRow = async (projectKey, index) => {
  //   const taskToDelete = projectRows[projectKey][index];
  //   const projectCode = projectKey.replace("project_", "");
  //   const project = projectsData.find(p => p.projectCode === projectCode);
  //   const employeeId = selectedEmpId?.value || localStorage.getItem("emp_id");

  //   if (!taskToDelete || !employeeId || !project) return;

  //   const formatDate = (date) => {
  //     const yyyy = date.getFullYear();
  //     const mm = String(date.getMonth() + 1).padStart(2, "0");
  //     const dd = String(date.getDate()).padStart(2, "0");
  //     return `${yyyy}-${mm}-${dd}`;
  //   };

  //   const formatInsertedTime = () => {
  //     const now = new Date();
  //     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ` +
  //       `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.` +
  //       `${String(now.getMilliseconds()).padStart(3, "0")}000`;
  //   };

  //   const startDate = formatDate(weekDayList[0]);
  //   const endDate = formatDate(weekDayList[6]);
  //   const timeEntries = [];

  //   for (const day of weekDayList) {
  //     const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });

  //     const timeEntry = {
  //       timeentry_id: taskToDelete.timeEntryIDs?.[dayLabel] || null,
  //       weekentry_id: taskToDelete.weekentry_id || null,
  //       employee_id: employeeId,
  //       week_start_date: startDate,
  //       week_end_date: endDate,
  //       project_code: projectCode,
  //       project_name: project.projectName,
  //       task_code: taskToDelete.taskCode,
  //       task_name: project.tasks.find(t => t.taskCode === taskToDelete.taskCode)?.taskName,
  //       is_billable: project.is_chargeable === "false" ? false : (taskToDelete.isChecked && project.is_chargeable === "true" ? true : false),
  //       remark: taskToDelete.remarks?.[dayLabel] || "",
  //       time_spent: "00:00",
  //       entry_date: formatDate(day),
  //       status_flag: "deleted",
  //       inserted_time: formatInsertedTime(),
  //       saved_by: employeeId,
  //     };

  //     timeEntries.push(timeEntry);
  //   }


  //   try {
  //     const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/time_entries`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: accessToken,
  //       },
  //       body: JSON.stringify({ timeEntries }),
  //     });

  //     const result = await res.json();

  //     if (!res.ok) {
  //       toast.error(result.message || "Failed to delete task");
  //     } else {
  //       toast.success("Task deleted successfully");
  //     }
  //   } catch (error) {
  //     toast.error("API error while deleting");
  //     console.error(error);
  //   }


  //   setProjectRows((prev) => {
  //     const updated = { ...prev };
  //     if (!updated[projectKey]) return prev;

  //     updated[projectKey] = updated[projectKey].filter((_, i) => i !== index);
  //     return updated;
  //   });

  //   setShowRemarkPopup(false);
  // };


  // -----Task change Dropdown user change action---//
  const handleTaskChange = (projectKey, index, taskCode) => {
    setProjectRows((prevRows) => {
      const updatedRows = [...prevRows[projectKey]];
      updatedRows[index].taskCode = taskCode;
      return {
        ...prevRows,
        [projectKey]: updatedRows,
      };
    });
  };



  // ----Add Additional projects----//
  const handleProjectCheckboxChange = (projectId) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId]
    );
  };


  //  -----Weeks Days click and type Inputs fields date formate set----//
  const handleInputClick = (projectKey, dayLabel, row) => {
    setActiveInputs(prev => ({
      ...prev,
      [`${projectKey}-${dayLabel}`]: !prev[`${projectKey}-${dayLabel}`],
    }));
  };



  // -----Add project pop up Add icon action----//
  // const handleAddProjects = () => {
  //   if (dialogSelectedProjects.length === 0) {
  //     toast.warning("Please select at least one project.");
  //     return;
  //   }

  //   // logic to add selected projects
  //   dialogSelectedProjects.forEach((code) => {
  //     const newKey = typeof code === "string" && !code.startsWith("project_")
  //       ? `project_${code}`
  //       : code;

  //     if (!projectRows[newKey]) {
  //       setProjectRows((prev) => ({
  //         ...prev,
  //         [newKey]: [
  //           {
  //             taskCode: "",
  //             remark: "",
  //             timeEntries: {},
  //           },
  //         ],
  //       }));
  //     }
  //   });

  //   // Clear dialog selections and close
  //   setDialogSelectedProjects([]);
  //   handleClose();
  // };
  // const handleAddProjects = () => {
  //   if (dialogSelectedProjects.length === 0) {
  //     toast.warning("Please select at least one project.");
  //     return;
  //   }

  //   dialogSelectedProjects.forEach((code) => {
  //     const newKey = typeof code === "string" && !code.startsWith("project_")
  //       ? `project_${code}`
  //       : code;

  //     if (!projectRows[newKey]) {
  //       // Initialize time entries and remarks
  //       const newTimeEntries = {};
  //       const newRemarks = {};
  //       weekDays.forEach(day => {
  //         const label = day.toLocaleDateString('en-GB', { weekday: 'long' });
  //         newTimeEntries[label] = "";
  //         newRemarks[label] = "";
  //       });

  //       // Add initial row
  //       setProjectRows(prev => ({
  //         ...prev,
  //         [newKey]: [
  //           {
  //             taskCode: "",
  //             taskName: "",
  //             remark: "",
  //             isChecked: true, // Default toggle to 'B'
  //             timeEntries: newTimeEntries,
  //             remarks: newRemarks,
  //             timeEntryIDs: {},
  //             status_flag: "new"
  //           },
  //         ],
  //       }));
  //     }
  //   });

  //   // Reset selection and close dialog
  //   setDialogSelectedProjects([]);
  //   handleClose();
  // };





  const handleAddProjects = () => {
    if (dialogSelectedProjects.length === 0) {
      toast.warning("Please select at least one project.",{
        toastId:"select-one-project"
      });
      return;
    }

    dialogSelectedProjects.forEach((code) => {
      const newKey = `project_${code}`;
      const existingProject = projectRows[newKey];

      if (existingProject && existingProject.every(task => task.status_flag === 'deleted')) {
        // If project exists but all tasks are deleted, create fresh rows
        setProjectRows(prev => ({
          ...prev,
          [newKey]: [{
            taskCode: "",
            taskName: "",
            isChecked: true,
            remarks: Object.fromEntries(weekDays.map(day => [
              day.toLocaleDateString('en-GB', { weekday: 'long' }),
              ""
            ])),
            timeEntries: Object.fromEntries(weekDays.map(day => [
              day.toLocaleDateString('en-GB', { weekday: 'long' }),
              ""
            ])),
            timeEntryIDs: {},
            status_flag: "new"
          }]
        }));
      } else if (!existingProject) {
        // New project
        setProjectRows(prev => ({
          ...prev,
          [newKey]: [{
            taskCode: "",
            taskName: "",
            isChecked: true,
            remarks: Object.fromEntries(weekDays.map(day => [
              day.toLocaleDateString('en-GB', { weekday: 'long' }),
              ""
            ])),
            timeEntries: Object.fromEntries(weekDays.map(day => [
              day.toLocaleDateString('en-GB', { weekday: 'long' }),
              ""
            ])),
            timeEntryIDs: {},
            status_flag: "new"
          }]
        }));
      }
    });

    setDialogSelectedProjects([]);
    handleClose();
  };
  // ----Add Project pop up open----//
  const handleClickOpen = () => {
    setOpen(true);
  };


  // ----Add Project pop up Close----//
  const handleClose = () => {
    setOpen(false);
  };


  //  ----Project Delect pop up open---//
  const confirmDeleteProject = (projectKey) => {
    // if (finalStatus !== 'Draft' && finalStatus !== 'Saved' && finalStatus !== "Rejected") {
    //   toast.warning(`Can't delete project ${finalStatus}`);
    //   return;
    // }
    setProjectToDelete(projectKey);
    setDeleteConfirmOpen(true);
  };

  // ----Delect project pop up icon function----//

  const handleDeleteConfirmed = async () => {
    if (!projectToDelete) return;

    if (!permissions.includes('delete_entry')) {
      toast.error("Access denied",{
        toastId:"handleDelete-access-denied"
      });
      return;
    }

    const updatedProjects = { ...projectRows };

    if (updatedProjects[projectToDelete]) {
      updatedProjects[projectToDelete] = updatedProjects[projectToDelete].map(task => {
        // Set timeEntries with values to "00:00"
        const updatedTimeEntries = { ...task.timeEntries };
        for (const day in updatedTimeEntries) {
          if (updatedTimeEntries[day]) {
            updatedTimeEntries[day] = "00:00";
          }
        }

        return {
          ...task,
          timeEntries: updatedTimeEntries,
          status_flag: 'deleted',
        };
      });
    }


    setProjectRows(updatedProjects);

    // 👇 Call your recalculation logic
    // recalculateTotalWeekMinutes(updatedProjects);

    const projectId = projectToDelete.replace("project_", "");
    setSelectedProjects((prev) => prev.filter((id) => id !== projectId)); // uncheck project

    setProjectToDelete(null);
    setDeleteConfirmOpen(false);
  };


  // const 
  // leteConfirmed = async () => {
  //   if (!projectToDelete) return;

  //   const updatedProjects = { ...projectRows };

  //   // Mark tasks with status_flag: 'deleted'
  //   if (updatedProjects[projectToDelete]) {
  //     updatedProjects[projectToDelete] = updatedProjects[projectToDelete].map(task => ({
  //       ...task,
  //       status_flag: 'deleted',
  //     }));
  //   }

  //   setProjectRows(updatedProjects);
  //   setProjectToDelete(null);
  //   setDeleteConfirmOpen(false);

  //   // Send deleted entries to backend
  //   await sendDeletedTimeEntries(projectToDelete, updatedProjects[projectToDelete]);
  // };

  // const handleDeleteConfirmed = () => {
  //   if (!projectToDelete) return;

  //   const updatedProjects = { ...projectRows };
  //   delete updatedProjects[projectToDelete]; // Remove from projectRows
  //   setProjectRows(updatedProjects);

  //   // Remove from selectedProjects if still present
  //   const projectId = projectToDelete.replace("project_", "");
  //   setSelectedProjects((prev) => prev.filter((id) => id !== projectId)); // ✅ uncheck

  //   setProjectToDelete(null);
  //   setDeleteConfirmOpen(false);
  // };

  // ----Task and Remark Validation-----//
  const isTaskAndRemarkValid = (row) => {
    if (!row.taskCode || !row.remark.trim()) {
      toast.error("Please select task and type remark",{
        toastId:"isTaskAndRemarksValid-select-task-type"
      });
      return false;
    }
    return true;
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return { hours: 0, minutes: 0 };
    return { hours, minutes };
  };

  const formatTotalTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };


  const calculateTotalTimePerDay = (dayLabel) => {
    let totalMinutes = 0;
    let timeStrings = [];

    Object.values(projectRows).forEach((tasks) => {
      tasks.forEach((task) => {
        const time = task.timeEntries?.[dayLabel];
        if (time && time !== "0:00" && time !== "") {
          timeStrings.push(time); // collect actual time entries
          const [hours, minutes] = time.split(":").map(Number);
          totalMinutes += (hours || 0) * 60 + (minutes || 0);
        }
      });
    });

    if (timeStrings.length === 1) {
      return timeStrings[0]; // e.g., "12:30"
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (totalHours > 24) {
      return "Exceeded";
    }

    return `${String(totalHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  };


  // const handleOpenRemarkPopup = (projectKey, rowIndex, remark,projectRows) => {
  //   setSelectedProjectKey(projectKey);
  //   setSelectedRowIndex(rowIndex);
  //   setSelectedRemark(remark);
  //   setShowRemarkPopup(true);
  // };
  // const handleOpenRemarkPopup = (projectKey, rowIndex, remark, projectRows, task) => {
  //   const projectCode = projectKey.replace("project_", "");
  //   const project = projectsData.find(
  //     p => p.projectCode === projectCode && p.status_flag !== "deleted"
  //   );
  //   const title = project ? project.projectName : projectKey;
  //   setPopupProjectTitle(title);
  //   console.log(task, "projectRows")
  //   const taskName = task || "Task not selected";



  //   setPopupTaskName(taskName);
  //   setSelectedProjectKey(projectKey);
  //   setSelectedRowIndex(rowIndex);
  //   setSelectedRemark(remark);
  //   setShowRemarkPopup(true);
  // };



  const handleOpenRemarkPopup = (projectKey, rowIndex, remark, projectRows, rows) => {
    setActiveDay('mon')
    const projectCode = projectKey.replace("project_", "");
    const project = projectsData.find(
      p => p.projectCode === projectCode && p.status_flag !== "deleted"
    );
    const title = project ? project.projectName : rows.projectName;
    setPopupProjectTitle(title);
    const rowData = projectRows?.[projectKey]?.[rowIndex];


    const taskCode = rowData?.taskCode || rowData?.task || "";
    const taskObj = project?.tasks?.find(t => t.taskCode === taskCode);
    const taskName = taskObj?.taskName || rows.taskName;


    setPopupTaskName(taskName);
    setSelectedProjectKey(projectKey);
    setSelectedRowIndex(rowIndex);
    // setSelectedRemark(remark);
    setShowRemarkPopup(true);
  };


  // const handleSaveRemark = () => {
  //   setSelectedProjectKey(null);
  //   setSelectedRowIndex(null);
  //   setShowRemarkPopup(false);
  // };
  const handleSaveRemark = () => {

    let timeEntry = projectRows?.[selectedProjectKey]?.[selectedRowIndex]?.timeEntries
    let remarks = projectRows?.[selectedProjectKey]?.[selectedRowIndex]?.remarks
    const matchingDays = Object.keys(timeEntry).filter(day => {
      const entry = timeEntry[day];
      const newRemarks = remarks[day] || "";
      
      return entry !== "" && entry !== "00:00" &&  newRemarks.trim().length < 10;
    });
    if (matchingDays.length !== 0) {
      const firstDay = matchingDays[0]; // e.g., "Monday"
      const shortDay = firstDay.slice(0, 3).toLowerCase(); // "mon"
      setActiveDay(shortDay);
      setRemarkWarning(true)
    } else {
      setRemarkWarning(false)
      setSelectedProjectKey(null);
      setSelectedRowIndex(null);
      setShowRemarkPopup(false);
    }
  };


  const formatDateShort = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });



  const getFullDayName = (shortDay) => {
    const daysMap = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday'
    };
    // Convert input to lowercase to handle case variations like 'Mon' or 'MON'
    return daysMap[shortDay.toLowerCase()] || 'Invalid day';
  }

  const getWeekDates = (date) => {
    const start = getStartOfWeek(date); // you already have this
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const parseDate = (dateStr) => {
    const parts = dateStr.split('-');
    let year, month, day;

    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }

    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const getActiveWeekdaysBeforeJoin = (weekTime, joiningDateStr, projectDateStr, projectCode) => {
    const joiningDate = parseDate(joiningDateStr);
    const projectDate = parseDate(projectDateStr);

    // Normalize to midnight
    const normalize = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const normalizedJoining = normalize(joiningDate);
    const normalizedProject = normalize(projectDate);

    const normalizedWeekTime = weekTime.map(dateStr => normalize(new Date(dateStr)));

    const isInWeek = (date) =>
      normalizedWeekTime.some(weekDay => weekDay.getTime() === date.getTime());

    let cutoffDate = null;

    if (isInWeek(normalizedJoining) && isInWeek(normalizedProject)) {
      cutoffDate = normalizedJoining < normalizedProject ? normalizedJoining : normalizedProject;
    } else if (isInWeek(normalizedJoining)) {
      cutoffDate = normalizedJoining;
    } else if (isInWeek(normalizedProject)) {
      cutoffDate = normalizedProject;
    }

    if (!cutoffDate) {
      setIsDisabled(prev => ({
        ...prev,
        [`project_${projectCode}`]: []
      }));
      return;
    }

    const weekdays = normalizedWeekTime
      .filter(day => day.getTime() < cutoffDate.getTime()) // ✅ strictly before
      .map(day => day.toLocaleDateString('en-US', { weekday: 'long' }));

    setIsDisabled(prev => ({
      ...prev,
      [`project_${projectCode}`]: weekdays
    }));
  };


  // const handleBulkDelete = () => {
  //   const updated = { ...projectRows };
  //   selectedProjects.forEach((projectKey) => {
  //     delete updated[projectKey];
  //   });
  //   setProjectRows(updated);
  //   setSelectedProjects([]);
  // };

  const handleBulkDelete = () => {
    const updated = { ...projectRows };

    bulkProjectKey.forEach((projectKey) => {
      if (updated[projectKey]) {
        updated[projectKey] = updated[projectKey].map((task) => ({
          ...task,
          status_flag: 'deleted',
          isChecked: false,
        }));
      }
    });

    setProjectRows(updated);
    setBulkProjectKey([]);
    setSelectedProjects([]);

  }


  const handleDialogProjectCheckboxChange = (code) => {
    setDialogSelectedProjects((prev) =>
      prev.includes(code) ? prev.filter(p => p !== code) : [...prev, code]
    );
  };

  const handleRevertCheck = (data, dayLabel, row, number) => {
    const value = data[dayLabel];
    const Date = formatDateShortRevert(row[number - 1])

    setRevertDate(prevSelected => {
      const current = Array.isArray(prevSelected) ? prevSelected : [];
      if (current.includes(Date)) {
        return current.filter(date => date !== Date);
      } else {
        return [...current, Date];
      }
    });

    setrevertSelected(prevSelected => {
      const current = Array.isArray(prevSelected) ? prevSelected : [];
      if (current.includes(value)) {
        return current.filter(id => id !== value);
      } else {
        return [...current, value];
      }
    });

  };

  const formatDateShortRevert = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };




  const renderRows = (projectKey, project_title) => {
    if (!projectRows[projectKey]) return null;
    const grayOutDaysSet = new Set();
    //7/24/2025 ----> siva
    //get all the leave project code for gray out in the table ..
    Object.entries(projectRows || {}).forEach(([key, rows]) => {
      const leaveProject = projectsData.find(
        (p) => p.projectCode === key.replace("project_", "") && p.projectName === "Leave"
      );

      if (leaveProject) {
        rows.forEach((row) => {
          Object.entries(row.timeEntries || {}).forEach(([day, value]) => {
            if (value && value.trim() !== "" && value !== "00:00") {
              grayOutDaysSet.add(day);
            }
          });
        });
      }
    });
    return (
      <>
        {projectRows[projectKey].map((row, index) => {
       
          if (row.status_flag === 'deleted') return null;
          const isFirstRow = (() => {
            for (let i = 0; i < projectRows[projectKey].length; i++) {
              if (projectRows[projectKey][i].status_flag !== 'deleted') {
                return i === index;
              }
            }
            return false;
          })();
          const lastVisibleIndex = (() => {
            const rows = projectRows[projectKey];
            for (let i = rows.length - 1; i >= 0; i--) {
              if (rows[i].status_flag !== 'deleted') {
                return i;
              }
            }
            return -1;
          })();
          const isLastRow = index === lastVisibleIndex;
          const visibleCount = projectRows[projectKey].filter(row => row.status_flag !== 'deleted').length;
          const taskKey = `${projectKey}_${row.taskCode}`;
          return (
            <tr key={`${projectKey}-${row.taskCode}-${index}`}>
              {/* PROJECT TITLE CELL */}
              {isFirstRow && (
                <td rowSpan={visibleCount} className="project-title-cell pd-padding">
                  <div className="project-title d-flex">
                    {/* Conditionally render checkbox */}
                    {!viewmode && (
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(projectKey)}
                        disabled={stateDisable || isApprovalMode || row.is_hidden}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setBulkProjectKey((pre) =>
                            isChecked
                              ? [...pre, projectKey]
                              : pre.filter(key => key !== projectKey))
                          setSelectedProjects((prev) =>
                            isChecked
                              ? [...prev, projectKey]
                              : prev.filter(key => key !== projectKey)
                          );
                        }}
                      />
                    )}
                    <div className="title-wrapper">
                      <div className="project_tite">{project_title}</div>
                    </div>
                    {/* Conditionally render delete icon */}
                    {!viewmode && (
                      <Tooltip title="Delete" placement="top" arrow>
                      <DeleteIcon
                        className={`delete-icon ${(stateDisable || isApprovalMode ||  row.is_hidden) ? "disabled" : ""}`}
                        onClick={() => !stateDisable && !isApprovalMode && !row?.is_hidden && confirmDeleteProject(projectKey)}
                      />
                      </Tooltip>
                    )}
                  </div>
                </td>
              )}

              {/* TASK CELL */}
              <td className="pd-padding">
                <div className="d-flex-icon">
                  <button
                    className={`toggle-btn ${row.isChecked ? '' : 'toggle-btn-NB'} ${stateDisable || viewmode  || (isApprovalMode && !row?.is_allowed_approval)||  row.is_hidden ?'disabled':''}`}
                    onClick={() => handleButtonToggle(projectKey, index)} // ✅ FIXED
                    disabled={stateDisable || viewmode  || (isApprovalMode && !row?.is_allowed_approval)||  row.is_hidden}
                  >
                    {row.isChecked ? 'B' : 'NB'}
                  </button>

                  <select
                    className="drop-down no-arrow"
                    value={row.taskCode || ""}
                    onChange={(e) => {
                      if (stateDisable || viewmode ||  row.is_hidden) {
                        e.preventDefault();
                        toast.error("Task selection is locked.",{
                          toastId:"task-selection-is-locked"
                        });
                        return;
                      }
                      handleTaskChange(projectKey, index, e.target.value);
                    }}
                    style={{
                      backgroundColor: (stateDisable || viewmode || isApprovalMode ||  row.is_hidden) ? "#f0f0f0" : "white",
                      cursor: (stateDisable || viewmode || isApprovalMode ||  row.is_hidden) ? "not-allowed" : "pointer",
                      pointerEvents: (stateDisable || viewmode || isApprovalMode ||  row.is_hidden) ? "none" : "auto",
                      opacity: (stateDisable || viewmode || isApprovalMode ||  row.is_hidden) ? 0.6 : 1,
                      fontFamily: 'Mulish'
                    }}
                  >
                    <option value="">Select Task</option>
                    {(
                      projectsData.find(p => `project_${p.projectCode}` === projectKey)?.tasks || []
                    ).length > 0 ? (
                      projectsData
                        .find(p => `project_${p.projectCode}` === projectKey)
                        .tasks.map(task => (
                          <option key={task.taskCode} value={task.taskCode}>
                            {task.taskName}
                          </option>
                        ))
                    ) : (
                      row.taskCode && (
                        <option value={row.taskCode} key={row.taskCode}>
                          {row.taskName}
                        </option>
                      )
                    )}
                  </select>

                  {/* Remove icon */}
                  {!viewmode && visibleCount > 1 && (
                    <Tooltip title="Remove row" placement="top" arrow>
                    <span
                      className="remove"
                      onClick={() => {
                        if (!stateDisable && !isApprovalMode && !row.is_hidden) {
                          handleRemoveRow(projectKey, index)
                        }
                      }
                      }
                    >
                      <RemoveIcon className={`add-icon ${stateDisable || isApprovalMode || row.is_hidden ? "disabled" : ""}`} />
                    </span>
                    </Tooltip>
                  )}
                  
                  {/* Add icon */}
                  {!viewmode && isLastRow && (
                    <Tooltip title="Add Task" placement="top" arrow>
                    <span
                      className={`add ${clickedProjects[projectKey] ? "mr-5" : ""} ${stateDisable || isApprovalMode || row.is_hidden ? "disabled" : ""}`}
                      onClick={() => {
                        if (!stateDisable && !isApprovalMode && !row.is_hidden) {
                          handleAddRow(projectKey);
                        }
                      }}
                    >
                      <AddIcon className={`add-icon ${stateDisable || isApprovalMode || row.is_hidden ? "disabled" : ""}`} />
                    </span>
                    </Tooltip>
                  )}
                </div>
              </td>


              {/* REMARKS CELL */}
              <td className="pd-padding">
                <div className="long-textarea">
                  <textarea
                    className="text-area"
                    placeholder={
                      label.some(day => row.remarks?.[day]?.trim()) ? 'Read Remarks' : 'Insert Remarks'
                    }
                    readOnly
                    onClick={() => handleOpenRemarkPopup(projectKey, index, row.remarks || "", projectRows, row)}
                  />
                </div>
              </td>

              {/* TIME ENTRIES CELL (per weekday) */}
              {weekDays.map((dayObj, dayIdx) => {
                const dayLabel = dayObj.toLocaleDateString("en-GB", { weekday: "long" });
                const dayNumber = dayObj.getDay();
                const isWeekend = dayNumber === 0 || dayNumber === 6;
                const inputClass = isWeekend
                  ? "time-input time orange-border"
                  : "time-input time";

                return (

                  <td
                    key={`${projectKey}-${index}-${dayLabel}`}
                    className="pd-padding"
                    //gray out all the leave project to show the user that this day is on leave . but we can topup the leave into billable . 
                    //7/24/2025 ----> siva
                    style={{
                      backgroundColor: grayOutDaysSet.has(dayLabel)
                        ? "#e0d1d1ff"
                        : isWeekend
                          ? "#F5F5F5"
                          : "transparent"
                    }}
                  >
                    <Tooltip title={ finalStatus === 'Approved' ? row?.billingHours?.[dayLabel] : ""} placement="top" arrow>
                    <div >
                      {
                        user_role === "Time Keeper" && finalStatus === "Approved" && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end',   ...(dayLabel === "Monday" ? {position:"relative",top:"6px" } : {}) }}>

                            <input type="checkbox"
                              checked={revertSelected?.includes(row?.timeEntryIDs[dayLabel])}
                              onChange={() => handleRevertCheck(row.timeEntryIDs, dayLabel, weekDayList, dayNumber)}
                            />
                          </div>
                        )
                      }
                      <input
                        type="text"
                        maxLength={5}
                        className={`
    ${inputClass}
    ${activeInputs[`${projectKey}-${dayLabel}`] ? "active" : ""}
        ${dayLabel === "Monday" ? "monday-lift" : ""}

    ${(stateDisable || (isApprovalMode && !row?.is_allowed_approval) || row?.is_hidden) ? "disabled" : ""}
  `}
                        value={row.timeEntries?.[dayLabel] || ""}
                        onClick={() => {
                          if (!stateDisable &&
                            (isApprovalMode && row?.is_allowed_approval)) {
                            handleInputClick(projectKey, dayLabel, row);
                          }
                        }}
                        onChange={(e) => {
                          if (
                            !stateDisable &&
                            (!isApprovalMode || (isApprovalMode && row?.is_allowed_approval)) &&
                            !row?.is_hidden) {
                            const cleaned = e.target.value.replace(/[^\d]/g, ''); // only numbers
                            handleTimeChange(projectKey, index, dayLabel, cleaned);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            !stateDisable &&
                            (!isApprovalMode || (isApprovalMode && row?.is_allowed_approval)) &&
                            !row?.is_hidden) {
                            if (e.key === "Backspace" || e.key === "Delete") {
                              // Pass the correct key so deletion logic triggers
                              handleTimeChange(projectKey, index, dayLabel, "", e);
                            } else if (e.key === "Tab" || e.key === "Enter") {
                              // Manually trigger format + alert logic
                              const cleaned = e.target.value.replace(/[^\d]/g, '');
                              handleTimeChange(projectKey, index, dayLabel, cleaned, e);
                            }
                          } else {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e) => {
                          if (
                            !stateDisable &&
                            (!isApprovalMode || (isApprovalMode && row?.is_allowed_approval)) &&
                            !row?.is_hidden) {
                            const cleaned = e.target.value.replace(/[^\d]/g, '');
                            handleTimeChange(projectKey, index, dayLabel, cleaned, e);
                          }
                        }}
                        onFocus={(e) => {
                          const key = `${projectKey}_${index}_${dayLabel}`;
                          originalValueRef.current[key] = e.target.value;
                        }}
                      />




                      {dayIdx === 0 && !viewmode && (
                       
                        <div
                          className={`Copy-icon ${stateDisable  || row.is_hidden ? 'disabled' : ''}`}
                          onClick={() => {
                            if (
                            !stateDisable &&
                            (!isApprovalMode || (isApprovalMode && row?.is_allowed_approval)) &&
                            !row?.is_hidden) {
                              let value = row.timeEntries?.[dayLabel] || "";
                              if (/^\d$/.test(value)) value = `0${value}:00`;
                              if (/^\d{2}$/.test(value)) value = `${value}:00`;

                              weekDays.forEach((dayObj) => {
                                const dayNum = dayObj.getDay();
                                if (dayNum >= 1 && dayNum <= 5) {
                                  const targetDay = dayObj.toLocaleDateString("en-GB", { weekday: "long" });
                                  handleTimeChange(projectKey, index, targetDay, value, { type: 'blur' });
                                }
                              });
                            }
                          }}
                        >
                            <Tooltip title="Copy Monday time to weekdays" placement="top" arrow>
                              <ContentCopyIcon sx={{ fontSize: 10, color: "#033EFF" }} />
                            </Tooltip>
                        </div>
                        
                      )}
                    </div>
                    </Tooltip>
                  </td>

                  //                 <td
                  //                   key={dayIdx}
                  //                   className="pd-padding"
                  //                   style={{ backgroundColor: isWeekend ? "#F5F5F5" : "transparent" }}
                  //                 >
                  //                   <div className="scroll-container">
                  //                     <input
                  //                       type="text"
                  //                       maxLength={5}
                  //                       className={`
                  //                         ${inputClass}
                  //                         ${activeInputs[`${projectKey}-${dayLabel}`] ? "active" : ""}
                  //                         ${stateDisable  ? "disabled" : ""}
                  //                       `}
                  //                       value={row.timeEntries?.[dayLabel] || ""}
                  //                       onClick={() => {
                  //                         if (!(stateDisable )) {
                  //                           handleInputClick(projectKey, dayLabel, row);
                  //                         }
                  //                       }}
                  //                       onChange={(e) => {
                  //                         if (!(stateDisable )) {
                  //                           handleTimeChange(projectKey, index, dayLabel, e.target.value);
                  //                         } else {
                  //                           e.preventDefault();
                  //                         }
                  //                       }}
                  //                       onKeyDown={(e) => {
                  //                         if (stateDisable ) e.preventDefault();
                  //                       }}
                  //                       onBlur={(e) => {
                  //   if (!stateDisable) {
                  //     handleTimeChange(projectKey, index, dayLabel, e.target.value, { type: 'blur' });
                  //   }
                  // }}

                  //                     />

                  //                     {dayIdx === 0 && !viewmode && (
                  //                       <div
                  //                         className={`Copy-icon ${stateDisable === true ? 'disabled' : ''}`}
                  //                         title="Copy Monday time to weekdays"
                  //                         onClick={() => {
                  //                           let value = row.timeEntries?.[dayLabel] || "";
                  //                           if (/^\d$/.test(value)) value = `0${value}:00`;
                  //                           weekDays.forEach((dayObj) => {
                  //                             const dayNum = dayObj.getDay();
                  //                             if (dayNum >= 1 && dayNum <= 5) {
                  //                               const targetDay = dayObj.toLocaleDateString("en-GB", { weekday: "long" });
                  //                               handleTimeChange(projectKey, index, targetDay, value);
                  //                             }
                  //                           });
                  //                         }}
                  //                       >
                  //                         <ContentCopyIcon sx={{ fontSize: 10, color: "#033EFF" }} />
                  //                       </div>
                  //                     )}
                  //                   </div>
                  //                 </td>
                );
              })}
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <>
       <div className={screenBlur ? "blurred" : ""}>
        {screenBlur && (
          <div className="screen-spinner">
            <div className="spinner" />
          </div>
        )} 
        
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="table-section mar-all">
        <div className="calendar-flex">
          {/* <p className="sub-title">Projects</p> */}
          {/* {!isApprovalMode && (
            <div
              className="d-flex padding-right-100"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <div onClick={handlePrevMonth} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <KeyboardDoubleArrowLeftIcon />
              </div>
              <div
                onClick={handlePrevWeek}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <ChevronLeftIcon />
              </div>
           <div className="day-month">
                <span className="ml-5">{formattedDateRange}</span>
              </div>
              <div
                onClick={handleNextWeek}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <ChevronRightIcon />
              </div>
              <div onClick={handleNextMonth} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <KeyboardDoubleArrowRightIcon />
              </div>
            </div>
          )} */}


          {!isApprovalMode && (
            <div
              className="calendar padding-right-100"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <div onClick={handlePrevMonth} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <KeyboardDoubleArrowLeftIcon />
              </div>
              <div
                onClick={handlePrevWeek}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <ChevronLeftIcon />
              </div>



              <div className="day-month">
                <span className="ml-5">{formattedDateRange}</span>
              </div>

              <div
                onClick={handleNextWeek}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <ChevronRightIcon />
              </div>
              <div onClick={handleNextMonth} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <KeyboardDoubleArrowRightIcon />
              </div>

              {/* Calendar icon that triggers the date picker */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  ref={dateInputRef}
                  min={`${minDate}`}
                  max={`${new Date().getFullYear()}-12-31`}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  onChange={handleDateChange}
                />
                <Tooltip title="Pick Date" placement="top" arrow>
                <div
                  onClick={() => dateInputRef.current?.showPicker()}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <CalendarMonthIcon />
                </div>
                </Tooltip>
              </div>

            </div>
          )}

        </div>

        <div className="table-wrapper create-timesheet">
          <table className="your-table-class">
            <thead>
              <tr className="tr-height-first">
                <td className="gray width-30">
                  <div className="d-flex">
                    <div className="pl-8">Projects</div>
                    <Tooltip title="Add Project" placement="top" arrow>
                    <div>
                      {!viewmode && (
                        <span
                          className={`adding ${stateDisable === true ? 'disabled' : ''}`}>

                          <AddIcon
                            className={`add-icon ${stateDisable || isApprovalMode ? "disabled" : ""}`}
                            onClick={() => {
                              if (stateDisable || isApprovalMode) {
                                // toast.warning("Adding is disabled.");
                                return;
                              }
                              handleClickOpen();
                            }}
                          />
                        </span>
                      )}
                    </div>
                    </Tooltip>
                  </div>
                </td>

                <td className="tas pl-10">Tasks</td>
                <td className="width-27 center">Remarks</td>
                <th colSpan={7} style={{ width: '700px' }}>
                  <div className="d-flex1" style={{ gap: "20px" }}>
                    {weekDays.map((day, idx) => (
                      <span key={idx}>{formatDay(day)}</span>
                    ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(projectRows).length > 0 &&
                Object.entries(projectRows).map(([projectKey, rows]) => {
                  const projectCode = projectKey.replace("project_", "");
                  const project = projectsData.find(p => p.projectCode === projectCode && p.status_flag != 'deleted');
                  const project_title = project ? project.projectName : rows[0].projectName;
                  return renderRows(projectKey, project_title);
                })}

              {Object.keys(projectRows).length === 0 && finalStatus === "Draft" && (
                <tr>
                  <td colSpan={10} className="noProject">
                    No projects added
                  </td>
                </tr>
              )}
            </tbody>


            <tfoot>
              <tr className="tr-height">
                <td>
                  <div className="billable">
                    {bulkProjectKey.length > 1 && (
                      <span
                        style={{
                          color: "red",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontWeight: "500",
                          marginRight: "10px"
                        }}
                        onClick={() => setBulkDeleteConfirmOpen(true)}
                      >
                        Delete
                      </span>
                    )}
                    <div className="b">B</div>
                    <div className="billing">Billable</div>
                    <div className="nb">NB</div>
                    <div className="nonbill">Non-Billable</div>
                  </div>
                </td>
                <td></td>
                <td>Total Hours</td>
                {weekDays.map((dayObj, index) => {
                  const dayLabel = dayObj.toLocaleDateString('en-GB', { weekday: 'long' });
                  return (
                    <td key={index}>
                      <span className={`${isRejectPage ? "green" : "black"} total-time`}>
                        {calculateTotalTimePerDay(dayLabel)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>

          {/* {Object.keys(rowErrors).length > 0 && <div className="error-msg">Some rows do not sum to 40 hours.</div>}
{Object.keys(columnErrors).length > 0 && <div className="error-msg">Some days do not sum to 8 hours.</div>} */}

        </div>

        <Dialog
          open={showRemarkPopup}
          onClose={() => setShowRemarkPopup(false)}
          maxWidth={false}
          PaperProps={{
            style: {
              width: '750px',
              height: '360px',
            },
          }}
        >
          <div className="d-flex light-blue">
            <DialogTitle style={{ padding: '10px 15px' }}>
              <span className="dialog-title">Remarks for<span className="week-range-text">
                {formattedDateRange}
              </span></span>
              <div>
                <span className="project-title-text">{popupProjectTitle}
                  &nbsp;-&nbsp;</span>
                <span className="task-name-text">{popupTaskName}</span>
              </div>
            </DialogTitle>
            <DialogActions>
              <div title="Save" className="icon-button " onClick={handleSaveRemark}>
                <CheckIcon className="icon-color" />
              </div>
              <div title="Cancel" className="icon-button " onClick={() => setShowRemarkPopup(false)}>
                <CloseIcon className="icon-color" />
              </div>
            </DialogActions>
          </div>

          <DialogContent>
            <div className="pad-all">
              <div className="tab-container">
                <div className="tab-buttons">
                  <div className="remark-date">
                    {getWeekDates(currentDate).map((date, index) => (
                      <div key={index} style={{ width: "90px", textAlign: "center", fontSize: "13px", fontWeight: "500", color: "#333" }}>
                        {formatDateShort(date)}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "10px", }}>
                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          key={idx}
                          className={`tab-button ${activeDay === day ? "active" : ""}`}
                          onClick={() => setActiveDay(day)}
                          style={{
                            padding: "10px 30px",
                            backgroundColor: activeDay === day ? "#3AAED5" : "#ddd",
                            color: activeDay === day ? "#fff" : "#000",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            width: "90px",
                            fontFamily: 'Mulish'
                          }}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>


                        <span key={day} style={{ fontSize: '13px', color: activeDay === day ? "#3AAED5" : "#333333" }}>
                          {projectRows?.[selectedProjectKey]?.[selectedRowIndex]?.timeEntries?.[getFullDayName(day)] || '00:00'}
                        </span>

                      </div>
                    ))}
                  </div>


                </div>
                {remarkWarning && (
                  <div className="tooltip-warning">
                    Minimum 10 characters required
                  </div>
                )}


              </div>

              <textarea
                ref={textareaRef}
                value={projectRows[selectedProjectKey]?.[selectedRowIndex]?.remarks?.[getFullDayName(activeDay)] ?? ''}
                onChange={(e) => {
                  e.preventDefault();
                  const newRemarks = e.target.value;
                  const dayName = getFullDayName(activeDay);
                  setProjectRows(prev => {
                    const updated = [...(prev[selectedProjectKey] || [])];
                    if (!updated[selectedRowIndex]) return prev;
                    const updatedRow = { ...updated[selectedRowIndex] };
                    const updatedRemarks = { ...(updatedRow.remarks || {}) };
                    updatedRemarks[dayName] = newRemarks;
                    updatedRow.remarks = updatedRemarks;
                    updated[selectedRowIndex] = updatedRow;
                    return { ...prev, [selectedProjectKey]: updated };
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();

                    const currentIndex = days.indexOf(activeDay.toLowerCase());
                    if (currentIndex !== -1) {
                      const newIndex = e.shiftKey
                        ? (currentIndex - 1 + days.length) % days.length
                        : (currentIndex + 1) % days.length;

                      const nextDay = days[newIndex];
                      setActiveDay(nextDay);
                    }
                  }
                }}
                maxLength={500}
                rows={5}
                className="custom-textarea"
                readOnly={stateDisable || isDisabled[selectedProjectKey]?.includes(getFullDayName(activeDay)) ||  isApprovalMode || (projectRows[selectedProjectKey]?.[selectedRowIndex]?.is_hidden)}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={open} onClose={handleClose} PaperProps={{
          style: {
            width: '750px',
            height: '360px',
          },
        }}>
          <DialogTitle style={{ padding: 0 }} className="">
            <div className="d-flex-add">
              <DialogTitle className="custom-dialog-title">Add Projects</DialogTitle>
              <DialogActions>
                <div title="Yes" className="icon-button " onClick={handleAddProjects}>
                  <CheckIcon className="icon-color" />
                </div>
                <div title="Cancel" className="icon-button" onClick={handleClose}>
                  <CloseIcon className="icon-color" />
                </div>
              </DialogActions>
            </div>
          </DialogTitle>

          <DialogContent className="content">
            <div className="tabs-2">
              <div
                className={`tab2 ${activeTab === "Allocated Projects" ? "activee" : "default"}`}
                onClick={() => setActiveTab("Allocated Projects")}
              >
                Allocated Projects
              </div>
              <div
                className={`tab2 ${activeTab === "Miscellaneous" ? "activee" : "default"}`}
                onClick={() => setActiveTab("Miscellaneous")}
              >
                Miscellaneous
              </div>
            </div>

            <div className="tab-body-container">
              {activeTab === "Allocated Projects" && (
                <div>
                  <div className="tab-body">
                    {projectsData
                      .filter(project => {
                        const projectKey = `project_${project.projectCode}`;
                        // Show project if:
                        // 1. It's not in projectRows at all, OR
                        // 2. All its tasks are marked as deleted
                        return (
                          !projectRows[projectKey] ||
                          (projectRows[projectKey] &&
                            projectRows[projectKey].every(task => task.status_flag === 'deleted'))
                        ) && project.is_chargeable === "true";
                      })
                        .map((project, index, filteredArray) => (

                          (
                            project.project_access && (
                              <div key={project.projectCode}>
                                <div className="in">
                                  <input
                                    type="checkbox"
                                    id={project.projectCode}
                                    className="check"
                                    onChange={() => {
                                      handleDialogProjectCheckboxChange(project.projectCode)
                                    }}
                                    checked={dialogSelectedProjects.includes(project.projectCode)}
                                  />
                                  <label htmlFor={project.projectCode} className="project">
                                    {project.projectName}
                                  </label>
                                </div>
                                {index < filteredArray.length - 1 && <hr className="line" />}
                              </div>
                            )
                          )
                        ))}
                  </div>
                </div>
              )}

              {activeTab === "Miscellaneous" && (
                <div className="miscellaneous-container" style={{ minHeight: '200px' }}>
                  {projectsData
                    .filter(project => !projectRows[`project_${project.projectCode}`] && project.is_chargeable === "false")
                    .map((project, index, filteredArray) => (
                      <div key={project.projectCode}>
                        <div className="in">
                          <input
                            type="checkbox"
                            id={project.projectCode}
                            className="check"
                            // checked={selectedProjects.includes(project.projectCode)}
                            // onChange={() => handleProjectCheckboxChange(project.projectCode)}
                            onChange={() => handleDialogProjectCheckboxChange(project.projectCode)}
                            checked={dialogSelectedProjects.includes(project.projectCode)}

                          />
                          <label htmlFor={project.projectCode} className="project">{project.projectName}</label>
                        </div>
                        {index < filteredArray.length - 1 && <hr className="line" />}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{
          style: {
            width: '400px',
            maxWidth: 'unset',
          }
        }}>
          <DialogTitle style={{ padding: '0' }} className="">
            <div className="d-flex bg-light-blue">
              <DialogTitle className="custom-dialog-title">Delete</DialogTitle>
              <DialogActions>
                <div title="Yes" className="icon-button " onClick={handleDeleteConfirmed}>
                  <CheckIcon className="black-icon" />
                </div>
                <div title="Cancel" className="icon-button " onClick={() => setDeleteConfirmOpen(false)}>
                  <CloseIcon className="black-icon" />
                </div>
              </DialogActions>
            </div>
          </DialogTitle>
          <DialogContent className="pad-all-20">
            <div className="">
              <div>Delete this project?</div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={bulkDeleteConfirmOpen}
          onClose={() => setBulkDeleteConfirmOpen(false)}
          PaperProps={{
            style: { width: "400px", maxWidth: "unset" },
          }}
        >
          <DialogTitle style={{ padding: '0' }} className="">
            <div className="d-flex bg-light-blue">
              <DialogTitle className="custom-dialog-title">Delete</DialogTitle>
              <DialogActions>
                <div
                  title="Yes"
                  className="icon-button "
                  onClick={() => {
                    handleBulkDelete();
                    setBulkDeleteConfirmOpen(false)
                  }}
                >
                  <CheckIcon className="black-icon" />
                </div>
                <div
                  title="Cancel"
                  className="icon-button wrong-icon-bg"
                  onClick={() => setBulkDeleteConfirmOpen(false)}
                >
                  <CloseIcon className="black-icon" />
                </div>
              </DialogActions>
            </div>
          </DialogTitle>

          <DialogContent className="pad-all-20">

            <div>
              <div>Are you sure you want to delete the following projects?</div>
            </div>


          </DialogContent>
        </Dialog>
      </div>
      </div>
    </>
  );
}

export default TableCreationTimeSheet;