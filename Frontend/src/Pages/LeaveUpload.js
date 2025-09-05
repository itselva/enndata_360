import React, { useState, useRef, useEffect } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Header from "../Components/header";
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx"
// import { saveAs } from "file-saver"
import { useLocation } from "react-router-dom";
import "../Styles/leave.css"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaginationComponent from "../Components/PaginationComponent";
import Select from 'react-select';
import { selectCustomStylesFilter } from "../Components/selectCustomStyles";
import { components } from 'react-select';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  TextField,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
} from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import FlagIcon from '@mui/icons-material/Flag';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import "../Styles/leave.css"
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => {
  const year = 2023 + i;
  return { value: year.toString(), label: year.toString() };
});
const LeaveUpload = () => {
  const [weekDayList, setWeekDayList] = useState([
    new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date()
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState("")
  const [searchHoliDay, setSearchHoliDay] = useState("")
  const [selectedFileName, setSelectedFileName] = useState("");
  const [actionType, setActionType] = useState("");
  const [targetRowIndex, setTargetRowIndex] = useState(null);
 const [screenBlur, setScreenBlur] = useState(false);
  const [open, setOpen] = useState(false);

  const [columns, setColumns] = useState([
    "employee_no",
    "name",
    "designation",
    "department",
    "practice",
    "from_date",
    "to_date",
    "applied_date",
    "approved_date",
    "leave_applied_status",
    "manager_name",
    "transaction_type",
    "leave_type",
    "days",
    "reason",
    "remarks"
  ]);
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const accessToken = localStorage.getItem('access_token');
  const user_role = localStorage.getItem('user_role');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [leaveDate, setLeaveDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [employee, setEmployee] = useState('');
  const [year, setYear] = useState('2025');
  const locationState = useLocation();
  const [activeTab, setActiveTab] = useState("leave");
  const [leaveCalendar, setLeaveCalendar] = useState([]);
  const [location, setLocation] = useState('');
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");
  const [hours, setHours] = useState("");
  const [locationList, setLocationList] = useState([]);
  const [locationFrom, setLocationFrom] = useState('');
  const [totalCount, setTotalCount] = useState(0);


  const handleCheckboxChange = (index) => {
    setSelectedRows(prev => {
      const updated = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];
      setIsAllSelected(updated.length === filteredData.length);
      return updated;
    });
  };
  const formatWeekRange = (weekRangeStr) => {
    if (!weekRangeStr.includes(" to ")) return weekRangeStr;
    const [start, end] = weekRangeStr.split(" to ");
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${startDate.toLocaleDateString('en-GB', options).replace(/ /g, '-')} to ${endDate.toLocaleDateString('en-GB', options).replace(/ /g, '-')}`;
  };

  const handleSelectAll = () => {
    const selectAll = !isAllSelected;
    setIsAllSelected(selectAll);
    setSelectedRows(selectAll ? filteredData.map((_, idx) => idx) : []);
  };

  // const formatDate = (date) => {
  //   const yyyy = date.getFullYear();
  //   const mm = String(date.getMonth() + 1).padStart(2, "0");
  //   const dd = String(date.getDate()).padStart(2, "0");
  //   return `${yyyy}-${mm}-${dd}`;
  // };
  const handleClear = () => {
    setColumns([]);
    setExcelData([]);
    setFileName("");
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  const openRemarksDialog = (type, index) => {
    setActionType(type);
    setTargetRowIndex(index);
    // setSelectedRows([]);        // Reset bulk selection
    setIsAllSelected(false);    // Reset "Select All"
    setOpen(true);
  };
  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (!excelData || excelData.length === 0) {
        toast.warning("No data to submit. Please upload a valid Excel file.",{
          toastId:"no-clear"
        });
        setLoading(false)
        return;
      }
      const cleanedData = normalizeLeaveData(excelData);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/uploadFile/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${accessToken}`
        },
        body: JSON.stringify(cleanedData)
      });
      if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 401) {
        toast.error('Session expired', {
          onClose: () => window.location.reload(),
          toastId: 'session'
        })
      }
      if (response.ok) {
        toast.success("Leave data submitted successfully!",{
          toastId:"data-success"
        });
        handleClear();
      } else {
        toast.error("Failed to submit data.",{
          toastId:"leave-submit"
        });
      }
      if (activeTab !== "holiday") {
        fetchLeaveData();
      }
      setLoading(false)
    } catch (err) {
      toast.error("Something went wrong while submitting.",{
        toastId:"leave-error"
      });
    }
  };
  const formatDateForApi = (date) => {
  if (!date) return null;
  const d = date.getDate();
  const m = date.getMonth() + 1; // month is 0-based
  const y = date.getFullYear();
  return `${d}-${m}-${y}`; // send as "17-3-2025"
};
const startRef = useRef(null);
  const endRef = useRef(null);
