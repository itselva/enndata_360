import React, { useState, useEffect,useRef } from 'react';
import "../Styles/history.css";
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import FilterListIcon from "@mui/icons-material/FilterList";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaginationComponent from "./PaginationComponent";
import { ToastContainer, toast } from 'react-toastify';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import Select from 'react-select';
import { selectCustomStylesFilter } from "../Components/selectCustomStyles";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { components } from 'react-select';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const HistoryTab = ({ accessToken }) => {
  const navigate = useNavigate();

  // ------------------- State Variables -------------------
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);
  // const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  // const [finalStatus, setFinalStatus] = useState("");
  // const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [empStatus, setEmpStatus] = useState([
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Active',
      value: 'active',
    },
    {
      label: 'In-Active',
      value: 'inactive',
    },
  ]);
  const [projectOptions, setProjectOptions] = useState([]);
  const user_role=localStorage.getItem('user_role');
  const exports=localStorage.getItem('export');
  const localEmpId = localStorage.getItem('emp_id');
  const localEmpName = localStorage.getItem('emp_name');
  const [screenBlur, setScreenBlur] = useState(false);
  const [status, setStatus] = useState([
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Submitted',
      value: 'submitted',
    },
    {
      label: 'Approved',
      value: 'approved',
    },
    {
      label: 'Rejected',
      value: 'rejected',
    },
    {
      label: 'Partially approved',
      value: 'partially approved',
    },
  ])
  const [finalStatus, setFinalStatus] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return filters?.finalStatus || "";
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return filters?.currentPage || 1;
  });

  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return filters?.rowsPerPage || 10; // or whatever your default is
  });
   const start1Ref = useRef(null);
  const end2Ref = useRef(null);

  const [selectedEmpId, setSelectedEmpId] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return typeof filters?.emp_data === "object" ? filters.emp_data : null;
  });

  const [selectedStatus, setSelectedStatus] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    if (filters?.finalStatus) {
      return {
        label: filters.finalStatus.charAt(0).toUpperCase() + filters.finalStatus.slice(1),
        value: filters.finalStatus
      };
    }
    return {
      label: 'All',
      value: 'all'
    };
  });
  // const [selectedClient, setSelectedClient] = useState(null);


  const [selectedClient, setSelectedClient] = useState(() => {
   const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return typeof filters?.project_data === "object" ? filters.project_data : {
      label: 'All',
      value: 'all'
    };
  });
  const [selectedProject, setSelectedProject] = useState(() => {
   const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return typeof filters?.project_data === "object" ? filters.project_data : {
      label: 'All',
      value: 'all'
    };
  });
  const [startDate, setStartDate] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    if (filters?.startDate) return filters.startDate;

    const today = new Date();
    return new Date(today.setDate(today.getDate() - 180)).toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    if (filters?.endDate) return filters.endDate;

    return new Date().toISOString().split("T")[0];
  });

  const [selectedEmpStatus, setSelectedEmpStatus] = useState(() => {
    const filters = JSON.parse(localStorage.getItem("historyFilters"));
    return typeof filters?.employee_status === "object" ? filters.employee_status : {
      label:'All',
      value:'all'
    };
  });

  const [enableDownload,setEnableDownload]=useState(false);
  const [enableExport,setEnableExport]=useState(()=>{
     return selectedProject.value === 'all' ? true : false;
  });

  let Manager = localStorage.getItem("isManager") === "true";
  // ------------------- useEffect: Load filters and fetch data -------------------

  useEffect(() => {
    if (Manager) {
      fetchDropDown("all")
    }
   
  }, []);

  useEffect(()=>{
     fetchHistoryData()
  },[rowsPerPage,currentPage])


  // useEffect(()=>{
  //   fetchProject()
  // },[selectedEmpId])
  useEffect(() => {
    fetchClient();
    fetchProject("all");
  }, []);

  const fetchClient = async () => {
  setScreenBlur(true);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/client_list`,
      {
        method: "POST",
        headers: {
          Authorization: `${accessToken}`,
        },
      }
    );
 
    // refresh token check
    if (response.headers.get("Refresh-Token")) {
      localStorage.setItem(
        "access_token",
        response.headers.get("Refresh-Token")
      );
    }
 
    if (response.status === 401) {
      toast.error("Session expired", {
        onClose: () => window.location.reload(),
        toastId: "session",
      });
      return;
    }
 
    const result = await response.json();
 
    if (Array.isArray(result)) {
      // map correctly: id = value, name = label
      const fetchedOptions = result.map((cli) => ({
        value: cli.client_id,
        label: cli.client_name,
      }));
 
      const optionsWithAll = [
        { value: "all", label: "All" },
        ...fetchedOptions,
      ];
 
      setClients(optionsWithAll);   // ✅ update correct state
    } else {
      toast.error(result.message || "Failed to fetch clients");
    }
 
    if (response.status === 200) {
      setScreenBlur(false);
    }
  } catch (err) {
    console.error("Error fetching clients:", err);
    setScreenBlur(false);
  }
};
  const fetchDropDown = async (projectId) => {
//  if (!projectId || projectId === "all") {
//     setProjects([]); // nothing selected, keep empty
//     return;
//   }
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_reportees_by_project`, {
        method: "POST",
        headers: {
          "Authorization": `${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: projectId }),
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

      // Map API result to options format
      const fetchedOptions = result?.reportees?.reportees?.map(emp => ({
        value: emp.employee_id,
        label: emp.employee_name
      })) || [];

      // Get local employee data from localStorage


      let combinedOptions = [
        { value: 'all', label: 'All' },
        ...fetchedOptions
      ];

      if (selectedEmpId) {
        const isAlreadyIncluded = combinedOptions.some(opt => opt.value === selectedEmpId.value);
        if (!isAlreadyIncluded) {
          combinedOptions.unshift(selectedEmpId); // or push(selectedEmpId) if you prefer at the end
        }
      } else if (localEmpId && localEmpName) {
        const localOption = {
          value: localEmpId,
          label: localEmpName
        };
        setSelectedEmpId(localOption); // Set the fallback option
      }
      const localOption = {
          value: localEmpId,
          label: localEmpName
        };

        const isAlreadyIncluded = combinedOptions.some(opt => opt.value === localEmpId);
        if (!isAlreadyIncluded) {
          combinedOptions.unshift(localOption); // Add to the beginning
        }


      setOptions(combinedOptions);
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
        })
      }
    } catch (err) {
      console.log(err);
    }
  }


const formatDateForApi = (date) => {
  if (!date) return null;

  // Case 1: Already in yyyy-mm-dd format
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Case 2: JS Date object or parseable date string
  const d = new Date(date);
  if (isNaN(d)) return null; // invalid date

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

  // ------------------- API Call: Fetch History Data -------------------
  const fetchHistoryData = async () => {
    setScreenBlur(true)
    try {
      const empId = localStorage.getItem("emp_id");
      if (!empId) return;


      const formData = new FormData();
     formData.append("search_start_date", formatDateForApi(startDate));
formData.append("search_end_date", formatDateForApi(endDate));
      formData.append("page", currentPage);
      formData.append("project_code",selectedProject?.value|| 'all');
      formData.append("size", rowsPerPage);
      formData.append("status", selectedStatus?.value || "");
      formData.append("fetch_id", selectedEmpId ? selectedEmpId.value : empId);
      formData.append("employee_status", selectedEmpStatus ? selectedEmpStatus.value : 'all');

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/fetch_history_2`,
        {
          method: "POST",
          headers: {
            Authorization: `${accessToken}`,
          },
          body: formData,
        }
      );
      if (response.status === 401) {
        toast.error("Session expired", {
          onClose: () => window.location.reload(),
          toastId:'session'
        });
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch history");

      const result = await response.json();
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

      const transformedData = transformHistoryData(result.timeEntries.data);
      transformedData.length === 0 ? setEnableDownload(true) :  setEnableDownload(false)
      setHistoryData(transformedData);
 
      setFilteredHistory(transformedData);

      setTotalPages(result.timeEntries.total_pages || 1);
      setTotalRecords(result.timeEntries.total_records);
      localStorage.removeItem('historyFilters')
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
        })
      }
        if (response.status === 200) {
          setScreenBlur(false)
          }
    } catch (error) {
      setScreenBlur(false)
      console.error("Error fetching history:", error);
      toast.error("Failed to load history");
      setScreenBlur(false)
    }
  };




  const sendMail = async () => {
    setScreenBlur(true)
    try {
      const empId = localStorage.getItem("emp_id");
      if (!empId) return;

      const formData = new FormData();
        formData.append("search_start_date", formatDateForApi(startDate));
formData.append("search_end_date", formatDateForApi(endDate));
      formData.append("project_code", selectedProject?.value || 'all');
      formData.append("status", selectedStatus?.value || "");
      formData.append("fetch_id", selectedEmpId ? selectedEmpId.value : empId);
      formData.append("employee_status", selectedEmpStatus ? selectedEmpStatus.value : 'all');

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/${user_role === 'Employee'
          ? (exports === 'true'
            ? 'reports_download'
            : 'reports_export'
          )
          : 'reports_download'}`,
        {
          method: "POST",
          headers: {
            Authorization: `${accessToken}`,
          },
          body: formData,
        }
      );
      if(user_role ==='Employee'){
       const result = await response.json();
     
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:'session'
        })
      }
      if (response.status === 200) {
        toast.success('Mail sent successfully')
      } else {
        toast.error(`Error occured`)
      }
      }else{
        const blob=await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Timesheet_Report.xlsx'); 
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      setScreenBlur(false)
    } catch (error) {
      setScreenBlur(false)
      toast.error("Failed to load history");
      setScreenBlur(false)
    }
  };

  const handleExport=async()=> {
    setScreenBlur(true)
    try {
      const empId = localStorage.getItem("emp_id");
      if (!empId) return;

      let value=[]
      selectedEmpId ? value.push(selectedEmpId.value) : value.push(empId)
//       const formData = new FormData();
//         formData.append("search_start_date", formatDateForApi(startDate));
// formData.append("search_end_date", formatDateForApi(endDate));
//       formData.append("project_code", selectedProject?.value);
//       formData.append("select_emp", value);
      let bodyData={
        from_date:formatDateForApi(startDate),
        to_date: formatDateForApi(endDate),
        project_code: selectedProject?.value,
        select_emp:value
      }
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/download_timesheet/`,
        {
          method: "POST",
          headers: {
            Authorization: `${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId:'session'
        })
      }
  
      if (response.ok) {
        if (response.headers.get('Refresh-Token')) {
          localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Ennvee_exports.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();

      }
      setScreenBlur(false)
    } catch (error) {
      setScreenBlur(false)
      toast.error("Failed in Ennvee Exports");
    }
  };



  // ------------------- Utility: Transform raw entries to grouped format -------------------
  const transformHistoryData = (timeEntries) => {
    const weekMap = new Map();
    const today = new Date();
    const oneEightyDaysAgo = new Date();
    oneEightyDaysAgo.setDate(today.getDate() - 180);

    timeEntries?.forEach((entry) => {
      if (typeof entry !== "object" || entry === null) return;
      const { status_flag, week_start_date, week_end_date } = entry;
      if (!status_flag || !week_start_date || !week_end_date) return;
      const endDate = new Date(week_end_date);
      if (endDate < oneEightyDaysAgo) return;
      const status = status_flag.toLowerCase();
      if (status === "saved") return;

      const weekRange = formatWeekRange(week_start_date, week_end_date);
      if (!weekMap.has(weekRange)) {
        const emp_id = entry.emp_id || entry.employee_id || entry.user?.emp_id;
        const employee_name =
          entry.emp_name ||
          entry.employee_name ||
          entry.user?.emp_name ||
          "Unknown";


        weekMap.set(weekRange, {
          week: weekRange,
          status: capitalizeStatus(status),
          emp_id: emp_id,
          employee_name: employee_name,
          start_date: week_start_date,
          end_date: week_end_date,
          approver_remarks:
            entry.approver_or_rejected_remarks ||
            entry.approver_remarks ||
            "",
        });
      }
    });

    return Array.from(weekMap.values()).sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );
  };

  // ------------------- Utility: Format week range label -------------------
  const formatWeekRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const startStr = start
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, "-");
    const endStr = end
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, "-");
    return `${startStr} to ${endStr}`;
  };

  // ------------------- Utility: Capitalize status -------------------
  const capitalizeStatus = (status) => {
    if (!status || typeof status !== "string") return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // ------------------- Navigate to View or Create Timesheet -------------------
  const handleView = (row) => {
    const empId = row?.emp_id || localStorage.getItem("emp_id");
    if (!empId || !row?.start_date || !row?.end_date) {
      toast.error("Missing required data to view");
      return;
    }

    // Save current filters before navigating
    localStorage.setItem(
      "historyFilters",
      JSON.stringify({
        startDate,
        endDate,
        finalStatus: selectedStatus.value,
        currentPage,
        rowsPerPage,
        emp_data: selectedEmpId ? selectedEmpId : empId,
        project_data:selectedProject,
        employee_status:selectedEmpStatus
      })
    );

    const weekRange = formatWeekRange(row.start_date, row.end_date);
    // Navigate based on status
    if (
      row.status?.toLowerCase() === "rejected" ||
      row.status?.toLowerCase() === "partially approved" ||
      row.status?.toLowerCase() === "reverted"
    ) {
      localStorage.removeItem('historyFilters')
      const targetDate = new Date(row.start_date);
      targetDate.setDate(targetDate.getDate() + 3);
      navigate("/CreateTimesheet", {
        state: {
          selectedTab: "create",
          status: "Rejected",
          employeeData: {
            emp_id: empId ,
            emp_name: row.employee_name || "Unknown",
            week_range: weekRange,
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
            approver_remarks: row.approver_remarks || "",
            targetDate: targetDate.toISOString(),
          },
        },
      });
    } else {
      navigate("/ViewTimeSheet", {
        state: {
          selectedTab: "history",
          viewOnly: true,
          employeeData: {
            emp_id: empId ,
            emp_name: row.employee_name || "Unknown",
            week_range: weekRange,
            start_date: row.start_date.trim(),
            end_date: row.end_date.trim(),
            approver_remarks: row.approver_remarks || "",
          },
        },
      });
    }
  };

  const handleSelect = (selected) => {
    setSelectedClient(selected);
    setSelectedProject(null); // reset project selection
    setProjects([]); // clear old projects while fetching new

    fetchProject(selected.value);

  };
  const fetchProject = async (clientId) => {

  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/approval_fetch_project_id`,
      {
        method: "POST",
        body: JSON.stringify({ client_id: clientId }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
        },
      }
    );

    if (response.headers.get("Refresh-Token")) {
      localStorage.setItem("access_token", response.headers.get("Refresh-Token"));
    }

    if (response.status === 401) {
      toast.error("Session expired", {
        onClose: () => window.location.reload(),
        toastId: "session",
      });
      return;
    }

    const result = await response.json();

    if (Array.isArray(result)) {
      const fetchedOptions = result.map((proj) => ({
        value: proj.project_id,
        label: proj.project_name,
      }));

      const optionsWithAll = [
        { value: "all", label: "All" },
        ...fetchedOptions,
      ];

      setProjects(optionsWithAll);
    } else {
      toast.error(result.message || "Failed to fetch Projects");
      setProjects([]);
    }
  } catch (err) {
    console.error("Error fetching Projects:", err);
    setProjects([]);
  }
};
  // ------------------- Filter by Date Range -------------------
  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (startDate > endDate) {
      alert("Start Date must be less than End Date.");
      return;
    }
    if(selectedProject?.value ==='all'){
      setEnableExport(true)
    }else if(selectedProject?.value !=='all' ){
      setEnableExport(false)
    }

    setCurrentPage(1);
    fetchHistoryData()
    // fetchHistoryData(startDate, endDate, 1, rowsPerPage).finally(() =>
    //   setLoading(false)
    // );
  };

  // ------------------- Pagination: Page Change -------------------
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // fetchHistoryData(startDate, endDate, newPage, rowsPerPage);
  };

  // ------------------- Pagination: Rows Per Page Change -------------------
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1);
    // fetchHistoryData(startDate, endDate, 1, newSize);
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

  const handleReporteeSelect = async (selectedEmpId) => {
    setSelectedEmpId(selectedEmpId);
    // setSelectedProject({
    //   value:'all',
    //   label:'All'
    // })
  }

   const handleProjectSelect = async (selectedProject) => {
    setSelectedProject(selectedProject);
  }
  const handleStatusSelect = (selectedStatus) => {
    setSelectedStatus(selectedStatus)
  }

  const handleEMPStatus=(selectedStatus)=>{
        setSelectedEmpStatus(selectedStatus)
  }

  
  const handleSelectProject = (selected) => {
    setSelectedProject(selected);
    setSelectedEmpId(null)
    setOptions([]); // clear old projects while fetching new



    // setSelectedClient(selected);
    // setSelectedProject(null); // reset project selection

    fetchDropDown(selected.value);
    // if (selected && selected.value !== "all") {
    // }
  };

  // ------------------- UI Rendering -------------------
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

      <div className="history-container">
        {/* Header: Filters and Date Selectors */}
        <div className={screenBlur ? "blurred" : ""}>
          {screenBlur && (
            <div className="screen-spinner">
              <div className="spinner" />
            </div>
          )}

          <div className="filters-container">
            <div className="filter-block">
              <label className="date-label">
                Start Date:
                {/* <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={`${new Date().getFullYear()}-01-01`}
                  max={`${new Date().getFullYear()}-12-31`}
                  className="date-input"
                /> */}
          <div style={{ position: "relative", display: "inline-block"}}>
      <DatePicker
    ref={start1Ref}
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        dateFormat="dd-MMM-yyyy"  
        minDate={new Date(new Date().getFullYear(), 0, 1)}
        maxDate={new Date(new Date().getFullYear(), 11, 31)}
        placeholderText="dd-mm-yyyy"
        className="date-input"
               
        showMonthDropdown    
  showYearDropdown      
  dropdownMode="select"
      popperPlacement="bottom-start"
    modifiers={[
    {
    name: "offset",
    options: {
    offset: [15, 0],
    },
    },
    ]}
      />
      <CalendarMonthOutlinedIcon
         onClick={() => start1Ref.current.setFocus()}
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

              </label>
            </div>

            <div className="filter-block">
              <label className="date-label">
                End Date:
                {/* <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={`${new Date().getFullYear()}-01-01`}
                  max={`${new Date().getFullYear()}-12-31`}
                  className="date-input"
                /> */
                
                }

        
          <div style={{ position: "relative", display: "inline-block" }}>
      <DatePicker
      ref={end2Ref}
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        dateFormat="dd-MMM-yyyy"  
        minDate={new Date(new Date().getFullYear(), 0, 1)}
        maxDate={new Date(new Date().getFullYear(), 11, 31)}
        placeholderText="dd-mm-yyyy"
        className="date-input2"
        showMonthDropdown     
  showYearDropdown       

  dropdownMode="select"
      />
      <CalendarMonthOutlinedIcon
          onClick={() => end2Ref.current.setFocus()}
   
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

                
              </label>
            </div>
             <div className="filter-block">
              <label className="date-label">
                Client Name:
                <Select
                    value={selectedClient}
                      onChange={handleSelect}
                      options={clients}
                      styles={selectCustomStylesFilter}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder="Select"
                          name="Client-select"
                          inputId="Client-select"
                          components={{ DropdownIndicator }}
    
                />
              </label>
            </div>
            
            <div className="filter-block">
              <label className="date-label">
                Projects:
                <Select
                    value={selectedProject}
                          onChange={handleSelectProject}
                          options={projects}
                          styles={selectCustomStylesFilter}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder="Select"
                          name="Project-select"
                          inputId="Project-select"
                          components={{ DropdownIndicator }}
   
                />
              </label>
            </div>
    {Manager && (<div className="filter-block">
              <label className="date-label">
                Employee:
                <Select
                  value={selectedEmpId}
                  onChange={handleReporteeSelect}
                  options={options}
                  styles={selectCustomStylesFilter}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  placeholder="Select"
                  name="ticket-select"
                  inputId="ticket-select"
                  components={{ DropdownIndicator }}
                />
              </label>
            </div>)}
 {Manager && (<div className="filter-block">
              <label className="date-label">
                Employee Status:
                <Select
                  value={selectedEmpStatus}
                  onChange={handleEMPStatus}
                  options={empStatus}
                  styles={selectCustomStylesFilter}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  placeholder="Select"
                  name="ticket-select"
                  inputId="ticket-select"
                  components={{ DropdownIndicator }}
                />
              </label>
            </div>)}
            <div className="filter-block">
              <label className="date-label">
                Timesheet Status:
                <Select
                  value={selectedStatus}
                  onChange={handleStatusSelect}
                  options={status}
                  styles={selectCustomStylesFilter}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  placeholder="Select"
                  name="ticket-select"
                  inputId="ticket-select"
                  components={{ DropdownIndicator }}
                />
              </label>
            </div>

        
           
