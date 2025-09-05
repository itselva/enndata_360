import React, { useState, useEffect } from 'react';
import FlagIcon from '@mui/icons-material/Flag';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import "../Styles/ApprovalList.css";
import PaginationComponent from "../Components/PaginationComponent";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { components } from 'react-select';
import Select from 'react-select';
import { selectCustomStylesFilter} from "../Components/selectCustomStyles";
import TouchAppIcon from '@mui/icons-material/TouchApp';
function ApprovalList(props) {
  const {setCount,count}=props
  const accessToken = localStorage.getItem('access_token');
  const permissions = localStorage.getItem('permissions');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionType, setActionType] = useState("");
  const [targetRowIndex, setTargetRowIndex] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // from API
  const [totalEntries, setTotalEntries] = useState(0); // optional
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [screenBlur, setScreenBlur] = useState(false);
 const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState({label:'All',value:'all'});
  const[projects,setProjects]=useState([])
  const[selectProject,setSelectedProject]=useState({label:'All',value:'all'})
  // Pagination state
  // const rowsPerPage = 5;

  const navigate = useNavigate();
     const DropdownIndicator = (
    props
  ) => {
    return (
      <components.DropdownIndicator {...props}>
        <ArrowDropDownIcon />
      </components.DropdownIndicator>
    );
  };
  useEffect(() => {
    fetchClient();
    fetchProject('all')
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
    const fetchApprovals = async () => {
      setScreenBlur(true)
      try {
        const emp_id = localStorage.getItem("emp_id");
        if (!emp_id) return;

        const formData = new FormData();
        // formData.append("manager_id", emp_id);
        formData.append("client_id", selectedClient?.value || "");
        formData.append("project_id", selectProject?.value || "");
        formData.append("page", currentPage);
        formData.append("size", rowsPerPage);
        if (searchTerm.trim()) {
          formData.append("search", searchTerm.trim());
        }

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approval_fetch`, {
          headers: { "Authorization": `${accessToken}` },
          method: "POST",
          body: formData,
        });

        if (response.status === 401) {
          toast.error('Session expired', { onClose: () => window.location.reload(),toastId:"session-approv" });
          return;
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const responseData = await response.json();
        if (response.headers.get('Refresh-Token')) {
          localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
        }

        setTotalPages(responseData.total_pages);
        setTotalEntries(responseData.total_entries || 0);

        const entries = responseData.entries || [];

        const result = entries.map(item => {
          const total =
            parseFloat(item.total_time_spent.split(":")[0]) +
            parseFloat(item.total_time_spent.split(":")[1]) / 60;

          const billable =
            parseFloat(item.billable_time_spent.split(":")[0]) +
            parseFloat(item.billable_time_spent.split(":")[1]) / 60;

          const nonBillable =
            parseFloat(item.non_billable_time_spent.split(":")[0]) +
            parseFloat(item.non_billable_time_spent.split(":")[1]) / 60;

          let statusClass = "flag-orange";
          let contributionText = "🟠 Balanced Contribution";

          if ((billable === 40 && total === 40) || (nonBillable === 40 && total === 40)) {
            statusClass = "flag-teal";
            contributionText = "✔️ Meets Expectation";
          } else if (billable > 40 || nonBillable > 40) {
            statusClass = "flag-purple";
            contributionText = "⭐ Above Expectation";
          }

          return {
            employee_id: item.employee_id.toString(),
            employee_name: item.employee_name,
            week_range: `${item.week_start_date} to ${item.week_end_date}`,
            duration: `${total.toFixed(2)} Hrs`,
            statusClass,
            contributionText,
          };
        });




        setData(result);
        setScreenBlur(false)
        setCount(!count)
      } catch (err) {
        console.error("Error fetching approval data:", err);
        toast.error("Failed to load approval data",{
          toastId:"fail-approv"
        });
        setScreenBlur(false)
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchApprovals();
  }, [currentPage, rowsPerPage, searchTerm]);



  const filteredData = data.filter(row => {
    const term = searchTerm.toLowerCase();
    return (
      row.week_range?.toLowerCase().includes(term) ||
      row.employee_name?.toLowerCase().includes(term) ||
      row.duration?.toLowerCase().includes(term) ||
      row.contributionText?.toLowerCase().includes(term)
    );
  });

  // Pagination calculations
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // const openRemarksDialog = (type, index) => {
  //   setActionType(type);
  //   setTargetRowIndex(index);
  //   // setSelectedRows([]);        // Reset bulk selection
  //   setIsAllSelected(false);    // Reset "Select All"
  //   setOpen(true);
  // };


  const openRemarksDialog = (type, index) => {
    if (selectedRows.length > 1) {
      toast.warning("Multiple rows selected. Use the bulk Approve/Reject buttons instead.",{toastId:"multiple-rows-selected"});
      return;
    }

    if (selectedRows.length === 1 && selectedRows[0] !== index) {
      toast.warning("Incorrect selection. Deselect other rows or use bulk action.,",{toastId:"incorrect-selection"});
      return;
    }


    setActionType(type);
    setTargetRowIndex(index);
    setIsAllSelected(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRemarks('');
    setTargetRowIndex(null);
    setScreenBlur(false)
  };

  const handleApproveWithRemarks = async () => {

    setOpen(false);
    setScreenBlur(true);
    const manager_id = localStorage.getItem("emp_id");
    if (!permissions.includes('approve_timesheet')) {
      toast.error("Access denied",{
        toastId:"access-handleApproveWithRemarks"
      });
      return;
    }
    if (targetRowIndex === null && selectedRows.length === 0) {
      toast.warning("Please select at least one row to reject.",{
        toastId:"select atleast one row"
      });
      return;
    }

    let rowsToProcess = [];

    if (targetRowIndex !== null) {
      rowsToProcess = [filteredData[targetRowIndex]];
    } else {
      rowsToProcess = selectedRows.map(index => filteredData[index]);
    }

    try {
      let success = false;
      for (const item of rowsToProcess) {
        const formData = new FormData();
        formData.append("emp_id", item.employee_id);
        formData.append("manager_id", manager_id);
        const [start_date, end_date] = item.week_range.split(" to ");
        formData.append("start_date", start_date.trim());
        formData.append("end_date", end_date.trim());
        formData.append("status", "approved");
        formData.append("remark", remarks || "");

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approve_timesheet`, {
          headers: {
            "Authorization": `${accessToken}`
          },
          method: "POST",
          body: formData,
        });
        if (response.status === 401) {
          toast.error('Session expired', {
            onClose: () => window.location.reload(),
            toastId:"sess-handleApprovewithremar"
          });
        }
        const responseData = await response.json();

        if(responseData.status === true){
          success=true
        }
        if (response.headers.get('Refresh-Token')) {
          localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
        }

        if (response.status === 401) {
          toast.error('Session expired', {
            onClose: () => window.location.reload(),
            toastId: 'session'
          })
        }

        if (!response.ok) throw new Error(`Approval failed for ${item.employee_name}`);
      }

      navigate('/CreateTimesheet',{
        state: {
          activeTab: "Approvals",
        },
      })
      if (success) {
        toast.success("Timesheet approved successfully for authorized projects", {
          onClose: () => window.location.reload(),
          toastId: "approved-success"
        });
      }else{
         toast.warn("You are not authorized to Approve other's projects", {
          onClose: () => window.location.reload(),
          toastId: "approved-success-error"
        });
        
      }
      setRemarks("");
      const updatedData = data.filter((_, idx) =>
        targetRowIndex !== null ? idx !== targetRowIndex : !selectedRows.includes(idx));
      setData(updatedData);
      setTotalEntries(prev => prev - (targetRowIndex !== null ? 1 : selectedRows.length));
      setSelectedRows([]);
      setIsAllSelected(false);
      setTargetRowIndex(null);
      setCurrentPage(1); // Reset to first page after action
    } catch (err) {
       setScreenBlur(false);
      console.error("Approval error:", err);
      toast.error("Approval failed. Please try again.",{toastId:"please-try-again-approve-failed"});
    }
  };
