//----------import section---------------//
import "../Styles/Table.css";
import "../index.css";
import React, { useState, useRef, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


function TableApprovalTimesheet({ isRejectPage, setProjectRows, projectRows,handleSubmit}) {
  //--------------Declaration Part-------------------//
  const accessToken = localStorage.getItem('access_token')
  const [isBillableChecked, setIsBillableChecked] = useState(false);
  const [isTableDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRemarkPopup, setShowRemarkPopup] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState('');
  const [remarkIndex, setRemarkIndex] = useState({ projectKey: '', index: -1 });
  const textareaRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectsData, setProjectsData] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const ProjectName = ["Timesheet", "Nemko-Web App", "AAM-Mobile App", "Kalyan Silks"];
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [clickedProjects, setClickedProjects] = useState({});
  const [button,setButton]=useState('B')

  // Helper to get the Monday of the current week

  const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    return start;
  };
  
const handlebutton=()=>{
    setButton(prev=>(prev==='B'?"NB":"B"))
   }



 const getWeekDays = (startOfWeek) => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });
};

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      newDate.setDate(1)
      return newDate;
 
    });
  };
   
  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      newDate.setDate(1)
      return newDate;
    });
  };
  
  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = getWeekDays(startOfWeek);

  const isWeekValid =
  weekDays.length === 7 &&
  weekDays[0] instanceof Date &&
  weekDays[6] instanceof Date;
  //   const monthName = startOfWeek.toLocaleString("default", { month: "long" });
  const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
  const monthName = isWeekValid
  ? (monthFormatter.format(weekDays[0]) === monthFormatter.format(weekDays[6])
    ? monthFormatter.format(weekDays[0])
    : `${monthFormatter.format(weekDays[0])} / ${monthFormatter.format(weekDays[6])}`)
  : '';
  
  ///get weeks  functionality//
  function getWeekDates(currentDate) {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = (day === 0 ? -6 : 1 - day); // If Sunday, go back 6 days
    const monday = new Date(date.setDate(date.getDate() + diffToMonday));
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }

    return weekDays;
  }

 const formatDay = (date) => {
  return date.toLocaleDateString("en-GB", { weekday: "short" });
};

   const handlePrevWeek = () =>
  setCurrentDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(newDate.getDate() - 7);
    return newDate;
  });
 