<div className='action-contain'>

            <Tooltip title="Apply" placement="top" arrow>
              <button
                onClick={handleDateFilter}
                className="date-filter-btn"
              >
                <TouchAppIcon />
              </button>
            </Tooltip>

            <div className="filter-block">
              <Tooltip title={(['Employee'].includes(user_role)? (exports === 'true'? 'Download' : 'Export to Email'): 'Download')} placement="top" arrow>
              <button  disabled={enableDownload} onClick={() => sendMail()} className={`download-btn ${enableDownload ? 'disabled':''}`}>{
                  (['Employee'].includes(user_role)
                    ? (exports === 'true'
                      ? <FileDownloadOutlinedIcon />
                      : <EmailOutlinedIcon />
                    )
                    : <FileDownloadOutlinedIcon />
                  )
                }</button>
                </Tooltip>
            </div>

            <div className="filter-block">
              <Tooltip title="Ennvee Export" placement="top" arrow>
              <button disabled={enableExport} onClick={handleExport} className={`export-btn ${enableExport ? 'disabled':''}`}>
                 <FileDownloadOutlinedIcon/> 
                 </button>
                </Tooltip>
            </div>
            </div>
          </div>
          {/* <div className="header-row">
       

      </div> */}

          {/* History Table */}
          <table className="history-table">
            <thead>
              <tr>
                {Manager && (<th>Employee Name</th>)}
                <th>Week</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '10%' }}>Action</th>
                <th>Approve/Reject Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={Manager ? 5 : 4}>
                    <div className="noProject">No Data Available</div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry, index) => (
                  <tr key={index}>
                    {Manager && (<td>{entry.employee_name}</td>)}
                    <td>{entry.week}</td>
                    <td
                      className={`status-${entry.status.toLowerCase() === "reverted"
                        ? "rejected"
                        : entry.status.toLowerCase()
                        }`}
                      style={{ width: '15%' }}
                    >
                      {entry.status.toLowerCase() === "reverted"
                        ? "Rejected"
                        : entry.status}
                    </td>
                    <td style={{ width: '10%', textAlign: 'center' }}>
                      <Tooltip title="View History" placement="top" arrow>
                      <VisibilityIcon
                        className="view-icon"
                        onClick={() => handleView(entry)}
                      />
                      </Tooltip>
                    </td>
                    <td>
                      {entry.approver_remarks?.trim()
                        ? entry.approver_remarks
                        : "No Remarks"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            totalRecords={totalRecords}
          />
        </div>
      </div>
    </>
  );
};

export default HistoryTab;