const dateRef=useRef(null)
const leaveRef=useRef(null)
const holidayRef=useRef(null)
  const fetchLeaveData = async () => {
      setScreenBlur(true)
    // setLoading(true);
    const formData = new FormData();
    if (searchTerm) formData.append("name", searchTerm);
    if (selectedLocation) formData.append("location", selectedLocation?.label);
    

    if (startDate) formData.append("from_date", formatDateForApi(startDate));
    if (endDate) formData.append("to_date", formatDateForApi(endDate));
    formData.append("page", page.toString());
    formData.append("limit", limit.toString());

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/leave-calendar`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `${accessToken}`
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leave data");

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
      setTotalCount(result.total)
      setData(result.results); // if your API returns { results, total }
      setTotalPages(Math.ceil(result.total / limit));
        setScreenBlur(true)
        
        
    } catch (error) {
       setScreenBlur(false)
      console.error("Error fetching leave data:", error);
    }
     setScreenBlur(false)
  };

  useEffect(() => {
    if (activeTab !== "holiday") {
      fetchLeaveData();
    }
  }, [page, limit, searchTerm]);

  const normalizeLeaveData = (data) => {
    return data.map((row) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        const trimmedKey = key.trim();
        let value = row[key];
        if (["From Date", "To Date", "Applied Date", "Approved Date"].includes(trimmedKey) && typeof value === "number") {
          value = excelDateToISO(value);
        }

        normalized[trimmedKey.replace(/\s+/g, "")] = typeof value === "string" ? value.trim() : value;
      });
      return normalized;
    });
  };

  const excelDateToISO = (serial) => {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const date = new Date(utcValue * 1000);
    return date.toISOString().split("T")[0];
  };

  const handleDateFilter = () => {
    fetchHolidayCalendar();
  };

  const handleClearHolidayForm = () => {

    setHolidayDate("")
    setHolidayDescription("")
    setLocationFrom("")
    setHours("")
  }
  const handleLeaveFromSubmition = async () => {
    if (!year || !holidayDate || !holidayDescription || !locationFrom || !hours) {
      toast.error("Please fill all fields",{
        toastId:"handleLeaeve-Submitt-error"
      });
      return;
    }


    const formData = new FormData();
    formData.append("year", parseInt(year.label));
    formData.append("date", holidayDate);
    formData.append("holidayDescription", holidayDescription);
    formData.append("location", locationFrom?.label);
    formData.append("hours", hours);
    if (Number(hours) < 1 || Number(hours) > 8) {
      toast.error("Hours must be between 1 and 8",{
        toastId:"leave-hrs"
      });
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/uploadHolidayCalendar/`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `${accessToken}`
        },
      });

      if (response.ok) {
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
        if (result.status === false) {
          toast.error(result.message,{
            toastId:"error-leave-sumit"
          });
          return
        }
        handleClearHolidayForm()
        // alert("Holiday submitted successfully!");
        toast.success("Holiday submitted successfully!",{
          toastId:"handle-leave-submit-success"
        });
      } else {
        const err = await response.text();
        console.error("Error:", err);
        toast.error("Submission failed",{
          toastId:"leavesubmit-fail"
        });
        // alert();
      }
      if (activeTab === "holiday") {
        fetchHolidayCalendar();
      }
    } catch (error) {
      console.error("Exception:",);
      toast.error(error,{
        toastId:"leav-err"
      });
      // alert("Something went wrong!");
    }
  };
  useEffect(() => {
    if (activeTab === "holiday") {
      fetchHolidayCalendar();
    }
  }, [activeTab, page, limit,searchHoliDay]);
  const fetchHolidayCalendar = async () => {
    setScreenBlur(true)
    const formData = new FormData();
    if (searchHoliDay) formData.append("search", searchHoliDay);
    if (startDate)  formData.append("from_date", formatDateForApi(startDate));
   
    if (endDate)formData.append("to_date", formatDateForApi(endDate));
    if (location) formData.append("location", location?.label);
    formData.append("page", page);
    formData.append("limit", limit);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/holiday-calendar`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `${accessToken}`
        },
      });

      if (!response.ok) throw new Error("Failed to fetch holiday calendar");
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
      setTotalCount(result.total)
      setLeaveCalendar(result.results || []);
      const total = result.total || 0;
      setTotalPages(Math.ceil(total / limit));
      setScreenBlur(false)
    } catch (error) {
      setScreenBlur(false)
      console.error("Fetch error:", error);
    }
  };
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_location`, {
          headers: {
            "Authorization": `${accessToken}`
          },
        });
        const data = await response.json();
         if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

        if (response.status === 401) {
          toast.error('Session expired', {
            onClose: () => window.location.reload(),
            toastId: 'session'
          })
        }
       const fetchedOptions = data?.map(loc => ({
        value: loc.id,
        label: loc.work_location
      })) || [];
        setLocationList(fetchedOptions);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };

    fetchLocations();
  }, []);
 const  formatDate=(fromDate)=>{
    const start = new Date(fromDate);
   
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const startStr = start
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, "-");
   
    return `${startStr}`;
  }
 
  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = jsonData[0];
      const rows = jsonData.slice(1).map(row =>
        Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
      );

      const processedRows = [];
      let lastValidRow = null;

      rows.forEach(row => {
        const isEmptyRow = Object.values(row).every(val => val === null || val === "");
        if (!isEmptyRow) {
          const hasOnlyReason = row["Reason"] && Object.entries(row).every(([key, val]) => {
            return key === "Reason" || val === null || val === "";
          });

          if (hasOnlyReason && lastValidRow) {
            lastValidRow["Reason"] = `${lastValidRow["Reason"] || ""}\n${row["Reason"]}`;
          } else {
            processedRows.push(row);
            lastValidRow = row;
          }
        }
      });

      setColumns(headers);
      setExcelData(processedRows);

      // Reset file input so same file can be selected again later
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    };

    reader.readAsBinaryString(file);
  };
  const filteredData = data.filter(row => {
    const term = searchTerm.toLowerCase();
    return (
      row.week_range?.toLowerCase().includes(term) ||
      row.employee_name?.toLowerCase().includes(term) ||
      row.duration?.toLowerCase().includes(term) ||
      row.contributionText?.toLowerCase().includes(term)
    );
  });
  useEffect(() => {
    setPage(1);
    setLimit(5);
  }, [activeTab]);

  const handleLocation=(selectedValue)=>{
    setSelectedLocation(selectedValue)
  }

  const handleHolidayLocation=(selectedValue)=>{
    setLocation(selectedValue)
  }

  const handleLocationForm=(selectedValue)=>{
    setLocationFrom(selectedValue)
  }

  const handleYear=(selectedValue)=>{
    setYear(selectedValue)
  }

    const DropdownIndicator = (
    props
  ) => {
    return (
      <components.DropdownIndicator {...props}>
        <ArrowDropDownIcon />
      </components.DropdownIndicator>
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

      <div >
        <div className="top">
          <div className="tabs">
            <div
              className={`tab ${activeTab === "leave" ? "active" : ""}`}
              onClick={() => setActiveTab("leave")}
            >

              <span className="tab-text">Leave Calendar</span>
            </div>



            <div
              className={`tab ${activeTab === "holiday" ? "active" : ""}`}
              onClick={() => setActiveTab("holiday")}
            >

              <span className="tab-text">Holiday Calendar</span>
            </div>



          </div>
        </div>
        {activeTab === "leave" && (
          <div className="div-10p">
            <div className="upload-section">
              <div className="container-box">
                <div className="upload-header">
                  Reports
                  <IconButton className="upload-info-icon" size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </div>
                <div className="filter-wrapper">
                  <div className="filter-container-upload">
                    <label className="date-label-upload">
                      Location:
                      <Select
                  onChange={handleLocation}
                  options={locationList}
                  value={selectedLocation}
                  styles={selectCustomStylesFilter}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  placeholder="Select"
                  name="ticket-select"
                  inputId="ticket-select"
                  components={{ DropdownIndicator }}
                />
                      {/* <selectx
                        className="date-input-upload"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        <option value="">Select Location</option>
                        {locationList?.map((loc) => (
                          <option key={loc.id} value={loc.work_location}>
                            {loc.work_location}
                          </option>
                        ))}
                      </select> */}

                    </label>

                    <label className="date-label-upload">
                      Start Date:
                      {/* <input className='date-input' type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /> */}
                       <div style={{ position: "relative", display: "inline-block" }}>
                            <DatePicker
                            ref={startRef}
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
                            />
                            <CalendarMonthOutlinedIcon
                              onClick={() => startRef.current.setFocus()}
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

                    <label className="date-label-upload">
                      End Date:
                      {/* <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" /> */}
                       <div style={{ position: "relative", display: "inline-block" }}>
                            <DatePicker
                            ref={endRef}
                              selected={endDate}
                             
                             onChange={(date) => setEndDate(date)}
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
                              onClick={() => endRef.current.setFocus()}
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

                    <button onClick={fetchLeaveData} className="leave-submit">Apply</button>
                  </div>
                </div>
              </div>
              <div className="container-box">
                <div className="upload-header">
                  Upload
                  <IconButton className="upload-info-icon" size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </div>

                <div className="upload-action-row">
                  <div
                    className="upload-box"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      ref={fileInputRef}
                      onChange={handleExcelUpload}
                      style={{ display: "none" }}
                    />

                    <span className="holiday">Browse</span>
                    <span className="file-name">
                      {selectedFileName || "Browse the file"}
                    </span>
                  </div>

                  <button className="upload-submit" onClick={handleSubmit}>
                    Submit
                  </button>

                  <button className="upload-submit" onClick={handleClear}>
                    Clear
                  </button>

                </div>
              </div>

            </div>
            <div className="top-bar">
              <div className="list-view">List View</div>

              <div className="search-wrapper">
                <form className="search-form">
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon-leave"><SearchIcon /></span>
                </form>
              </div>
            </div>
            <div className="div-10p">
              {loading ? (
                <div className='loading'>Loading approvals...</div>
              ) : (
                <>
                  <table className="history-table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr >
                          <th style={{ width: '12%' }}>Employee No</th>
                          <th style={{ width: '18%' }}>Name</th>
                          <th style={{ width: '15%' }}>Location</th>
                          <th style={{ width: '15%' }}>From</th>
                          <th style={{ width: '15%' }}>To</th>
                          <th style={{ width: '15%' }}>Leave Type</th>
                          <th style={{ width: '10%' }}>Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '8px' }}>Loading...</td></tr>
                      ) : data.length === 0 ? (
                        <tr>
                          <td colSpan="7">
                            <div className="noProject">No Data Available</div>
                          </td>
                        </tr>
                      ) : (
                        data.map((row, idx) => (
                          <tr key={idx}>
                            <td >{row.EmployeeNo}</td>
                            <td >{row.Name}</td>
                            <td >{row.location}</td>
                            <td >{formatDate(row.FromDate)}</td>
                            <td >{formatDate(row.ToDate)}</td>
                            {/* <td >{row.LeaveAppliedStatus}</td> */}
                            <td >{row.LeaveType}</td>
                            <td >{row.Days}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {data.length > 0 && (
                    <PaginationComponent
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setPage(newPage)}
                        onRowsPerPageChange={setLimit}
                        rowsPerPage={limit}
                        totalRecords={totalCount}
                      />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "holiday" && (

          <div className="div-10p">

            <div className="upload-section">
              <div className="container-box">
                <div className="upload-header">
                  Reports
                  <IconButton className="upload-info-icon" size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </div>
                <div className="filter-wrapper">
                  <div className="filter-container-upload">
                    <label className="date-label-upload">
                      Location:
                        <Select
                          onChange={handleHolidayLocation}
                          options={locationList}
                          value={location}
                          styles={selectCustomStylesFilter}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder="Select"
                          name="ticket-select"
                          inputId="ticket-select"
                          components={{ DropdownIndicator }}
                        />
                    </label>

                    <label className="date-label-upload">
                      Start Date:
                      {/* <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                      /> */}
                       <div style={{ position: "relative", display: "inline-block" }}>
                            <DatePicker
                           ref={dateRef}
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
                            />
                            <CalendarMonthOutlinedIcon
                             onClick={() => dateRef.current.setFocus()}
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

                    <label className="date-label-upload">
                      End Date:
                      {/* <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                      /> */}
                       <div style={{ position: "relative", display: "inline-block" }}>
                            <DatePicker
                            ref={leaveRef}
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
                              onClick={() => leaveRef.current.setFocus()}
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

                    <button onClick={handleDateFilter} className="leave-submit">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              <div className="container-box">

                <div className="upload-header">
                  Holiday Form
                  <IconButton className="upload-info-icon" size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </div>
                <div className="filter-wrapper">
                  <div className="filter-container-upload">
                    <label className="date-label-upload">
                      Year:
                        <Select
                          onChange={handleYear}
                          options={yearOptions}
                          value={year}
                          styles={selectCustomStylesFilter}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder="Select Year"
                          name="ticket-select"
                          inputId="ticket-select"
                          components={{ DropdownIndicator }}
                        />
                      {/* <select
                        className="date-input-upload"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                      >
                        {yearOptions.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select> */}
                    </label>
                    <label className="date-label-upload">
                      Date:
                      {/* <input
                        type="date"
                        className="date-input"
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                      /> */}
                        <div style={{ position: "relative", display: "inline-block" }}>
                            <DatePicker
                        ref={holidayRef}
                              selected={holidayDate}
                             
                             onChange={(date) => setHolidayDate(date)}
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
                                onClick={() => holidayRef.current.setFocus()}
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
                    <label className="date-label-upload">
                      Holiday Description:
                      <input
                        type="text"
                        className="date-input-upload"
                        value={holidayDescription}
                        onChange={(e) => setHolidayDescription(e.target.value)}
                        placeholder="Enter description"
                      />
                    </label>

                    <label className="date-label-upload">
                      Location:
                      <Select
                  onChange={handleLocationForm}
                  options={locationList}
                  value={locationFrom}
                  styles={selectCustomStylesFilter}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  placeholder="Select"
                  name="ticket-select"
                  inputId="ticket-select"
                  components={{ DropdownIndicator }}
                />
                      {/* <select
                        className="date-input-upload"
                        value={locationFrom}
                        onChange={(e) => setLocationFrom(e.target.value)}
                      >
                        <option value="">Select Location</option>
                        {locationList?.map((loc) => (
                          <option key={loc.id} value={loc.work_location}>
                            {loc.work_location}
                          </option>
                        ))}
                      </select> */}
                    </label>
                    <label className="date-label-upload">
                      Hours:
                      <input
                        type="number"
                        className="date-input-upload"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        min="0"
                        placeholder="Enter hours"
                      />
                    </label>


                    <div className="button-group">
                      <button className="leave-submit" onClick={handleLeaveFromSubmition}>
                        Submit
                      </button>
                      <button className="leave-submit clear-btn" onClick={handleClearHolidayForm}>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div className="top-bar">
              <div className="list-view">List View</div>

              <div className="search-wrapper">
                <form className="search-form">
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search"
                    value={searchHoliDay}
                    onChange={(e) => setSearchHoliDay(e.target.value)}
                  />
                  <span className="search-icon-leave"><SearchIcon /></span>
                </form>
              </div>
            </div>
            <div className="div-10p">
              {loading ? (
                <div className='loading'>Loading ...</div>
              ) : (
                <>
                  <table className="history-table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '10%' }}>Year</th>
                        <th style={{ width: '15%' }}>Date</th>
                        <th style={{ width: '20%' }}>Description</th>
                        <th style={{ width: '20%' }}>Location</th>
                        <th style={{ width: '5%' }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '8px' }}>Loading...</td></tr>
                      ) : leaveCalendar.length === 0 ? (
                        <tr>
                          <td colSpan="5">
                            <div className="noProject">No Data Available</div>
                          </td>
                        </tr>
                      ) : (
                        leaveCalendar.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.year}</td>
                            <td>{formatDate(row.date)}</td>
                            <td>{row.holidayDescription}</td>
                            <td>{row.location}</td>
                            <td>{row.hours}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {leaveCalendar.length > 0 && (
                    <PaginationComponent
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setPage(newPage)}
                        onRowsPerPageChange={setLimit}
                        rowsPerPage={limit}
                        totalRecords={totalCount}
                      />
                  )}
                </>
              )}
            </div>


          </div>





        )}







      </div>
      </div>
    </>
  );
};

export default LeaveUpload;