const handleNextWeek = () =>
  setCurrentDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(newDate.getDate() + 7);
    return newDate;
  });

  const handleAddRow = (projectKey) => {
    const selectedProject = projectsData.find(p => `project_${p.projectCode}` === projectKey);
    const allocatedTasks = selectedProject?.tasks || [];

    const currentRows = projectRows[projectKey] || [];
    // const nextTask = allocatedTasks[currentRows.length];

    // if (!nextTask) {

    //   return;
    // }

     if (currentRows.length >= allocatedTasks.length) {
      toast.error("Maximum tasks listed",{
        toastId:"max-task-listed"
      });
    return;
  }

    const newTimeEntries = {};
    weekDays.forEach(day => {
      const label = day.toLocaleDateString('en-GB', { weekday: 'long' });
      newTimeEntries[label] = "";
    });

    // Add a new row with available task
    setProjectRows(prev => ({
      ...prev,
      [projectKey]: [
        ...prev[projectKey],
        {
          category: "",
          isChecked: false,
          remark: "",
          timeEntries: newTimeEntries,

        }
      ]
    }));

    // Add .mr-5 class trigger
    setClickedProjects(prev => ({
      ...prev,
      [projectKey]: true
    }));
  };



  /////---------------useeffect fetch the project details-----

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const empId = localStorage.getItem("userId");
        if (!empId) {
          console.error("No employee ID found in localStorage.");
          return;
        }

        const formData = new FormData();
        formData.append("emp_id", empId);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetch_details_2`, {
          headers: {
          "Authorization": `${accessToken}`
        },
          method: "POST",
          body: formData,
        });

        if (response.status === 401) {
          toast.error('Session expired', {
            onClose: () => window.location.reload(),
            toastId:"fetc-max-expire"
          })
        }

        if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }

        const result = await response.json();


        if (Array.isArray(result) && result.length > 0) {
          const projects = result[0].projects || [];
          setProjectsData(projects);

          // 🛠 Initialize rows
          const newProjectRows = {};
          projects.forEach((proj) => {
            const key = `project_${proj.projectCode}`;
            const timeEntries = {};

            weekDays.forEach(day => {
              const label = day.toLocaleDateString('en-GB', { weekday: 'long' });
              timeEntries[label] = "";
            });

            newProjectRows[key] = [{
              category: "",
              isChecked: false,
              remark: "",
              timeEntries,
            }];
          });

          setProjectRows(newProjectRows);
        } else {
          setProjectsData([]);
        }
      } catch (err) {
        console.error("❌ Fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  },[]);


  // const handleCategoryChange = (projectKey, index, value) => {
  //   const updated = [...projectRows[projectKey]];
  //   updated[index].category = value;
  //   setProjectRows(prev => ({ ...prev, [projectKey]: updated }));
  // };

  const handleRowCheckboxChange = (projectKey, index, event) => {
    const updated = [...projectRows[projectKey]];
    updated[index].isChecked = event.target.checked;

    const updatedProject = {
      ...projectRows,
      [projectKey]: updated
    };

    setProjectRows(updatedProject);

    const allChecked = Object.values(updatedProject).every(rows =>
      rows.every(row => row.isChecked)
    );
    if (allChecked) {
      setIsBillableChecked(true);
    }
  };

  // 19/05/2025

  // const handleRowCheckboxChange = (projectKey, rowIndex, e) => {
  //   setProjectRows(prev => {
  //     const updatedRows = [...(prev[projectKey] || [])];
  //     updatedRows[rowIndex] = {
  //       ...updatedRows[rowIndex],
  //       isChecked: e.target.checked
  //     };
  //     return { ...prev, [projectKey]: updatedRows };
  //   });
  // };

 const handleRemarkChange = (projectKey, rowIndex, newRemark) => {
  const updatedRows = { ...projectRows };
  if (updatedRows[projectKey] && updatedRows[projectKey][rowIndex]) {
    updatedRows[projectKey][rowIndex].remark = newRemark;
    setProjectRows(updatedRows);
  }
};


  // const handleSubmit = () => {
  //   const weekStart = weekDays[0].toISOString().split('T')[0];
  //   const weekEnd = weekDays[4].toISOString().split('T')[0];

  //   const payload = {
  //     weekStart,
  //     weekEnd,
  //     projects: projectsData.map((project) => {
  //       const projectKey = `project_${project.projectCode}`;
  //       const rows = projectRows[projectKey] || [];

  //       return {
  //         projectCode: project.projectCode,
  //         projectName: project.projectName,
  //         tasks: rows.map((row) => {
  //           const timeEntries = {};
  //           weekDays.forEach((dayObj) => {
  //             const dayLabel = dayObj.toLocaleDateString('en-GB', { weekday: 'long' });
  //             timeEntries[dayLabel] = row.timeEntries?.[dayLabel] || "";
  //           });

  //           return {
  //             taskCode: row.taskCode,
  //             isBillable: row.isChecked,
  //             remark: row.remark,
  //             timeEntries
  //           };
  //         })
  //       };
  //     })
  //   };

  //   console.log("Final Payload:", payload);

  // };


  // const handleBillableChange = (e) => {
  //   const checked = e.target.checked;
  //   setIsBillableChecked(checked);
  //   const updatedProjectRows = {};
  //   Object.keys(projectRows).forEach(projectKey => {
  //     updatedProjectRows[projectKey] = projectRows[projectKey].map(row => ({ ...row, isChecked: checked }));
  //   });
  //   setProjectRows(updatedProjectRows);
  // };

  const handleTextareaClick = (projectKey, index) => {
    setRemarkIndex({ projectKey, index });
    setSelectedRemark(projectRows[projectKey][index].remark);
    setShowRemarkPopup(true);
  };

  const handleSaveRemark = () => {
    const { projectKey, index } = remarkIndex;
    const updated = [...projectRows[projectKey]];
    updated[index].remark = selectedRemark;
    setProjectRows(prev => ({ ...prev, [projectKey]: updated }));
    setShowRemarkPopup(false);
  };

const handleTimeChange = (projectKey, rowIndex, day, value, event = {}) => {
  value = value.replace(/\D/g, '');

  // Optional key logic if event.key exists
  if (event.key === 'Tab') {
    if (value.length === 1) {
      value = `0${value}:00`;
    }
  } else {
    if (value.length > 4) return;

    if (value.length >= 3) {
      const hours = value.slice(0, 2);
      const minutes = value.slice(2);
      if (+hours > 23 || +minutes > 59) return;
      value = `${hours}:${minutes}`;
    } else if (value.length >= 2) {
      value = `${value.slice(0, 2)}:${value.slice(2)}`;
    }
  }

  // Update time entry
  setProjectRows(prev => {
    const updated = [...prev[projectKey]];
    updated[rowIndex].timeEntries[day] = value;
    return { ...prev, [projectKey]: updated };
  });
};

 



  // 19/05/2025

  //   const handleTimeChange = (projectKey, rowIndex, dayLabel, value) => {
  //   setProjectRows(prev => {
  //     const updatedRows = [...(prev[projectKey] || [])];
  //     const currentRow = { ...updatedRows[rowIndex] };
  //     const newTimeEntries = { ...currentRow.timeEntries, [dayLabel]: value };
  //     currentRow.timeEntries = newTimeEntries;
  //     updatedRows[rowIndex] = currentRow;
  //     return { ...prev, [projectKey]: updatedRows };
  //   });
  // };

  const handleRemoveRow = (projectKey, index) => {
  setProjectRows((prev) => {
    const updatedProjectRows = { ...prev };
    const rows = updatedProjectRows[projectKey];

    // Prevent removal if only one row remains
    if (rows.length <= 1) return prev;

    // Remove the row at the given index
    updatedProjectRows[projectKey] = rows.filter((_, i) => i !== index);
    return updatedProjectRows;
  });

  setShowRemarkPopup(false);
};


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

  // const handleDeleteProject = (projectKey) => {
  //   const updatedProjects = { ...projectRows };
  //   delete updatedProjects[projectKey];
  //   setProjectRows(updatedProjects);

  //   const updatedProjectData = projectsData.filter(
  //     (p) => `project_${p.projectCode}` !== projectKey
  //   );
  //   setProjectsData(updatedProjectData);
  // };


  const handleProjectCheckboxChange = (projectId) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId]
    );
  };
  const handleAddProjects = () => {
    const newProjects = {};

    selectedProjects.forEach((projectId) => {
      if (!projectRows[projectId]) {
        newProjects[projectId] = [
          {
            category: "",
            isChecked: false,
            remark: "",
            timeEntries: {
              Monday: "",
              Tuesday: "",
              Wednesday: "",
              Thursday: "",
              Friday: ""
            }
          }
        ];
      }
    });

    setProjectRows((prev) => ({
      ...prev,
      ...newProjects
    }));

    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const confirmDeleteProject = (projectKey) => {
    setProjectToDelete(projectKey);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (!projectToDelete) return;

    const updatedProjects = { ...projectRows };
    delete updatedProjects[projectToDelete];
    setProjectRows(updatedProjects);

    const updatedProjectData = projectsData.filter(
      (p) => `project_${p.projectCode}` !== projectToDelete
    );
    setProjectsData(updatedProjectData);

    setProjectToDelete(null);
    setDeleteConfirmOpen(false);
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

  Object.values(projectRows).forEach((rows) => {
    rows.forEach((row) => {
      const timeStr = row.timeEntries?.[dayLabel] || '';
      if (timeStr && timeStr.includes(':')) {
        const { hours, minutes } = parseTime(timeStr);
        totalMinutes += hours * 60 + minutes;
      }
    });
  });

  return formatTotalTime(totalMinutes);
};


  const renderRows = (projectKey, title) => {
    if (!projectRows[projectKey]) return null;

    return (
      <>
    {projectRows[projectKey]?.map((row, index) => {
  const isFirstRow = index === 0;
  const isLastRow = index === (projectRows[projectKey].length - 1);
  return (
    <tr key={`${projectKey}-${index}`}>
      {/* Render project title only once with rowspan */}
      {isFirstRow && (
        <td rowSpan={projectRows[projectKey].length} className="project-title-cell pd-padding">
          <div className="project-title">
            <div className="d-flex">
              <div>{title}</div>
              <div title="Delete">
                <DeleteIcon
                  onClick={() => confirmDeleteProject(projectKey)}
                  className="delete-icon"
                />
              </div>
            </div>
          </div>
        </td>
      )}

      {/* Task Dropdown with Add/Remove */}
       <td pd-padding>
        <div className="d-flex-icon">
          <div className="toggle">
            <button className={`toggle-btn ${button === "NB" ? "toggle-btn-NB" : "toggle-btn"}`} onClick={handlebutton}>{button} </button>
            <select
              className="drop-down no-arrow "
              disabled={isTableDisabled}
              value={row.taskCode || ""}
              onChange={(e) =>
                handleTaskChange(projectKey, index, e.target.value)
              }
            >
              <option value="select">Select Task</option>
              {(projectsData.find((p) => `project_${p.projectCode}` === projectKey)?.tasks || []).map((task) => (
                <option key={task.taskCode} value={task.taskCode}>
                  {task.taskName}
                </option>
              ))}
            </select>
          </div>
 
          {projectRows[projectKey].length > 1 && (
            <div className="mr-5">
              <span
                className="remove"
                onClick={() => handleRemoveRow(projectKey, index)}
              >
                <RemoveIcon style={{ fontSize: 15, cursor: "pointer" }} />
              </span>
            </div>
          )}
 
          {isLastRow && (
            <div id="mr-5">
              <span
                title="Add"
                className={`add ${clickedProjects[projectKey] ? "mr-5" : ""}`}
                onClick={() => handleAddRow(projectKey)}
              >
                <AddIcon className="add-icon" />
              </span>
            </div>
          )}
        </div>
      </td>

    

      {/* Remark */}
      <td className="pd-padding">
        <div className="long-textarea">
          <textarea
            className="text-area"
            placeholder="Maximum 500 characters"
            value={row.remark}
            onChange={(e) => handleRemarkChange(projectKey, index, e.target.value)}
            // disabled={isTableDisabled}
            
          />
        </div>
      </td>

      {/* Week Day Inputs */}
     {weekDays.map((dayObj, dayIdx) => {
  const dayLabel = dayObj.toLocaleDateString("en-GB", { weekday: "long" });
  const dayNumber = dayObj.getDay(); // 0 (Sun) to 6 (Sat)
 
  // Add 'orange-border' class for Saturday (6) and Sunday (0)
  const inputClass = dayNumber === 6 || dayNumber === 0
    ? "time-input time orange-border"
    : "time-input time";
 
  return (
    <td key={dayIdx} className="pd-padding">
      <input
        type="text"
        className={inputClass}
        placeholder=""
        maxLength={5}
        value={row.timeEntries?.[dayLabel] || ""}
        onChange={(e) =>
          handleTimeChange(projectKey, index, dayLabel, e.target.value)
        }
        onKeyDown={(e) =>
          handleTimeChange(projectKey, index, dayLabel, e.target.value, e)
        }
      />
 {dayIdx === 0 && (
        <div className="Copy-icon" onClick={() => {
          const value = row.timeEntries?.[dayLabel] || "";
          weekDays.forEach((_, idx) => {
            const day = new Date();
            day.setDate(day.getDate() + idx);
            const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
            handleTimeChange(projectKey, index, dayLabel, value);
          });
        }}>
          <ContentCopyIcon sx={{ fontSize: 10, color: "#033EFF" }} />
        </div>
      )}
 
    </td>
   
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
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="table-section mar-all">
       


        <div className="table-wrapper create-timesheet">
          <table className="your-table-class">
            <thead>

              <tr className="tr-height-first">
                <td className="gray width-30">
                  <div className="d-flex">
                    <div className="pl-8">Projects</div>
                    <div title="Add Project">
                      <span className="adding">
                        <AddIcon style={{ fontSize: 15 }} onClick={handleClickOpen}
                        />
                      </span>
                    </div>
                  </div>
                </td>

                <td className="tas pl-10">Tasks</td>
                {/* <td className="gray width-10">
                <div className="d-flex4">
                  <input
                    type="checkbox"
                    checked={isBillableChecked}
                    onChange={handleBillableChange}
                  />
                  <span className="pl-5">Billable</span>
                </div>
              </td> */}
                <td className="gray width-27 center">Remarks</td>
                <th colSpan={7}>
                  <div className="d-flex1" style={{ gap: "20px" }}>
                    {weekDays.map((day, idx) => (
                      <span key={idx}>{formatDay(day)}</span>
                    ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(projectRows).map(([projectKey, rows]) => {
                const projectCode = projectKey.replace("project_", "");
                const project = projectsData.find(p => p.projectCode === projectCode);
                const title = project ? project.projectName : projectKey;
                return renderRows(projectKey, title);
              })}
            </tbody>

            <tfoot>
              <tr className="tr-height ">
                <td ><div className="billable">
                  <div className="b">B</div>
                  <div className="billing">Billable</div>
                  <div className="nb">NB</div>
                  <div className="nonbill">Non-Billable</div></div></td>
                <td></td>

                <td>Total Hours</td>
                {weekDays.map((dayObj, index) => {
                  const dayLabel = dayObj.toLocaleDateString('en-GB', { weekday: 'long' });
                  return (
                    <td key={index}>
                      <span className={isRejectPage ? "green" : "black"}>
                        {calculateTotalTimePerDay(dayLabel)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        <Dialog open={showRemarkPopup} onClose={() => setShowRemarkPopup(false)}>
          <div className="d-flex">
            <DialogTitle className="custom-dialog-title"> Remark</DialogTitle>


            <DialogActions>
              <div title="Save" className="icon-button success" onClick={handleSaveRemark}>
                <CheckIcon />
              </div>
              <div title="Cancel" className="icon-button danger" onClick={() => setShowRemarkPopup(false)}>
                <CloseIcon />
              </div>



              {/* <Button onClick={() => setShowRemarkPopup(false)}>Cancel</Button> */}
              {/* <Button >Save</Button> */}
            </DialogActions>

          </div>

          <DialogContent>
            <textarea
              ref={textareaRef}
              value={selectedRemark}
              onChange={(e) => setSelectedRemark(e.target.value)}
              maxLength={500}
              rows={5}
              style={{ width: "500px", height: "135px" }}
            />
          </DialogContent>

        </Dialog>

        <Dialog open={open} onClose={handleClose} fullWidth
          maxWidth="xs" >
          <DialogTitle style={{ padding: 0 }} className="" >
            {/* <span style={{ fontSize: '18px' }}>Allocated Projects</span>
          <span onClick={handleClose}><CloseIcon style={{ fontSize: '18px' }} className="close" /></span> */}

            <div className="d-flex bg-light-blue">
              <DialogTitle className="custom-dialog-title"> Allocated Projects</DialogTitle>


              <DialogActions>
                <div title="Yes" className="icon-button " onClick={handleAddProjects}>
                  <CheckIcon className="white-icon" />
                </div>
                <div title="Cancel" className="icon-button " onClick={handleClose}>
                  <CloseIcon className="white-icon" />
                </div>



                {/* <Button onClick={() => setShowRemarkPopup(false)}>Cancel</Button> */}
                {/* <Button >Save</Button> */}
              </DialogActions>

            </div>
          </DialogTitle>
          <DialogContent className="content">

            {ProjectName.map((project, index) => (
              <div key={project}>
                <div className="in">
                  <input
                    type="checkbox"
                    id={project}
                    className="check"
                    checked={selectedProjects.includes(project)}
                    onChange={() => handleProjectCheckboxChange(project)}
                  />
                  <label htmlFor={project} className="project">{project}</label>
                </div>

                {index < ProjectName.length - 1 && <hr className="line" />}
              </div>
            ))}

          </DialogContent>
          {/* <DialogActions sx={{ justifyContent: 'flex-start' }}>

          <Button
            onClick={handleClose}
            className="cancel" sx={{ textTransform: 'capitalize' }}>
            Cancel
          </Button>

          <Button className="ad" sx={{ textTransform: 'capitalize' }} onClick={handleAddProjects}  >Add</Button>

        </DialogActions> */}
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{
          style: {
            width: '400px',
            maxWidth: 'unset',

          }
        }}>
          <DialogTitle style={{ padding: '0' }} className="">

            <div className="d-flex bg-light-blue">
              <DialogTitle className="custom-dialog-title"> Delete</DialogTitle>


              <DialogActions>
                <div title="Yes" className="icon-button " onClick={handleDeleteConfirmed}>
                  <CheckIcon className="white-icon" />
                </div>
                <div title="Cancel" className="icon-button " onClick={() => setDeleteConfirmOpen(false)}>
                  <CloseIcon className="white-icon" />
                </div>
                {/* <Button onClick={() => setShowRemarkPopup(false)}>Cancel</Button> */}
                {/* <Button >Save</Button> */}
              </DialogActions>

            </div>
            {/* <div className="btn-section">
            <div> <span style={{ fontSize: '18px' }}>Confirm</span></div>

            <div>
              <span onClick={handleDeleteConfirmed} className="icon-button success"><CheckIcon /></span>

            </div>
            <div>
              <span onClick={() => setDeleteConfirmOpen(false)} className="icon-button danger"><CloseIcon /></span>

            </div>
          </div> */}
            {/* <div className="btn-section">

            <div> </div>

           <div>
              <DialogActions>
                <div title="Save" className="icon-button success" onClick={handleDeleteConfirmed}>
                  <CheckIcon />
                </div>
                <div title="Cancel" className="icon-button danger" onClick={() => setDeleteConfirmOpen(false)}>
                  <CloseIcon />
                </div>
              </DialogActions>

            </div>
          </div> */}


            {/* <span onClick={() => setDeleteConfirmOpen(false)}><CloseIcon style={{ fontSize: '18px' }} className="close" /></span> */}
          </DialogTitle>
          <DialogContent className="pad-all-20">

            <div className="">
              <div>  Delete this project?</div>



            </div>



          </DialogContent>

          {/* <DialogActions>
       
          <Button  className="cancel"  onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button  className="ad"  onClick={handleDeleteConfirmed} color="error">
            Yes
          </Button>
     
        </DialogActions> */}

        </Dialog>

      </div>
    </>
  );
}

export default TableApprovalTimesheet;
