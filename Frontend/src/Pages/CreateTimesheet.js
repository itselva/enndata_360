
import "../Styles/CreateTimesheet.css";
import Header from "../Components/header";
import React, { useEffect, useState, useRef } from "react";
import TableofCreateTImeSheet from '../Components/TableofCreateTimeSheet';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApprovalList from "./ApprovalList";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Select from 'react-select';
import { selectCustomStyles, selectCustomStylesRevert } from "../Components/selectCustomStyles";
import { components } from 'react-select';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import HistoryTab from "../Components/Historytab";
import LeaveUpload from "./LeaveUpload";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Settings from "../Components/settings";
let start_date = '';
export const getStartOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  start_date = start;

  return start;
};


export const getEndOfWeek = (date) => {
  const startOfWeek = getStartOfWeek(date);
  const end = new Date(startOfWeek);
  end.setDate(startOfWeek.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};


function CreateTimesheet() {
  const accessToken = localStorage.getItem('access_token');
  const permissions = localStorage.getItem('permissions');
  const emp_id = localStorage.getItem("emp_id");
  const emp_code = localStorage.getItem("emp_code");
  const min_hours = localStorage.getItem("min_hours");
  const [activeSubTab, setActiveSubTab] = useState("currentWeek");
  const [isTableDisabled,] = useState(false);
  const [currentDate,] = useState(new Date())
  const [projectsData, setProjectsData] = useState([]);
  const [IsSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [ButtonStates, setButtonStates] = useState({});
  const navigate = useNavigate();
  const [projectRows, setProjectRows] = useState({});
  const [weekDayList, setWeekDayList] = useState([]);
  const [totalWeekTime, setTotalWeekTime] = useState("")
  const [options, setOptions] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [reload, setReload] = useState(false);
  const [screenBlur, setScreenBlur] = useState(false);
  const [submitOnly, setSubmitOnly] = useState(false);
  const [TimeEntries, setTimeEntries] = useState([])
  const [UnsubmittedProjects, setUnsubmittedProjects] = useState([]);
  const [ActiveButton, setActiveButton] = useState(null);
  const status = localStorage.getItem("final_status");
  const Manager = () => localStorage.getItem("isManager") === "true";
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "create");
  const [IsSaving, setIsSaving] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const filterRef = useRef(null);
  const [stateDisable, setStateDisable] = useState(false)
  const [ARMessage, setARMessage] = useState('')
  const [notSubmittedCount, setNotSubmittedCount] = useState(0)
  const deletedEntriesRef = useRef([]);
  const [revertOpen, setRevertOpen] = useState(false);
  const [revertMessage, setRevertMessage] = useState('');
  const textareaRef = useRef(null);
  const [approverOptions, setApproverOptions] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [revertActionOptions, setRevertActionOptions] = useState([]);
  const [selectedRevert, setSelectedRevert] = useState(null);
  const [confirmRevert, setConfirmRevert] = useState(false);
  const [owner, setOwner] = useState('');
  const [dateOfRequest, setDateOfRequest] = useState('');
  const [revertSelected, setrevertSelected] = useState([]);
  const [revertDate, setRevertDate] = useState([]);
  const [showPMO, setShowPMO] = useState(false);
  const [restrictButton, setRestrictButton] = useState(false);
  const [isPrevWeekSubmitOnly, setIsPrevWeekSubmitOnly] = useState(false);
  const [enableWeek, setEnableWeek] = useState(false);
  const [enableWeekShow, setEnableWeekShow] = useState(false);
  const [approvalCountOpen, setApprovalCountOpen] = useState(
    localStorage.getItem('show_approval') === 'true'
  );
  const [count,setCount]=useState(false);
  const [queuedNotSubmit, setQueuedNotSubmit] = useState(
    Manager() && localStorage.getItem("show_not_submit") === "true"
  );
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [finalStatus, setFinalStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const loggedInEmployeeId = localStorage.getItem("emp_id");
  const [approvalCount, setApprovalCount] = useState(0);
  const user_role = localStorage.getItem("user_role");
  const [notSubmittedBox, setNotSubmittedBox] = useState(false);
  const [notSubmittedLocked, setNotSubmittedLocked] = useState(false);
  const [showPartiallyApproved, setShowPartiallyApproved] = useState(false);
  const [isSubmitted,setIsSubmitted]=useState(false);


  const [isMobile, setIsMobile] = useState(window.innerWidth <= 820);
  const projectRowsRef = useRef(projectRows);
  // if both means it return true and the leave upload will be enabled
  const leaveUploadManager = () => {
    const role = localStorage.getItem("user_role");
    return role === "PMO" || role === "Time Keeper" || role ==='Admin';
  };
 const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const endDateRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



useEffect(() => {
  if (!Manager() && localStorage.getItem("show_not_submit") === "true"&&notSubmittedCount>0) {
    setNotSubmittedBox(true);
  }
}, [notSubmittedCount]);
useEffect(() => {
  // console.log(isSubmitted);
  if (queuedNotSubmit&&notSubmittedCount>0&&approvalCount===0) {
    setNotSubmittedBox(true);
  }
}, [notSubmittedCount]);
  useEffect(() => {

    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location.state]);
  // This effect will update the tab when navigation state changes
  useEffect(() => {
    if (location.state?.selectedTab) {
      setActiveTab(location.state.selectedTab);
    }
  }, [location.state]);
  useEffect(() => {
    projectRowsRef.current = projectRows;
  }, [projectRows]);

  useEffect(() => {
    if (isManager) {
      fetchApprovalCount()
    }
  }, [isManager,count])

  const fetchApprovalCount = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approval_count`, {
        headers: {
          "Authorization": `${accessToken}`
        },
        method: "POST",
      });
      const apiResponse = await response.json();
      if (response.headers.get('Refresh-Token')) {
        
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: 'session'
        })
      }
      setApprovalCount(apiResponse.approval_count);
      

      // console.log('apiResponse',typeof apiResponse.approval_count)
    } catch (err) {
      console.log('err', err)
    }
  }

  useEffect(() => {
    const start = start_date || currentDate;

    //const start =currentDate;// getStartOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });


  }, [currentDate]);

  
  useEffect(() => {
    const managerFlag = localStorage.getItem("isManager") === "true";
    setIsManager(managerFlag);
    if (managerFlag) {

      fetchDropDown()
    }
  }, []);

  const convertToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };


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
    setRestrictButton(handleRestrictWeek(weekDayList));
  }, [projectRows, weekDayList]);

  useEffect(() => {
    const allFilled = Object.values(
      projectRows).every((rows) =>
        rows.every((row) =>
          row.timeEntries &&
          Object.values(row.timeEntries).every(
            (val) => val && val.trim() !== "" && val !== "0" && val !== "0:00"
          )
        )
      );

    setIsSubmitEnabled(allFilled);
  }, [projectRows]);



  useEffect(() => {
    const storedStatus = localStorage.getItem("final_status");
    if (storedStatus) {
      setFinalStatus(storedStatus);
      if (storedStatus === 'Approved' || storedStatus === 'Submitted') {
        setStateDisable(true)
      }
    }
  }, []);


  const getWeekDays = (startOfWeek) => {
    const monday = new Date(startOfWeek);
    monday.setHours(0, 0, 0, 0);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const DropdownIndicator = (
    props
  ) => {
    return (
      <components.DropdownIndicator {...props}>
        <ArrowDropDownIcon />
      </components.DropdownIndicator>
    );
  };


  const startOfWeek = start_date || currentDate;
  //console.log(startOfWeek, 'startOfWeek');
  const weekDays = getWeekDays(startOfWeek);





  // Ref cache for saved entries
  const savedTimeEntriesRef = useRef({});

  // State to track if user made changes after last save
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Call this function whenever user edits any entry to mark unsaved changes
  // const markUnsavedChanges = () => {
  //   if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  // };

  // Helper to format date to yyyy-mm-dd
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // // Timestamp for inserted_time field
  // const formatInsertedTime = () => {
  //   const now = new Date();
  //   const yyyy = now.getFullYear();
  //   const mm = String(now.getMonth() + 1).padStart(2, "0");
  //   const dd = String(now.getDate()).padStart(2, "0");
  //   const hh = String(now.getHours()).padStart(2, "0");
  //   const mi = String(now.getMinutes()).padStart(2, "0");
  //   const ss = String(now.getSeconds()).padStart(2, "0");
  //   const ms = String(now.getMilliseconds()).padStart(3, "0") + "000";
  //   return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}.${ms}`;
  // };

  const lastFetchedWeekRef = useRef({ start: null, end: null });


  // const fetchAndUpdateStatus = async (empId, startDate, endDate) => {
  //   console.log('fetchAndUpdateStatus')
  //   try {
  //     const formData = new FormData();
  //     formData.append("emp_id", empId);

  //     let url = "";

  //     if (activeSubTab === "notSubmitted") {
  //       url = `${process.env.REACT_APP_BACKEND_URL}/not_submitted`;
  //       formData.append("manager_id", "EMP010");
  //     } else {
  //       url = `${process.env.REACT_APP_BACKEND_URL}/fetch_details`;
  //       formData.append("start_date", startDate);
  //       formData.append("end_date", endDate);
  //     }

  //     const response = await fetch(url, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const result = await response.json();

  //     const entries =
  //       activeSubTab === "notSubmitted" ? result?.data || [] : result?.timeEntries || [];

  //     if (entries.length === 0) {
  //       setFinalStatus("Draft");
  //       localStorage.setItem("final_status", "Draft");
  //       setStateDisable(false)
  //       return;
  //     }

  //     const flags = entries.map((e) => e.status_flag);
  //     setARMessage(entries[0].approver_remarks)
  //     let status = "Draft";
  //     if (flags.every((s) => s === "submitted")) status = "Submitted";
  //     else if (flags.every((s) => s === "approved")) status = "Approved";
  //     else if (flags.every((s) => s === "saved")) status = "Saved";
  //     else if (flags.every((s) => s === "rejected")) status = "Rejected";


  //     setFinalStatus(status); // ✅ update React state
  //     localStorage.setItem("final_status", status); // optional
  //     if(status === 'Approved' || status === 'Submitted' ){
  //     setStateDisable(true)
  //    }else{
  //     setStateDisable(false)
  //    }
  //   } catch (err) {
  //     console.error("Error fetching status:", err);
  //     setFinalStatus("Error");
  //   }
  // };

  //   useEffect(() => {
  //   const empId = selectedEmpId || localStorage.getItem("emp_id");
  //   const startDate = formatDate(weekDays[0]);
  //   const endDate = formatDate(weekDays[6]);

  //   if (
  //     lastFetchedWeekRef.current.start !== startDate ||
  //     lastFetchedWeekRef.current.end !== endDate
  //   ) {
  //     lastFetchedWeekRef.current = { start: startDate, end: endDate };

  //   }
  // }, [weekDays, selectedEmpId]);

  useEffect(() => {
    const empId = selectedEmpId?.value || localStorage.getItem("emp_id");
    const startDate = formatDate(weekDays[0]);
    const endDate = formatDate(weekDays[6]);

    if (
      lastFetchedWeekRef.current.start !== startDate ||
      lastFetchedWeekRef.current.end !== endDate
    ) {
      lastFetchedWeekRef.current = { start: startDate, end: endDate };

      // Get status from localStorage or default to 'Draft'
      const newStatus = localStorage.getItem(`status_${empId}_${startDate}`) || 'Draft';

      // Update both React state and localStorage
      setFinalStatus(newStatus);
      localStorage.setItem("final_status", newStatus);

      // Update state disable based on status
      setStateDisable(newStatus === 'Approved' || newStatus === 'Submitted');
    }
  }, [weekDays, selectedEmpId]);
  // const getNotSubmittedCount = async (empId) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("emp_id", empId);
  //     formData.append("manager_id", "EMP010");

  //     // formData.append("start_date", startDate);
  //     // formData.append("end_date", endDate);

  //     const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/not_submitted`, {
  //       headers: {
  //         "Authorization": `${accessToken}`
  //       },
  //       method: "POST",
  //       body: formData,
  //     });

  //     const result = await response.json();
  //     // console.log(result, "result");
  //     if (response.status === 401) {
  //       toast.error('Session expired', {
  //         onClose: () => window.location.reload(),
  //       })
  //     }
  //     const statuses = result["data available"]?.split(",") || [];
  //     // console.log(statuses, "parsed statuses");

  //     const statusList = ["Saved", "Draft", "Rejected"];

  //     // Check if any matching status exists
  //     const hasNotSubmitted = statuses.some(status => statusList.includes(status));

  //     if (hasNotSubmitted) {
  //       setNotSubmittedCount(1);
  //     } else {
  //       setNotSubmittedCount(0);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching status:", err);
  //     setFinalStatus("Error");
  //   }
  // };




  // useEffect(() => {
  //   const fetchStatusOnly = async () => {
  //     const empId = selectedEmpId?.value || localStorage.getItem("emp_id");
  //     // const startDate = formatDate(weekDays[0]);
  //     // const endDate = formatDate(weekDays[6]);

  //     await getNotSubmittedCount(empId, startDate, endDate); // ✅ updates button status
  //   };

  //   fetchStatusOnly();
  // }, []);


  const fetchDropDown = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_reportees`, {
        method: "POST",
        headers: {
          "Authorization": `${accessToken}`
        },
      });

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: 'session'
        })
      }

      const fetchedOptions = result?.reportees?.reportees?.map(emp => ({
        value: emp.employee_id,
        label: emp.employee_name
      })) || [];

      // Merge with local employee if available
      const localEmpId = localStorage.getItem('emp_id');
      const localEmpName = localStorage.getItem('emp_name');

      // Parse Saved_Data if available
      const savedDataRaw = localStorage.getItem('Saved_Data');
      let savedData = null;

      try {
        const parsedData = savedDataRaw ? JSON.parse(savedDataRaw) : null;
        if (parsedData && parsedData.selectedEmpId) {
          savedData = parsedData.selectedEmpId;
        }
      } catch (err) {
        console.warn('Failed to parse Saved_Data:', err);
      }

      let combinedOptions = [...fetchedOptions];

      // Add localEmp if not already in list
      if (localEmpId && localEmpName) {
        const localOption = { value: localEmpId, label: localEmpName };
        const isAlreadyIncluded = combinedOptions.some(opt => opt.value === localEmpId);
        if (!isAlreadyIncluded) {
          combinedOptions.unshift(localOption);
        }
      }

      // Add Saved_Data if valid and not already in list
      if (savedData?.value && savedData?.label) {
        const isAlreadyIncluded = combinedOptions.some(opt => opt.value === savedData.value);
        if (!isAlreadyIncluded) {
          combinedOptions.unshift({ value: savedData.value, label: savedData.label });
        }
      }

      setOptions(combinedOptions);

      // Set selected employee
      const locationEmpId = location?.state?.employeeData?.emp_id;
      if (locationEmpId) {
        const selectedFromLocation = combinedOptions.find(opt => opt.value === locationEmpId);
        if (selectedFromLocation) {
          setSelectedEmpId(selectedFromLocation);
        }
      } else if (savedData?.value && savedData?.label) {
        // Use savedData as fallback selection
        setSelectedEmpId({ value: savedData.value, label: savedData.label });
        localStorage.removeItem('Saved_Data')
      } else if (localEmpId && localEmpName) {
        // Fallback to localStorage-based selection
        setSelectedEmpId({ value: localEmpId, label: localEmpName });
      }

    } catch (err) {
      console.log(err);
    }
  };


  const getWeekLabel = (weekDayList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(weekDayList[0]);
    const lastDay = new Date(weekDayList[6]);
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(0, 0, 0, 0);

    if (today >= firstDay && today <= lastDay) {
      return "Current Week";
    } else if (today < firstDay) {
      return "Next Week";
    } else {
      return "Previous Week";
    }
  }
  const hasDuplicateBillableOrNonBillableTask = (projectRows, projectsData) => {
    let hasDuplicate = false;

    for (const [projectKey, tasks] of Object.entries(projectRows)) {
      const projectCode = projectKey.replace("project_", "");
      const project = projectsData.find((p) => p.projectCode === projectCode);
      if (!project) continue;

      const billableTaskCodes = [];
      const nonBillableTaskCodes = [];

      tasks.forEach((task) => {
        if (
          task.status_flag === 'deleted'
        ) {
          return;
        }


        const isBillable = project.is_chargeable === "true" && task.isChecked;

        if (task.taskCode) {
          if (isBillable) {
            billableTaskCodes.push(task.taskCode);
          } else {
            nonBillableTaskCodes.push(task.taskCode);
          }
        }
      });

      // Check duplicates in billable
      const hasDuplicateBillable = billableTaskCodes.some(
        (code, index) => billableTaskCodes.indexOf(code) !== index
      );

      // Check duplicates in non-billable
      const hasDuplicateNonBillable = nonBillableTaskCodes.some(
        (code, index) => nonBillableTaskCodes.indexOf(code) !== index
      );

      if (hasDuplicateBillable || hasDuplicateNonBillable) {
        hasDuplicate = true;
        break;
      }
    }

    return hasDuplicate;
  };




  const handleSave = async () => {
    if (!permissions.includes('create_timesheet') || !permissions.includes('edit_timesheet')) {
      toast.error("Access denied",{
        toastId:"denied"
      });
      setScreenBlur(false)
      return;
    }
    setScreenBlur(true)
    try {

      setIsSaving(true);
      const loggedInEmployeeId = localStorage.getItem("emp_id");
      const employeeId = selectedEmpId?.value || loggedInEmployeeId;

      if (!employeeId) {
        toast.error("User ID is missing. Please log in again.",{
          toastId:"save-userid"
        });
        setScreenBlur(false)
        return;
      }

      if (!Object.keys(projectRows).length && deletedEntriesRef.current.length === 0) {
        toast.error("Please fill the timesheet.",{
          toastId:"Fill-Timesheet"
        });
        setScreenBlur(false)
        return;
      }
      if (hasDuplicateBillableOrNonBillableTask(projectRows, projectsData)) {
        toast.error("Project, Task and Billability is redundant. Toggle billable flag.",{
          toastId:"billablility"
        });
        setScreenBlur(false);
        return;
      }


      const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const formatInsertedTime = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ` +
          `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.` +
          `${String(now.getMilliseconds()).padStart(3, "0")}000`;
      };

      const startDate = formatDate(weekDayList[0]);
      const endDate = formatDate(weekDayList[6]);
      const timeEntries = [];
      let hasAtLeastOneTimeEntry = false
      
      let weekEntryId = null; // or set from backend later
      let hiddenID=[]
      


      // Loop through existing projectRows to gather new/updated entries
      for (const [projectKey, tasks] of Object.entries(projectRows)) {
        const projectCode = projectKey.replace("project_", "");
        const project = projectsData.find((p) => p.projectCode === projectCode);
        if (!project) continue;

        for (const task of tasks) {
          if (!task || !task.taskCode?.trim() && !(task.status_flag === 'deleted')) {
            toast.error(`Please select atleast one task`,{
              toastId:"select-task"
            });
            setScreenBlur(false)
            return;
          }

          const taskDef = project.tasks.find((t) => t.taskCode === task.taskCode);
          if (!taskDef) continue;
          if (task.is_hidden === true) {
            continue;
          }

        
          const hasAnyValue = Object.values(task?.timeEntries).some(value => value.trim() !== "");

          if (task && !hasAnyValue && !(task.status_flag === 'deleted')) {
            toast.error("Please enter time entries for the task selected ",{
              toastId:"task-timeentries"
            })
            setScreenBlur(false)
            return
          }

          
          for (const day of weekDayList) {
            const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
            const timeSpent = task.timeEntries?.[dayLabel];
            const remarks = task.remarks?.[dayLabel] || '';
            let deleteDay = task.deletedDay?.[dayLabel];
            let weekEntryId = task.weekentry_id;
            if ((timeSpent === "0:00" || timeSpent === undefined || timeSpent === null || (timeSpent.trim().length === 0)) && remarks.trim() && deleteDay != true &&!(task.status_flag === 'deleted')) {
              toast.error(`Please enter time entry for the remark entered`, {
                toastId: "save-remarks-error"
              });
              setScreenBlur(false)
              return
            }
            if ((timeSpent && timeSpent !== "0" && timeSpent !== "0:00") || deleteDay === true || task?.status_flag === 'deleted') {
              
              if (timeSpent && !remarks.trim() && !(task.status_flag === 'deleted') && deleteDay !== true ) {
                toast.error(`Please enter remark for the time(s) entered`,{
                  toastId:"remark-timeentries"
                });
                setScreenBlur(false)
                return
              } else if (remarks && !timeSpent && !(task.status_flag === 'deleted')&& deleteDay !== true  ) {
                toast.error(`Please enter time entry for the remark entered`,{
                  toastId:"remarks"
                });
                setScreenBlur(false)
                return
              }

              if (remarks.trim().length < 10 && task?.status_flag !== 'deleted' && deleteDay === undefined) {
                toast.error(`Missing 10 characters in remarks`,{
                  toastId:"10remarks"
                });
                setScreenBlur(false)
                return
              }


           
              hasAtLeastOneTimeEntry = true; // ✅ Enable this
              const key = `${employeeId}_${startDate}_${projectCode}_${task.taskCode}_${dayLabel}`;
              const previouslySaved = savedTimeEntriesRef.current[key];
              const hasChanged =
                !previouslySaved ||
                previouslySaved.time_spent !== timeSpent ||
                previouslySaved.remark !== (task.remark || "");

              if (hasChanged) {
                const existingId = task.timeEntryIDs?.[dayLabel];
                let projectCode = project.projectCode;
                let ticketNumber = null;
                let baseProjectCode = projectCode;

                if (projectCode.includes("-")) {
                  const parts = projectCode.split("-");
                  baseProjectCode = parts[0];   // "5"
                  ticketNumber = parts[1];      // "38479"
                }
                timeEntries.push({
                  timeentry_id: existingId || null,
                  weekentry_id: weekEntryId || null,
                  employee_id: employeeId,
                  week_start_date: startDate,
                  week_end_date: endDate,
                  project_code: baseProjectCode,
                  project_name: project.projectName,
                  task_code: task.taskCode,
                  task_name: taskDef.taskName,
                  // is_billable: taskDef.isBillable !== false,
                  // is_billable: task.isChecked ?? true,
                  is_billable: project.is_chargeable === "false" ? false : (task.isChecked && project.is_chargeable === "true" ? true : false),
                  remark: remarks,
                  time_spent: (deleteDay || task.status_flag === 'deleted') ? '00:00' : timeSpent.toString(),
                  entry_date: formatDate(day),
                  status_flag: task.status_flag === 'deleted' || deleteDay === true ? 'deleted' : "saved",
                  inserted_time: formatInsertedTime(),
                  saved_by: employeeId,
                  ticket_number: ticketNumber
                });
              }
            }
          }
        }

      }
     const dailyTotals = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday:0,
        Sunday:0,
      };
          let totalWeekTimeInMinutes = 0;
      
      for (const entry of timeEntries) {
        const entryDate = new Date(entry.entry_date);
        const dayLabel = entryDate.toLocaleDateString("en-GB", { weekday: "long" });

        const [h, m] = entry.time_spent.split(":").map(Number);
        const minutes = h * 60 + m;
        totalWeekTimeInMinutes += minutes;
          dailyTotals[dayLabel] = (dailyTotals[dayLabel] || 0) + minutes;
      }
      for (const [day, minutes] of Object.entries(dailyTotals)) {
        const isWeekend = day === "Saturday" || day === "Sunday";
        if (isWeekend && minutes === 0) {
          continue;
        }

        if (minutes > 1440 ) {
          toast.error(`Total time on ${day} exceeds 24 hours.`,{
            toastId:"24hrs"
          });
          setScreenBlur(false)
          return;
        }
      }
            const filteredEntries = timeEntries.filter(entry => !hiddenID.includes(entry.weekentry_id));
            const payload = { timeEntries:filteredEntries };
      // const payload = { timeEntries };
       if (payload?.timeEntries.length === 0) {
        setScreenBlur(false)
        let id = 'authorized'
        toast.dismiss(id)
        toast.warn("You are not authorized to Save other's projects", {
          toastId: id
        })
        return
      }
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/time_entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${accessToken}`
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:"save-sessionexpired"
        })
      }

      if (response.status === 400) {
        if (result?.detail === "No previous week submitted entries found") {
          toast.error('Please submit previous week',{
            toastId:"Noprevweek"
          })
          setScreenBlur(false)
          return;
        }
      }
      if (!response.ok) {
        throw new Error(result.detail || "Failed to save time entries");
      }

      // Update cache and projectRows
      const updatedEntries = result.successful_entries?.timeEntries || [];
      const newProjectRows = { ...projectRows };
      const newSavedEntries = { ...savedTimeEntriesRef.current };

      updatedEntries.forEach((entry) => {
        const projectKey = `project_${entry.project_code}`;
        const taskCode = entry.task_code;
        const entryDate = new Date(entry.entry_date);
        const dayLabel = entryDate.toLocaleDateString("en-GB", { weekday: "long" });
        const key = `${employeeId}_${startDate}_${entry.project_code}_${taskCode}_${dayLabel}`;

        const task = newProjectRows[projectKey]?.find(t => t.taskCode === taskCode);
        if (task) {
          if (!task.timeEntryIDs) task.timeEntryIDs = {};
          task.timeEntryIDs[dayLabel] = entry.id;
        }

        newSavedEntries[key] = {
          time_spent: entry.time_spent,
          remark: entry.remark || "",
          status_flag: "saved",
        };
      });

      savedTimeEntriesRef.current = newSavedEntries;
      deletedEntriesRef.current = []; // ✅ clear deleted cache after save
      setProjectRows(newProjectRows);
      setHasUnsavedChanges(false);

      toast.success("Timesheet saved successfully", {
        onClose: () => {
          localStorage.setItem('Saved_Data', JSON.stringify({
            start: startDate,
            end: endDate,
            selectedEmpId: isManager ? selectedEmpId : {
              value: employeeId,
              label: localStorage.getItem('emp_name')
            }
          }))
          navigate("/CreateTimesheet", {
            state: { activeTab: "create" }
          });
          
          window.location.reload()
        },toastId:"saved"
      });
      // fetchAndUpdateStatus(employeeId, startDate, endDate);
    } catch (error) {
      setScreenBlur(false)
      toast.error(`Save failed: ${error.message}`,{
        toastId:"save-failed"
      });

    } finally {
      setIsSaving(false);
    }
  };







  //-----------handle submit------------------------------------//
  const handleSubmit = async () => {
    if (!permissions.includes('submit_timesheet')) {
      toast.error("Access denied",{
        toastId:"submit-denied"
      });
      setScreenBlur(false)
      return;
    }
    setScreenBlur(true)
    try {
      setIsSaving(true);
      const loggedInEmployeeId = localStorage.getItem("emp_id");
      const employeeId = selectedEmpId?.value || loggedInEmployeeId;
      //  if (notSubmittedCount > 0) { toast.error("Please Submit the Previous Week Timesheet"); return; }
      if (!employeeId) {
        toast.error("User ID is missing. Please log in again.",{
          toastId:"submit-usermissing"
        });
        setScreenBlur(false)
        return;
      }

      if (!Object.keys(projectRows).length) {
        toast.error("Please fill the timesheet.",{
          toastId:"submit-fill"
        });
        setScreenBlur(false)
        return;
      }
      if (hasDuplicateBillableOrNonBillableTask(projectRows, projectsData)) {
        toast.error("Project, Task and Billability is redundant. Toggle billable flag.",{
          toastId:"submit-billable"
        });
        setScreenBlur(false);
        return;
      }

      if (!weekDayList || weekDayList.length !== 7) {
        setScreenBlur(false)
        return;
      }
      const currentDate = new Date();

      // Get the start of the current week (Monday)
      const currentWeekStart = new Date(currentDate);
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Monday
      currentWeekStart.setHours(0, 0, 0, 0);

      // Get the start of previous week (Monday)
      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);

      // Get the end of previous week (Sunday)
      const previousWeekEnd = new Date(previousWeekStart);
      previousWeekEnd.setDate(previousWeekEnd.getDate() + 6);
      previousWeekEnd.setHours(23, 59, 59, 999);

      // Parse the selected week's range
      const startDateOfWeek = new Date(weekDayList[0]);
      const endDateOfWeek = new Date(weekDayList[6]);
      startDateOfWeek.setHours(0, 0, 0, 0);
      endDateOfWeek.setHours(23, 59, 59, 999);

      // Is the user submitting this week's timesheet?
      const isCurrentWeek =
        startDateOfWeek.getTime() === currentWeekStart.getTime();

      // Is the previous week's timesheet not submitted?
      const isPrevWeekPending = notSubmittedCount > 0;
      // ✅ Block submission ONLY if trying to submit current week while previous is not submitted
      const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const formatInsertedTime = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ` +
          `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.` +
          `${String(now.getMilliseconds()).padStart(3, "0")}000`;
      };

      const startDate = formatDate(weekDayList[0]);
      const endDate = formatDate(weekDayList[6]);

      const timeEntries = [];
      let weekEntryId = null; // or set from backend later
      let hiddenID=[]

      // Validate and collect changed time entries
      for (const [projectKey, tasks] of Object.entries(projectRows)) {
        const projectCode = projectKey.replace("project_", "");
        const project = projectsData.find((p) => p.projectCode === projectCode);
        if (!project) continue;

        for (const task of tasks) {
          if (!task || !task.taskCode?.trim() && !(task.status_flag === 'deleted')) {
            toast.error(`Please select atleast one task`,{
              toastId:"submit-task"
            });
            setScreenBlur(false)
            return;
          }

          const taskDef = project.tasks.find((t) => t.taskCode === task.taskCode);
          if (!taskDef) continue;

          const hasAnyValue = Object.values(task?.timeEntries).some(value => value.trim() !== "");
          if (task && !hasAnyValue && !(task.status_flag === 'deleted')) {
            toast.error("Please enter time entries for the task selected ",{
              toastId:"submit-timeentries"
            })
            setScreenBlur(false)
            return
          }
          for (const day of weekDayList) {
            const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
            const timeSpent = task.timeEntries?.[dayLabel];
            const remarks = task.remarks?.[dayLabel] || '';
            let deleteDay = task.deletedDay?.[dayLabel];

            weekEntryId = task.weekentry_id
            if (task.is_hidden === true) {
              if (!hiddenID.includes(task.weekentry_id)) {
                hiddenID.push(task.weekentry_id);
              }
            }
            if ((timeSpent === "0:00" || timeSpent === undefined || timeSpent === null || (timeSpent.trim().length === 0)) && remarks.trim() && deleteDay !== true &&!(task.status_flag === 'deleted')) {
              toast.error(`Please enter time entry for the remark entered`, {
                toastId: "submit-remarks-error"
              });
              setScreenBlur(false)
              return
            }
            if ((timeSpent && timeSpent !== "0" && timeSpent !== "0:00") || deleteDay === true|| task.status_flag === 'deleted' ) {
              if (timeSpent && !remarks.trim() && !(task.status_flag === 'deleted') && !deleteDay) {
                toast.error(`Please enter remark for the time(s) entered`,{
                  toastId:"submit-remark-timeenties"
                });
                setScreenBlur(false)
                return
              } else if (remarks && !timeSpent && !(task.status_flag === 'deleted')&& !deleteDay) {
                toast.error(`Please enter time entry for the remark entered`,{
                  toastId:"submit-remarksentred"
                });
                setScreenBlur(false)
                return
              }
              if (remarks.trim().length < 10 && task?.status_flag !== 'deleted' && deleteDay === undefined) {
                toast.error(`Missing 10 characters in remarks`,{
                  toastId:"submit-remarks20"
                });
                setScreenBlur(false)
                return
              }
              const key = `${employeeId}_${startDate}_${projectCode}_${task.taskCode}_${dayLabel}`;
              const previouslySaved = savedTimeEntriesRef.current[key];
              const hasChanged =
                !previouslySaved ||
                previouslySaved.time_spent !== timeSpent ||
                previouslySaved.remark !== (task.remark || "");

              if (hasChanged) {
                const existingId = task.timeEntryIDs?.[dayLabel];
                let projectCode = project.projectCode;
                let ticketNumber = null;
                let baseProjectCode = projectCode;

                if (projectCode.includes("-")) {
                  const parts = projectCode.split("-");
                  baseProjectCode = parts[0];   // "5"
                  ticketNumber = parts[1];      // "38479"
                }

                timeEntries.push({
                  timeentry_id: existingId || null,
                  weekentry_id: weekEntryId || null, // ✅ CORRECTED spelling here
                  employee_id: employeeId,
                  week_start_date: startDate,
                  week_end_date: endDate,
                  project_code: baseProjectCode,
                  project_name: project.projectName,
                  task_code: task.taskCode,
                  task_name: taskDef.taskName,
                  // is_billable: task.isChecked ?? true,
                  is_billable: project.is_chargeable === "false" ? false : (task.isChecked && project.is_chargeable === "true" ? true : false),
                  remark: remarks,
                  time_spent: (deleteDay || task.status_flag === 'deleted') ? '00:00' : timeSpent.toString(),
                  entry_date: formatDate(day),
                  status_flag: task.status_flag === 'deleted' || deleteDay === true ? 'deleted' : "submitted",
                  inserted_time: formatInsertedTime(),
                  saved_by: employeeId,
                  ticket_number: ticketNumber
                });
              }
            }
          }
        }
      }

      // Time validation
      // const dailyTotals = {};
      const dailyTotals = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday:0,
        Sunday:0,
      };
      let totalWeekTimeInMinutes = 0;

      for (const entry of timeEntries) {
        const entryDate = new Date(entry.entry_date);
        const dayLabel = entryDate.toLocaleDateString("en-GB", { weekday: "long" });

        const [h, m] = entry.time_spent.split(":").map(Number);
        const minutes = h * 60 + m;
        totalWeekTimeInMinutes += minutes;

        dailyTotals[dayLabel] = (dailyTotals[dayLabel] || 0) + minutes;
      }

      let minimumHR = min_hours ? min_hours:'08:00'
      let totalMinimumHR=timeToMinutes(minimumHR)
      for (const [day, minutes] of Object.entries(dailyTotals)) {

        const isWeekend = day === "Saturday" || day === "Sunday";

        // Skip weekends if minutes are 0
        if (isWeekend && minutes === 0) {
          continue;
        }

        if (minutes < totalMinimumHR && !isWeekend && !emp_code.includes('CBL') && !emp_code.includes('USC')) {
          toast.error(`Total time on ${day} is less than ${convertMinutesToHoursOnly(totalMinimumHR)} hours.`, {
            toastId: "submit-8hrs"
          });
          setScreenBlur(false);
          return;
        } else if (minutes > 1440) {
          toast.error(`Total time on ${day} exceeds 24 hours.`, {
            toastId: "submit-24"
          });
          setScreenBlur(false);
          return;
        }
      }


      if (totalWeekTimeInMinutes < totalMinimumHR * 5 && !emp_code.includes('CBL') && !emp_code.includes('USC')) {
        toast.error(`Total time for the week is less than ${convertMinutesToHoursOnly(totalMinimumHR)} hours.`,{
          toastId:"submit-totalweekhours"
        });
        setScreenBlur(false)
        return;
      }
      const filteredEntries = timeEntries.filter(entry => !hiddenID.includes(entry.weekentry_id));
      const payload = { timeEntries:filteredEntries };
      if (payload?.timeEntries.length === 0) {
        setScreenBlur(false)
        let id = 'authorized'
        toast.dismiss(id)
        toast.warn("You are not authorized to Submit other's projects", {
          toastId: id
        })
        return
      }
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/time_entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${accessToken}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:"submit-sessionfailed"
        })
      }
      if (response.status === 400) {
        if (result?.detail === "No previous week submitted entries found") {
          toast.error('Please submit previous week',{
            toastId:"submit-prevweek"
          })
          setScreenBlur(false)
          return;
        }
      }
      if (!response.ok) {
        throw new Error(result.detail || "Failed to submit time entries");
      }

      // Update local cache
      const updatedEntries = result.successful_entries?.timeEntries || [];
      const newProjectRows = { ...projectRows };
      const newSavedEntries = { ...savedTimeEntriesRef.current };

      updatedEntries.forEach((entry) => {
        const projectKey = `project_${entry.project_code}`;
        const taskCode = entry.task_code;
        const entryDate = new Date(entry.entry_date);
        const dayLabel = entryDate.toLocaleDateString("en-GB", { weekday: "long" });
        const key = `${employeeId}_${startDate}_${entry.project_code}_${taskCode}_${dayLabel}`;

        if (newProjectRows[projectKey]) {
          const task = newProjectRows[projectKey].find((t) => t.taskCode === taskCode);
          if (task) {
            if (!task.timeEntryIDs) task.timeEntryIDs = {};
            task.timeEntryIDs[dayLabel] = entry.id;
          }
        }

        newSavedEntries[key] = {
          time_spent: entry.time_spent,
          remark: entry.remark || "",
          status_flag: "saved",
        };
      });

      savedTimeEntriesRef.current = newSavedEntries;
      setProjectRows(newProjectRows);
      setHasUnsavedChanges(false);

      toast.success("Timesheet submitted successfully", {
        onClose: () => {
          localStorage.setItem('Saved_Data', JSON.stringify({
            start: startDate,
            end: endDate,
            selectedEmpId: isManager ? selectedEmpId : {
              value: employeeId,
              label: localStorage.getItem('emp_name')
            }
          }))
          navigate("/CreateTimesheet", {
            state: { activeTab: "create" },toastId:"submit"
          });
          window.location.reload()
        }
      });
      // fetchAndUpdateStatus(employeeId, startDate, endDate);
    } catch (error) {
      toast.error(`Submit failed: ${error.message}`,{
        toastId:"submit-err"
      });
      setScreenBlur(false)
    } finally {
      setIsSaving(false);
    }
  };


  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  const convertMinutesToHoursOnly=(minutesStr)=> {
  const minutes = parseInt(minutesStr, 10); // Convert string to number
  if (isNaN(minutes)) return 'Invalid input';

  const hours = Math.floor(minutes / 60);
  return `${hours}`;
}
  const handleReporteeSelect = async (selectedEmpId) => {
    setReload(!reload)
    setSelectedEmpId(selectedEmpId);
  };

  const handleRestrictWeek = (selectedWeekDates) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, ..., 6 = Saturday

    function getWeekNumber(date) {
      const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNr = (target.getUTCDay() + 6) % 7;
      target.setUTCDate(target.getUTCDate() - dayNr + 3);
      const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
      const diff = target - firstThursday;
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      return 1 + Math.floor(diff / oneWeekMs);
    }

    const currentWeek = getWeekNumber(today);
    const currentYear = today.getFullYear();

    const selectedDate = new Date(selectedWeekDates[0]);
    const selectedWeek = getWeekNumber(selectedDate);
    const selectedYear = selectedDate.getFullYear();

    setIsPrevWeekSubmitOnly(false); // always reset

    // ✅ Future week — allow all actions
    if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedWeek > currentWeek)
    ) {
      return false;
    }

    // Previous week
    if (selectedYear === currentYear && selectedWeek === currentWeek - 1) {
      if (dayOfWeek > 3) {
        setIsPrevWeekSubmitOnly(true); // Thu–Sun → Submit only
      }
      return false;
    }

    // Older than previous
    if (
      selectedYear < currentYear ||
      (selectedYear === currentYear && selectedWeek < currentWeek - 1)
    ) {
      setIsPrevWeekSubmitOnly(true); // Submit only
      return false;
    }

    // Current week
    return false;
  };




  const handleWithdraw = async () => {
    setScreenBlur(true)
    setIsSubmitted(false)
    try {
      const loggedInEmployeeId = localStorage.getItem("emp_id");
      const employeeId = selectedEmpId?.value || loggedInEmployeeId;
      if (!employeeId) {
        toast.error("Employee ID not found",{
          toastId:"emp-notfound"
        });
        return;
      }

      if (!weekDayList || weekDayList.length !== 7) {
        toast.error("Week days are not set correctly.",{
          toastId:"weekDays-notset"
        });
        return;
      }

      const startDate = formatDate(weekDayList[0]);
      const endDate = formatDate(weekDayList[6]);

      const formData = new FormData();
      formData.append("emp_id", employeeId);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/withdraw_timesheet`, {
        headers: {
          "Authorization": `${accessToken}`
        },
        method: "POST",
        body: formData,
      });

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:"withdraw-session"
        })
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to withdraw timesheet");
      }

      // Update state and local storage
      setActiveButton('withdraw');
      // setIsSubmitted(false);
      setFinalStatus("Saved");

      localStorage.setItem("final_status", "Saved");
      setStateDisable(false)
      if (response.ok) {
        localStorage.setItem('Saved_Data', JSON.stringify({
          start: startDate,
          end: endDate,
          selectedEmpId: isManager ? selectedEmpId : {
            value: employeeId,
            label: localStorage.getItem('emp_name')
          }
        }))
        navigate("/CreateTimesheet", {
          state: { activeTab: "create" }
        });
        window.location.reload()
      }
      
    } catch (error) {
      setScreenBlur(false)
      console.error("Withdraw error:", error);
      toast.error(`Withdrawal failed: ${error.message}`,{
        toastId:"withdraw-error"
      });
    }
  };





  useEffect(() => {
    const storedTab = localStorage.getItem("selectedTab");
    if (storedTab) {
      setActiveTab(storedTab);
      localStorage.removeItem("selectedTab");
    }
  }, []);

  const handleRevert = async () => {
    setRevertOpen(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_revert_approvers`, {
        method: "POST",
        headers: {
          "Authorization": `${accessToken}`
        },
      });

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: 'session'
        })
      }

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      const fetchedOptions = result?.approvers?.approvers?.map(emp => ({
        value: emp.manager_id,
        label: emp.manager_name
      })) || [];
      const fetchedRevertOptions = result?.approvers?.revert_reasons?.map(revert => ({
        value: revert.reason_id,
        label: revert.reason
      })) || [];
      setApproverOptions(fetchedOptions)
      setRevertActionOptions(fetchedRevertOptions)
    } catch (err) {
      console.log(err)
    }
  }

  const handleRevertChanges = (selectedId) => {
    setSelectedRevert(selectedId)
  }

  const handleApproverChanges = (selectedValue) => {
    setSelectedApprover(selectedValue)
  }