const fetchProject = async (clientId) => {
  // if (!clientId || clientId === "all") {
  //   setProjects([]); // nothing selected, keep empty
  //   return;
  // }

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

  const handleSelectProject = (selected) => {
    setSelectedProject(selected);
  };


  const handleReject = async () => {
    setOpen(false);
    setScreenBlur(true);
    const manager_id = localStorage.getItem("emp_id");
    if (!permissions.includes('reject_timesheet')) {
      toast.error("Access denied",{
        toastId:"access-reject"
      });
      return;
    }
    if (targetRowIndex === null && selectedRows.length === 0) {
      toast.warning("Please select at least one row to reject.",{
        toastId:"reject-please select one row"
      });
      return;
    }

    if (remarks.trim() === '') {
      toast.error("Please enter rejection comments",{
        toastId:"reject-comm"
      });
      setOpen(true)
      return;
    }
    let rowsToProcess = [];

    if (targetRowIndex !== null) {
      rowsToProcess = [filteredData[targetRowIndex]];
    } else {
      rowsToProcess = selectedRows.map(index => filteredData[index]);
    }

    try {
      let success = false
      for (const item of rowsToProcess) {
        const formData = new FormData();
        formData.append("emp_id", item.employee_id);
        formData.append("manager_id", manager_id);
        const [start_date, end_date] = item.week_range.split(" to ");
        formData.append("start_date", start_date.trim());
        formData.append("end_date", end_date.trim());
        formData.append("status", "rejected");
        formData.append("remark", remarks || "");

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/approve_timesheet`, {
          headers: {
            "Authorization": `${accessToken}`
          },
          method: "POST",
          body: formData,
        });

         const responseData = await response.json();
         if(responseData.status === true){
          success=true
         }
        if (response.status === 401) {
          toast.error('Session expired', {
            onClose: () => window.location.reload(),
            toastId:"sess-exp"
          });
        }
        if (response.headers.get('Refresh-Token')) {
          localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
        }

        if (!response.ok) throw new Error(`Rejection failed for ${item.employee_name}`);
      }

      
      if (success) {
        toast.success("Timesheet rejected successfully for authorized projects", {
          onClose: () => window.location.reload(),
          toastId: "Timesheet-rejected-successfully"
        });
      } else {
         toast.warn("You are not authorized to Reject other's projects", {
          onClose: () => window.location.reload(),
          toastId: "Timesheet-rejected-error"
        });
      }
      

      setRemarks("");
      //  navigate('/CreateTimesheet',{
      //   state: {
      //     activeTab: "Approvals",
      //   },
      // })
      const updatedData = data.filter((_, idx) =>
        targetRowIndex !== null ? idx !== targetRowIndex : !selectedRows.includes(idx)
      );
      setData(updatedData);
      setTotalEntries(prev => prev - (targetRowIndex !== null ? 1 : selectedRows.length));
      setSelectedRows([]);
      setIsAllSelected(false);
      setTargetRowIndex(null);
      setCurrentPage(1); // Reset to first page after action
    } catch (err) {
      console.error("Rejection error:", err);
      toast.error("Rejection failed. Please try again.",{
        toastId:"reject-fail"
      });
    }
    finally {
      setScreenBlur(false);
    }
  };
  const handleSelect = (selected) => {
    setSelectedClient(selected);
    setSelectedProject(null); // reset project selection
    setProjects([]); // clear old projects while fetching new

    fetchProject(selected.value);
    // if (selected && selected.value !== "all") {
    // }
  };

  const handleSelectAll = () => {
    const selectAll = !isAllSelected;
    setIsAllSelected(selectAll);
    setSelectedRows(selectAll ? filteredData.map((_, idx) => idx) : []);
  };

  const handleCheckboxChange = (index) => {
    setSelectedRows(prev => {
      const updated = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];
      setIsAllSelected(updated.length === filteredData.length);
      return updated;
    });
  };

  const handleView = (row) => {
    const [start_date, end_date] = row.week_range.split(" to ");
    navigate("/Approvetable", {
      state: {
        selectedTab: "Approvals",
        employeeData: {
          emp_id: row.employee_id,
          emp_name: row.employee_name,
          week_range: row.week_range,
          start_date: start_date.trim(),
          end_date: end_date.trim()
        }
      }
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

  return (
    <div>


      {/* Main content with blur condition */}
      <div className={screenBlur ? "blurred" : ""}>
        {/* Blur overlay and spinner */}
        {screenBlur && (
          <>
            <div className="screen-blur"></div>
            <div className="screen-spinner">
              <div className="spinner"></div>
            </div>
          </>
        )}
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="d-flex pt-10 px-20">
          <div className='list-title'>Approval List</div>
          <div className='filters-container'>
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
                    value={selectProject}
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
                <Tooltip title="Apply" placement="top" arrow>
                  <button
                    onClick={fetchApprovals}   // <-- call API with filters
                    className="date-filter-btn"
                  >
                    <TouchAppIcon />
                  </button>
                </Tooltip>

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

        <div id="approval-list">
          {loading ? (
            <div className='loading'>Loading approvals...</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>
                      <div className='d-fl'>
                        <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} style={{ marginLeft: "-1px" }} />
                        <div className='ml-5'>Week</div>
                      </div>
                    </th>
                    <th>Employee Name</th>
                    <th>Duration</th>
                    <th className="center">Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="noProject">No Data Available</div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <div className='d-fl'>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(index)}
                              onChange={() => handleCheckboxChange(index)}
                            />
                            <p style={{ marginLeft: "8px" }}>{formatWeekRange(row.week_range)}</p>
                          </div>
                        </td>
                        <td>{row.employee_name}</td>
                        <td>{row.duration}</td>
                        <td className="center">
                           <Tooltip title={row.contributionText} placement="top" arrow>
                          <div>
                            <FlagIcon className={row.statusClass || "flag-orange"} />
                          </div>
                          </Tooltip>
                        </td>
                        <td>
                          <div className="span-spacing">
                            <Tooltip title="View Timesheet" placement="top" arrow>
                            <span className="circle bg-aliceblue" onClick={() => handleView(row)}>
                              <RemoveRedEyeIcon sx={{ fontSize: "18px", color: "black" }} />
                            </span>
                            </Tooltip>
                             <Tooltip title="Reject Timesheet" placement="top" arrow>
                            <span className="circle bg-aliceblue" onClick={() => openRemarksDialog("reject", index)}>
                              <CloseIcon sx={{ fontSize: "18px", color: "black" }} />
                            </span>
                            </Tooltip>
                             <Tooltip title="Approve Timesheet" placement="top" arrow>
                            <span className="circle bg-aliceblue" onClick={() => openRemarksDialog("approve", index)}>
                              <CheckIcon sx={{ fontSize: "18px", color: "black" }} />
                            </span>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>
              </table>

              {filteredData.length > 0 && (
                <div className="pagination-containers">
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setSelectedRows([])
                      setIsAllSelected(false)
                      setCurrentPage(page)}}
                    onRowsPerPageChange={setRowsPerPage}
                    rowsPerPage={rowsPerPage}
                    totalRecords={totalEntries}

                  />
                </div>
              )}

              <div className='dis-flex'>
                <div>
                  <div className={`status ${filteredData.length === 0 ? "nodata" : ""}`}>
                    <div className='d-flex'><span className='round bg-orange-arrow'></span><span className='font-st'>Balanced Contribution</span></div>
                    <div className='d-flex'><span className='round bg-teal-arrow'></span><span className='font-st'>Meets Expectation</span></div>
                    <div className='d-flex'><span className='round bg-purple-arrow'></span><span className='font-st'>Above Expectation</span></div>
                  </div>
                </div>

                {selectedRows.length >= 2 && (
                  <div className={`bulk-action-buttons ${filteredData.length === 0 ? "no-data" : ""}`}>
                    <button
                      className="approve-btn"
                      onClick={() => {
                        setActionType("approve");
                        setTargetRowIndex(null);
                        if (remarks.trim() === "") {
                          if (window.confirm("Proceed without remarks?")) handleApproveWithRemarks();
                        } else {
                          handleApproveWithRemarks();
                        }
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => {
                        setActionType("reject");
                        setTargetRowIndex(null);
                        if (remarks.trim() === "") {
                          setOpen(true)
                        } else {
                          handleReject();
                        }
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}

              </div>
            </>
          )}
        </div>




        <Dialog open={open} onClose={handleClose} PaperProps={{
          style: {
            width: '750px',
            height: '360px',
          },
        }}>
          <DialogTitle sx={{ padding: 0 }}>
            <div className="d-flex-add">
              <div className="custom-dialog-title h-60">{actionType === "approve" ? "Approve Remarks" : "Reject Remarks"}</div>
              <DialogActions>
                <div className="icon-button " onClick={actionType === "approve" ? handleApproveWithRemarks : handleReject}>
                  <CheckIcon className="icon-color" />
                </div>
                <div className="icon-button " onClick={handleClose}>
                  <CloseIcon className="icon-color" />
                </div>
              </DialogActions>
            </div>
          </DialogTitle>
          <DialogContent>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className='box-style'
              placeholder='Enter your remarks'
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>

  );
}

export default ApprovalList;