const formatDateForApi = (date) => {
  if (!date) return null;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-based
  const y = date.getFullYear();
  return `${y}-${m}-${d}`; // "2025-03-17"
};
  const handleRevertProcess = async () => {
    setConfirmRevert(false)
    console.log(dateOfRequest,'dateOfRequest');
    const date = formatDateForApi(dateOfRequest)
    console.log(date,'datedate');
    try {
      const selectedValues = selectedRevert?.map(item => item.value);
      if (!owner.trim() || !revertMessage.trim() || revertSelected.length === 0 ||
        !date.trim() || selectedApprover.length === 0 || selectedValues.length === 0) {
        toast.error('Please fill in all required fields.',{
          toastId:"fill-required-fields"
        })
        setConfirmRevert(true)
        return;
      }
      let payload = {
        approver: String(selectedApprover?.value),
        date_of_request: dateOfRequest,
        owner: owner,
        reason: revertMessage,
        action: selectedValues,
        ids: revertSelected
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/revert_timesheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${accessToken}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: 'session'
        })
      }

      if (response.status === 200) {
        toast.success("Timesheet reverted successfully", {
          onClose: () => window.location.reload(),
          toastId:"rever-success"
        });
      } else {
        toast.error("Error in revert",{
          toastId:"revert-error"
        })
      }
      setConfirmRevert(true)
    } catch (err) {
      console.log(err,"err");
      setConfirmRevert(true)
      toast.error("Error in Timesheet revert",{
        toastId:"revert-timesheeterrror"
      })
      console.log("error", err)
    }

  }

  const handleCancelRevert = () => {
    setRevertOpen(false);
    setSelectedApprover(null);
    setDateOfRequest('');
    setOwner('');
    setRevertMessage('');
  }

  const handleApproval = () => {
    setActiveTab("Approvals");
    localStorage.setItem("show_approval", false);
    setApprovalCountOpen(false);

    // Show not-submitted only after approval closed
    if (queuedNotSubmit&&notSubmittedCount>0) {
      setNotSubmittedBox(true);
      setQueuedNotSubmit(false);
      localStorage.setItem("show_not_submit", false);
    }
  };

  const cancelApproval = () => {
    setApprovalCountOpen(false);
    localStorage.setItem("show_approval", false);

    if (queuedNotSubmit&&notSubmittedCount>0) {
      setNotSubmittedBox(true);
      setQueuedNotSubmit(false);
      localStorage.setItem("show_not_submit", false);
    }
  };
  const cancelNotSubmit = () => {
    setNotSubmittedBox(false);
    localStorage.setItem('show_not_submit', false)
  }

  const handleEnableSubmit = async () => {

    try {
      const startDate = formatDate(weekDayList[0]);
      const endDate = formatDate(weekDayList[6]);
      let formatData = new FormData()

      formatData.append('emp_id', selectedEmpId?.value)
      formatData.append('week_start_date', startDate)
      formatData.append('week_end_date', endDate)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/edit_enabled`, {
        method: "POST",
        headers: {
          "Authorization": `${accessToken}`
        },
        body: formatData,
      });

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: 'session'
        })
      }

      if (response.status === 200) {
        toast.success("Timesheet Enabled for the week successfully",{
          toastId:"enable-success",
          onClose: () => window.location.reload(),
        });
      } else {
        toast.error("Error in revert",{
          toastId:"error-handleEnable"
        })
      }
    } catch (err) {
      toast.success("Error in Timesheet revert",{
        toastId:"revert-timesheetenable"
      })
      console.log("error", err)
    }
  }

  return (
    <>

      <Header />
      <div className="top-title">Timesheet</div>
      <div className={`over-all-bg ${screenBlur ? 'blurred' : ""}`} >
        {screenBlur && (
          <div className="screen-spinner">
            <div className="spinner" />
          </div>
        )}
        <div className="Timesheet">
          <div className="top-header">
            {isMobile ? (
              <div className="hamburger-line" ref={menuRef}>
                <div className="hamburger-icon" onClick={() => setIsMenuOpen(prev => !prev)}>
                  ☰
                </div>

                {isManager && activeTab !== "reports" && activeTab !== "history" && activeTab !== "Approvals" && activeTab !== "LeaveUpload" &&(
                  <div className="manager-select">
                    <Select
                      value={selectedEmpId}
                      onChange={handleReporteeSelect}
                      options={options}
                      styles={selectCustomStyles}
                      closeMenuOnSelect={true}
                      hideSelectedOptions={false}
                      placeholder="Select"
                      name="manager-select"
                      inputId="manager-select"
                      components={{ DropdownIndicator }}
                    />
                  </div>
                )}

                {isMenuOpen && (
                  <div className="dropdown-menu">
                     
                    <div
                      className={`tab ${activeTab === "create" ? "active" : ""}`}
                      onClick={() => { setActiveTab("create"); setIsMenuOpen(false); }}
                    >
                      <div className="icon-box">
                    <svg width="22" height="22" className={`icon ${activeTab === "create" ? "active-icon" : ""}`} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.7631 2.2881C19.7003 2.21911 19.6242 2.16356 19.5393 2.12482C19.4545 2.08608 19.3626 2.06495 19.2694 2.0627C19.1761 2.06045 19.0834 2.07713 18.9967 2.11174C18.9101 2.14634 18.8314 2.19815 18.7654 2.26404L18.2338 2.79298C18.1694 2.85744 18.1332 2.94484 18.1332 3.03597C18.1332 3.1271 18.1694 3.2145 18.2338 3.27896L18.7211 3.76536C18.753 3.79745 18.791 3.82292 18.8328 3.84029C18.8746 3.85767 18.9195 3.86661 18.9647 3.86661C19.01 3.86661 19.0548 3.85767 19.0967 3.84029C19.1385 3.82292 19.1764 3.79745 19.2084 3.76536L19.7266 3.24974C19.9887 2.98806 20.0132 2.56181 19.7631 2.2881ZM17.1592 3.8672L9.40247 11.6102C9.35545 11.657 9.32126 11.7152 9.30322 11.779L8.94443 12.8477C8.93583 12.8767 8.93522 12.9074 8.94267 12.9368C8.95011 12.9661 8.96532 12.9928 8.98671 13.0142C9.00809 13.0356 9.03485 13.0508 9.06417 13.0583C9.09348 13.0657 9.12426 13.0651 9.15326 13.0565L10.221 12.6977C10.2849 12.6797 10.3431 12.6455 10.3899 12.5985L18.1329 4.84087C18.2045 4.76847 18.2447 4.67073 18.2447 4.56888C18.2447 4.46703 18.2045 4.36929 18.1329 4.29689L17.7053 3.8672C17.6328 3.79491 17.5346 3.75432 17.4323 3.75432C17.3299 3.75432 17.2317 3.79491 17.1592 3.8672Z" fill="currentColor"></path>
                      <path d="M16.6005 8.32133L11.3631 13.5691C11.1606 13.772 10.9119 13.9226 10.6382 14.0078L9.52531 14.3804C9.2612 14.4549 8.98197 14.4578 8.7164 14.3885C8.45084 14.3193 8.20854 14.1804 8.01448 13.9864C7.82042 13.7923 7.68161 13.55 7.61236 13.2845C7.54311 13.0189 7.54592 12.7397 7.62051 12.4755L7.99305 11.3627C8.07805 11.0891 8.22832 10.8403 8.4309 10.6378L13.6787 5.39945C13.7268 5.3514 13.7595 5.29017 13.7728 5.22349C13.7861 5.15682 13.7794 5.08769 13.7534 5.02486C13.7274 4.96204 13.6834 4.90833 13.6269 4.87053C13.5703 4.83272 13.5039 4.81253 13.4359 4.8125H4.46875C3.83057 4.8125 3.21853 5.06602 2.76727 5.51727C2.31602 5.96853 2.0625 6.58057 2.0625 7.21875V17.5312C2.0625 18.1694 2.31602 18.7815 2.76727 19.2327C3.21853 19.684 3.83057 19.9375 4.46875 19.9375H14.7812C15.4194 19.9375 16.0315 19.684 16.4827 19.2327C16.934 18.7815 17.1875 18.1694 17.1875 17.5312V8.5641C17.1875 8.49611 17.1673 8.42966 17.1295 8.37314C17.0917 8.31663 17.038 8.2726 16.9751 8.24661C16.9123 8.22062 16.8432 8.21385 16.7765 8.22715C16.7098 8.24045 16.6486 8.27323 16.6005 8.32133Z" fill="currentColor"></path></svg>
                    {/* <CreateIcon className= /> */}
                  </div>
                      Create Timesheet
                    </div>

                    {Manager() && (
                      
                      <div
                        className={`tab ${activeTab === "Approvals" ? "active" : ""}`}
                        onClick={() => { setActiveTab("Approvals"); setIsMenuOpen(false); }}
                      >
                         <div className="icon-box">

                      <AddTaskOutlinedIcon  className={`icon ${activeTab === "Approvals" ? "active-icon" : ""}`} />
                    </div>
                        Approvals
                      </div>
                    )}

                    <div
                      className={`tab ${activeTab === "reports" ? "active" : ""}`}
                      onClick={() => { setActiveTab("reports"); setIsMenuOpen(false); }}
                    >
                       <div className="icon-box">
                    <AssignmentOutlinedIcon className={`icon ${activeTab === "reports" ? "active-icon" : ""}`} />
                  </div>
                      Reports
                    </div>
                        {leaveUploadManager() && (
                  <div

                    className={`tab ${activeTab === "LeaveUpload" ? "active" : ""}`}
                    onClick={() => setActiveTab("LeaveUpload")}
                  >
                    <div className="icon-box">
                      <CalendarMonthOutlinedIcon className={`icon ${activeTab === "LeaveUpload" ? "active-icon" : ""}`} />
                    </div>
                    <span className="tab-text">Calendar</span>
                  </div>)}
                   {user_role === 'Admin' && (
                <div
                  className={`tab ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <div className="icon-box">
                    <SettingsOutlinedIcon className={`icon ${activeTab === "settings" ? "active-icon" : ""}`} />
                  </div>
                  <span className="tab-text">Settings</span>
                </div>
              )}

                  </div>
                )}
              </div>
            ) : (
              <div className="tabs">
                <div
                  className={`tab ${activeTab === "create" ? "active" : ""}`}
                  onClick={() => setActiveTab("create")}
                >
                  <div className="icon-box">
                    <svg width="22" height="22" className={`icon ${activeTab === "create" ? "active-icon" : ""}`} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.7631 2.2881C19.7003 2.21911 19.6242 2.16356 19.5393 2.12482C19.4545 2.08608 19.3626 2.06495 19.2694 2.0627C19.1761 2.06045 19.0834 2.07713 18.9967 2.11174C18.9101 2.14634 18.8314 2.19815 18.7654 2.26404L18.2338 2.79298C18.1694 2.85744 18.1332 2.94484 18.1332 3.03597C18.1332 3.1271 18.1694 3.2145 18.2338 3.27896L18.7211 3.76536C18.753 3.79745 18.791 3.82292 18.8328 3.84029C18.8746 3.85767 18.9195 3.86661 18.9647 3.86661C19.01 3.86661 19.0548 3.85767 19.0967 3.84029C19.1385 3.82292 19.1764 3.79745 19.2084 3.76536L19.7266 3.24974C19.9887 2.98806 20.0132 2.56181 19.7631 2.2881ZM17.1592 3.8672L9.40247 11.6102C9.35545 11.657 9.32126 11.7152 9.30322 11.779L8.94443 12.8477C8.93583 12.8767 8.93522 12.9074 8.94267 12.9368C8.95011 12.9661 8.96532 12.9928 8.98671 13.0142C9.00809 13.0356 9.03485 13.0508 9.06417 13.0583C9.09348 13.0657 9.12426 13.0651 9.15326 13.0565L10.221 12.6977C10.2849 12.6797 10.3431 12.6455 10.3899 12.5985L18.1329 4.84087C18.2045 4.76847 18.2447 4.67073 18.2447 4.56888C18.2447 4.46703 18.2045 4.36929 18.1329 4.29689L17.7053 3.8672C17.6328 3.79491 17.5346 3.75432 17.4323 3.75432C17.3299 3.75432 17.2317 3.79491 17.1592 3.8672Z" fill="currentColor"></path>
                      <path d="M16.6005 8.32133L11.3631 13.5691C11.1606 13.772 10.9119 13.9226 10.6382 14.0078L9.52531 14.3804C9.2612 14.4549 8.98197 14.4578 8.7164 14.3885C8.45084 14.3193 8.20854 14.1804 8.01448 13.9864C7.82042 13.7923 7.68161 13.55 7.61236 13.2845C7.54311 13.0189 7.54592 12.7397 7.62051 12.4755L7.99305 11.3627C8.07805 11.0891 8.22832 10.8403 8.4309 10.6378L13.6787 5.39945C13.7268 5.3514 13.7595 5.29017 13.7728 5.22349C13.7861 5.15682 13.7794 5.08769 13.7534 5.02486C13.7274 4.96204 13.6834 4.90833 13.6269 4.87053C13.5703 4.83272 13.5039 4.81253 13.4359 4.8125H4.46875C3.83057 4.8125 3.21853 5.06602 2.76727 5.51727C2.31602 5.96853 2.0625 6.58057 2.0625 7.21875V17.5312C2.0625 18.1694 2.31602 18.7815 2.76727 19.2327C3.21853 19.684 3.83057 19.9375 4.46875 19.9375H14.7812C15.4194 19.9375 16.0315 19.684 16.4827 19.2327C16.934 18.7815 17.1875 18.1694 17.1875 17.5312V8.5641C17.1875 8.49611 17.1673 8.42966 17.1295 8.37314C17.0917 8.31663 17.038 8.2726 16.9751 8.24661C16.9123 8.22062 16.8432 8.21385 16.7765 8.22715C16.7098 8.24045 16.6486 8.27323 16.6005 8.32133Z" fill="currentColor"></path></svg>
                    {/* <CreateIcon className= /> */}
                  </div>
                  <span className="tab-text">Create Timesheet</span>
                </div>


                {Manager() && (
                  <div

                    className={`tab ${activeTab === "Approvals" ? "active" : ""}`}
                    onClick={() => setActiveTab("Approvals")}
                  >
                    <div className="icon-box">

                      <AddTaskOutlinedIcon  className={`icon ${activeTab === "Approvals" ? "active-icon" : ""}`} />
                    </div>
                    <span className="tab-text">Approvals</span>
                    <span className="count-badge">{approvalCount}</span>
                  </div>)}
                <div
                  className={`tab ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => setActiveTab("reports")}
                >
                  <div className="icon-box">
                    <AssignmentOutlinedIcon className={`icon ${activeTab === "reports" ? "active-icon" : ""}`} />
                  </div>
                  <span className="tab-text">Reports</span>
                </div>
                {leaveUploadManager() && (
                  <div

                    className={`tab ${activeTab === "LeaveUpload" ? "active" : ""}`}
                    onClick={() => setActiveTab("LeaveUpload")}
                  >
                    <div className="icon-box">
                      <CalendarMonthOutlinedIcon className={`icon ${activeTab === "LeaveUpload" ? "active-icon" : ""}`} />
                    </div>
                    <span className="tab-text">Calendar</span>
                  </div>)}
                {/* <div
                              className={`tab ${activeTab === "Summary" ? "active" : ""}`}
                              onClick={() => setActiveTab("Summary")}
                            >
                              <div className="icon-box">
                                <CalendarMonthIcon fontSize="small" className={`icon ${activeTab === "Summary" ? "active-icon" : ""}`} />
                              </div>
                              <span className="tab-text">Summary</span>
                            </div> */}

                {/* dont remove this  */}

                {/* {Manager() && (
                <div
                  className={`tab ${activeTab === "report" ? "active" : ""}`}
                  onClick={() => setActiveTab("report")}
                >
                  <div className="icon-box">
                    <AssessmentOutlinedIcon className={`icon ${activeTab === "report" ? "active-icon" : ""}`} />
                  </div>
                  <span className="tab-text">Reports</span>
                </div>
              )} */}

              {user_role === 'Admin' && (
                <div
                  className={`tab ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <div className="icon-box">
                    <SettingsOutlinedIcon className={`icon ${activeTab === "settings" ? "active-icon" : ""}`} />
                  </div>
                  <span className="tab-text">Settings</span>
                </div>
              )}

                {isManager && activeTab === "create"  &&(
                  // <div className="manager-select">
                  //   <select
                  //     className="mselect"
                  //     defaultValue=""
                  //     onChange={(e) => handleReporteeSelect(e.target.value)}
                  //   >

                  //     <option value="" >
                  //       {localStorage.getItem("emp_name") || "Select Reportee"}
                  //     </option>

                  //     {/* Show reportee list */}
                  //     {reportees.map((rep) => (
                  //       <option key={rep.employee_id} value={rep.employee_id}>
                  //         {rep.employee_name}
                  //       </option>
                  //     ))}
                  //   </select>
                  // </div>
                  <div className="manager-select">
                    <Select
                      value={selectedEmpId}
                      onChange={handleReporteeSelect}
                      options={options}
                      styles={selectCustomStyles}
                      closeMenuOnSelect={true}
                      hideSelectedOptions={false}
                      placeholder="Select"
                      name='manager-select'
                      inputId='manager-select'
                      components={{ DropdownIndicator }}
                    />
                  </div>
                )}

              </div>)}
          </div>

          {activeTab === 'create' && (
            <>
              <div className="sub-tab-tabs">
                {
                  <>
                    <div
                      className={`sub-tab filled-tab ${activeSubTab === "currentWeek" ? "active-tab" : ""}`}
                      onClick={() => setActiveSubTab("currentWeek")}
                    >
                      {getWeekLabel(weekDayList)}
                    </div>
                    {/* <div
                      className={`sub-tab filled-tab ${activeSubTab === "notSubmitted" ? "active-tab" : ""}`}
                      onClick={() => setActiveSubTab("notSubmitted")}
                    >
                      Not Submitted -
                      <span
                        className={`number ${activeSubTab === "notSubmitted" ? "number-active" : ""
                          }`}
                      >
                        {notSubmittedCount}
                      </span>
                    </div> */}
                  </>
                }

                <div className={`draft ${status === "Rejected" ? "rejected" : ""}`}>
                  <span>{status}</span>
                </div>
              </div>
              {
                showPMO && (
                  <div>
                    <p style={{ display: 'flex', justifyContent: 'flex-end', margin: '0px 15px', fontSize: 'small', color: '#808080' }}>(Reverted by PMO/Time Keeper)</p>
                  </div>
                )
              }
              {
                showPartiallyApproved && (
                  <div>
                    <p style={{ display: 'flex', justifyContent: 'flex-end', margin: '0px 15px', fontSize: 'small', color: '#808080' }}> (Check For Submission/Rejection)</p>
                  </div>
                )
              }
              {(activeSubTab === "currentWeek" || activeSubTab === "notSubmitted") && (
                <TableofCreateTImeSheet
                  weekDayList={weekDayList}
                  start_date={startOfWeek}
                  handleSubmit={handleSubmit}
                  finalStatus={finalStatus}
                  isTableDisabled={isTableDisabled}
                  projectRows={projectRows}
                  setProjectRows={setProjectRows}
                  projectsData={projectsData}
                  setWeekDayList={setWeekDayList}
                  setProjectsData={setProjectsData}
                  selectedEmpId={selectedEmpId}
                  stateDisable={stateDisable}
                  setStateDisable={setStateDisable}
                  setARMessage={setARMessage}
                  activeSubTab={activeSubTab}
                  setFinalStatus={setFinalStatus}
                  setrevertSelected={setrevertSelected}
                  revertSelected={revertSelected}
                  setRevertDate={setRevertDate}
                  setEnableWeekShow={setEnableWeekShow}
                  setEnableWeek={setEnableWeek}
                  // setTotalWeekMinutes={setTotalWeekMinutes}
                  isApprovalMode={false}
                  setShowPMO={setShowPMO}
                  setNotSubmittedCount={setNotSubmittedCount}
                  notSubmittedCount={notSubmittedCount}
                  setNotSubmittedLocked={setNotSubmittedLocked}
                  notSubmittedLocked={notSubmittedLocked}
                  showPartiallyApproved={showPartiallyApproved}
                  setShowPartiallyApproved={setShowPartiallyApproved}
                  setSelectedEmpId={setSelectedEmpId}
                  isSubmitted={isSubmitted}
                  setIsSubmitted={setIsSubmitted}
                  setSubmitOnly={setSubmitOnly}
                  reload={reload}
                />
              )}
              <div className="summary-container">
                {finalStatus === 'Approved' || finalStatus === 'Rejected' || finalStatus === 'Partially Approved' ? (
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

              <div className="action-buttons">
                {(!restrictButton || (enableWeek && enableWeekShow)) && (
                  <>
                    {/* Withdraw only if not in submit-only mode */}
                    {(isSubmitted ||
                      (status === "Submitted" &&
                        !isPrevWeekSubmitOnly &&
                        ((isManager && selectedEmpId?.value === loggedInEmployeeId) || !isManager))
                    ) && (
                        <button className="withdraw-btn" onClick={handleWithdraw}>
                          Withdraw
                        </button>
                      )}
                      
                    {/* Submit-only mode */}
                    {(submitOnly || enableWeekShow)  &&(
                      <button className="submit-btn" onClick={handleSubmit}>
                        Submit
                      </button>
                    )}

                    {/* Editable mode (current week, future week, or prev week on Mon–Wed) */}
                    {!isSubmitted &&
                      !isPrevWeekSubmitOnly && !submitOnly &&
                      ["Saved", "Rejected", "Draft", "Partially Approved"].includes(status) && (
                        <>
                          <button className="cancel-btn" onClick={handleSave}>Save</button>
                          <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                        </>
                      )}

                   
                    {/* Time Keeper Revert */}
                    {user_role === "Time Keeper" && status === "Approved" && (
                      <button
                        className={`submit-btn ${revertSelected?.length <= 0 ? "disabled" : ""}`}
                        onClick={handleRevert}
                        disabled={revertSelected?.length <= 0}
                      >
                        Revert
                      </button>
                    )}
                  </>
                )}


              </div>
              {
                (user_role === "Time Keeper" && isPrevWeekSubmitOnly ) && (
                  <div className="enable_button">
                    <div className="check_box_enable">
                      <input disabled={enableWeekShow} type="checkbox" checked={enableWeek} onChange={() => setEnableWeek(!enableWeek)} />
                      <label>Enable Week Entry</label>
                    </div>
                    <button className={`submit-btn ${(!enableWeek || enableWeekShow) ? 'disabled' : ''}`} onClick={() =>{
                     if(enableWeek && !enableWeekShow){
                          handleEnableSubmit()
                      }
                     }}>Submit</button>
                  </div>
                )}
            </>
          )}

          <Dialog open={revertOpen}
            // onClose={() => setDeleteConfirmOpen(false)} 
            PaperProps={{
              style: {
                width: '600px',
                maxWidth: 'unset',
              }
            }}>
            <DialogTitle style={{ padding: '0' }} className="">
              <div className="d-flex bg-light-blue">
                <DialogTitle className="custom-dialog-title">Revert</DialogTitle>
              </div>
            </DialogTitle>
            <DialogContent className="pad-all-10" >
              <div >
                <p style={{ textAlign: 'center' }}>These timeentry dates are already sent to Netsuite ({revertDate.join(', ')})</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                  <strong>Action taken prior to Revert</strong>
                  <Select
                    value={selectedRevert}
                    onChange={handleRevertChanges}
                    options={revertActionOptions}
                    styles={selectCustomStylesRevert}
                    closeMenuOnSelect={true}
                    hideSelectedOptions={false}
                    placeholder="Select"
                    name='revert-action-select'
                    inputId='revert-action-select'
                    components={{ DropdownIndicator }}
                    isMulti
                  />
                </div>
                <p style={{ fontSize: 'smaller', color: '#5e5c5c', textAlign: 'center' }}>(If none of the above action suits then contact Tools Admin or PMO for reversal)</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <input type="checkbox" checked={confirmRevert} onChange={() => setConfirmRevert(!confirmRevert)} />
                  <p style={{ color: '#d13a3ade', margin: '0px' }}>I confirm the above selected action</p>
                </div>


                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <textarea
                    ref={textareaRef}
                    value={revertMessage}
                    onChange={(e) => {
                      setRevertMessage(e.target.value)
                    }}
                    disabled={!confirmRevert}
                    rows={3}
                    className={`revert-textarea ${!confirmRevert ? 'disabled' : ''}`}
                    placeholder="Please provide the valid reason for Revert"
                  />
                </div>
                <div style={{ display: 'flex', gap: '2rem', padding: '10px 0px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bolder' }}>Owner</label>
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="date-input"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bolder' }}>Date of Request</label>
                    {/* <input
                      type="date"
                      value={dateOfRequest}
                      onChange={(e) => setDateOfRequest(e.target.value)}
                      className="date-input"
                      placeholder=""
                    /> */}
                    <div>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <DatePicker
                          ref={endDateRef}
                          selected={dateOfRequest}
                          onChange={(date) => setDateOfRequest(date)}
                          dateFormat="dd-MMM-yyyy"
                          minDate={new Date(new Date().getFullYear(), 0, 1)}
                          maxDate={new Date(new Date().getFullYear(), 11, 31)}
                          placeholderText="dd-mm-yyyy"
                          className="date-input"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"

                        />
                        <CalendarMonthOutlinedIcon
                          onClick={() => endDateRef.current.setFocus()}

                          style={{
                            position: "absolute",
                            right: 10,
                            top: "55%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "black",
                            fontSize: "18px"
                          }}
                        />
                      </div>

                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bolder' }}>Approver</label>
                    <Select
                      value={selectedApprover}
                      style={{ fontWeight: 'bolder' }}
                      onChange={handleApproverChanges}
                      options={approverOptions}
                      styles={selectCustomStyles}
                      closeMenuOnSelect={true}
                      hideSelectedOptions={false}
                      placeholder="Select"
                      name="manager-select"
                      inputId="manager-select"
                      components={{ DropdownIndicator }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px', gap: '1rem' }}>
                  <button onClick={() => handleRevertProcess()} disabled={!confirmRevert} className={`date-filter-btn ${!confirmRevert ? 'disabled' : ''}`}>
                    Process
                  </button> <button onClick={() => handleCancelRevert()} className="date-filter-btn">
                    Cancel
                  </button>
                </div>

              </div>
            </DialogContent>
          </Dialog>

          {/* {activeTab === 'report' && (
            <>
              <Reports />
            </>
          )} */}

          {activeTab === 'settings' && (
            <>
              <Settings />
            </>
          )}

          {activeTab === 'Approvals' && (
            <>




              <ApprovalList count={count} setCount={setCount}/>

            </>
          )}

          {activeTab === 'Summary' && (
            <>
              {/* <SummaryTable/> */}
            </>
          )}

          {activeTab === 'LeaveUpload' && (
            <>
              <LeaveUpload />
            </>
          )}



          {activeTab === "reports" && (
            <HistoryTab
              accessToken={accessToken}
              finalStatus={finalStatus}
              setFinalStatus={setFinalStatus}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          )}

        </div>
      </div>
      {Manager() && approvalCount > 0 && (
        <Dialog open={approvalCountOpen} onClose={() => setApprovalCountOpen(false)} PaperProps={{
          style: {
            width: '400px',
            maxWidth: 'unset',
          }
        }}>
          <DialogTitle style={{ padding: '0' }} className="">
            <div className="d-flex bg-light-blue">
              <DialogTitle className="custom-dialog-title">Dear Approver,</DialogTitle>
            </div>
          </DialogTitle>
          <DialogContent className="pad-all-10">
            <div className="">
              <div style={{ padding: '5px' }}>{approvalCount} approval(s) is/are pending on you to approve.</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px', gap: '1rem' }}>
                <button onClick={() => handleApproval()} className={`date-filter-btn `}>
                  Approvals
                </button> <button onClick={() => cancelApproval()} className="date-filter-btn">
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      )
      }
      {notSubmittedBox && (
        <Dialog
          open={notSubmittedBox}
          onClose={cancelNotSubmit}
          PaperProps={{ style: { width: '400px', maxWidth: 'unset' } }}

        >
          <DialogTitle style={{ padding: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#e3f2fd', // Light blue
                padding: '12px 16px',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
              }}
            >
              <WarningAmberIcon style={{ color: '#f57c00', marginRight: '8px' }} />
              <span className="custom-dialog-title">Reminder</span>
            </div>
          </DialogTitle>

          <DialogContent className="pad-all-10">
            {notSubmittedLocked ? (
              <div style={{ padding: '5px' }}>
                Your previous week's timesheet has been <b>locked</b>.<br />
                Please contact <b>Time Keeper</b> to unlock the timesheet.
              </div>
            ) : (
              <div style={{ padding: '5px' }}>
                Please submit the previous week's timesheet.<br />
                You will not be able to submit the current week's timesheet.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', gap: '1rem' }}>
              <button
                className="date-filter-btn"
                onClick={() => cancelNotSubmit()}
              >
                OK
              </button>
            </div>
          </DialogContent>

        </Dialog>
      )}
    </>
  );
}

export default CreateTimesheet; 