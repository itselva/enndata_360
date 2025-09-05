import "../Styles/Table.css";
import "../index.css";
import "../Styles/CreateTimesheet.css";
import React, { useState, useRef, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function TableofEditTimeSheet({isRejectPage}) {
  const [isBillableChecked, setIsBillableChecked] = useState(false);
  const [isTableDisabled] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRemarkPopup, setShowRemarkPopup] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState('');
  const [remarkIndex, setRemarkIndex] = useState({ projectKey: '', index: -1 });
  const textareaRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [button,setButton]=useState('B')
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [clickedProjects, setClickedProjects] = useState({});

  const [projectRows, setProjectRows] = useState({
    genAI: [{ category: "", isChecked: false, remark: "", timeEntries: {} }],
    expenseApp: [{ category: "", isChecked: false, remark: "", timeEntries: {} }],
    viseTeam: [{ category: "", isChecked: false, remark: "", timeEntries: {} }],
    internal: [{ category: "", isChecked: false, remark: "", timeEntries: {} }],
    others: [{ category: "", isChecked: false, remark: "", timeEntries: {} }],
  });

   const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    return start;
  };

 const getWeekDays = (startOfWeek) => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
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

   function getWeekDates(currentDate) {
  const date = new Date(currentDate);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
 
  // Calculate how many days to go back to get to Monday (1)
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
    const day = date.getDate();
    const weekday = date.toLocaleString("default", { weekday: "short" });
    return `${day}/${date.getMonth() + 1} ${weekday}`;
  };

  const handlePrevWeek = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 7)));
  const handleNextWeek = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 7)));

  const handleAddRow = (projectKey) => {
    setProjectRows(prev => ({
      ...prev,
      [projectKey]: [...prev[projectKey], { category: "", isChecked: false, remark: "", timeEntries: {} }]
    }));
  };


  const handleCategoryChange = (projectKey, index, value) => {
    const updated = [...projectRows[projectKey]];
    updated[index].category = value;
    setProjectRows(prev => ({ ...prev, [projectKey]: updated }));
  };

  const handleRowCheckboxChange = (projectKey, index, event) => {
    const updated = [...projectRows[projectKey]];
    updated[index].isChecked = event.target.checked;
    const updatedProject = { ...projectRows, [projectKey]: updated };
    setProjectRows(updatedProject);
    const allChecked = Object.values(updatedProject).every(rows => rows.every(row => row.isChecked));
    setIsBillableChecked(allChecked);
  };

  const handleBillableChange = (e) => {
    const checked = e.target.checked;
    setIsBillableChecked(checked);
    const updatedProjectRows = {};
    Object.keys(projectRows).forEach(projectKey => {
      updatedProjectRows[projectKey] = projectRows[projectKey].map(row => ({ ...row, isChecked: checked }));
    });
    setProjectRows(updatedProjectRows);
  };

  const handleTextareaClick = (projectKey, index) => {
    setRemarkIndex({ projectKey, index });
    setSelectedRemark(projectRows[projectKey][index].remark);
    setShowRemarkPopup(true);
  };

  useEffect(() => {
    if (showRemarkPopup && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showRemarkPopup]);

  const handleSaveRemark = () => {
    const { projectKey, index } = remarkIndex;
    const updated = [...projectRows[projectKey]];
    updated[index].remark = selectedRemark;
    setProjectRows(prev => ({ ...prev, [projectKey]: updated }));
    setShowRemarkPopup(false);
  };

  const handleTimeChange = (projectKey, rowIndex, day, value) => {
    value = value.replace(/\D/g, '');
    if (value.length > 4) return;
    let formatted = value;
    if (value.length >= 3) {
      const hours = value.slice(0, 2);
      const minutes = value.slice(2);
      if (+hours > 23 || +minutes > 59) return;
      formatted = `${hours}:${minutes}`;
    }
    setProjectRows(prev => {
      const updated = [...prev[projectKey]];
      updated[rowIndex].timeEntries[day] = formatted;
      return { ...prev, [projectKey]: updated };
    });
  };
const handleRemoveRow = (projectKey, index) => {
  setProjectRows((prev) => {
    const updatedProjectRows = { ...prev };
    // Prevent removal if only one row remains
    if (updatedProjectRows[projectKey].length <= 1) return prev;
    updatedProjectRows[projectKey] = updatedProjectRows[projectKey].filter((_, i) => i !== index);
    return updatedProjectRows;
  });
  setShowRemarkPopup(false);
};

 const handleRemarkChange = (projectKey, rowIndex, newRemark) => {
  const updatedRows = { ...projectRows };
  if (updatedRows[projectKey] && updatedRows[projectKey][rowIndex]) {
    updatedRows[projectKey][rowIndex].remark = newRemark;
    setProjectRows(updatedRows);
  }
};

  const handleClickOpen = () => {
    setOpen(true);
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

  const confirmDeleteProject = (projectKey) => {
    setProjectToDelete(projectKey);
    setDeleteConfirmOpen(true);
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

const handlebutton=()=>{
    setButton(prev=>(prev==='B'?"NB":"B"))
   }

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
    <div className="table-section mar-all">
      <div className="d-flex">
        <p className="sub-title">Projects</p>
       <div
        className="d-flex padding-right-100"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
       
        <div
          onClick={handlePrevWeek}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", }}
        >
          <ChevronLeftIcon />
        </div>
 
        <div className="day-month">
          <div className="pl-5">{monthName}</div>
          <div>
            {/* <span>{monthName} </span> */}
            <span className="ml-5">{weekDays[0].toLocaleDateString("en-GB")} to {weekDays[4].toLocaleDateString("en-GB")}</span>
 
          </div>
        </div>
 
        <div
          onClick={handleNextWeek}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ChevronRightIcon />
        </div>
      </div>
      </div>
      <div className="table-details">
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
          </table>
      </div>

      <Dialog open={showRemarkPopup} onClose={() => setShowRemarkPopup(false)}>
        <DialogTitle>Enter Remark</DialogTitle>
        <DialogContent>
          <textarea
            ref={textareaRef}
            value={selectedRemark}
            onChange={(e) => setSelectedRemark(e.target.value)}
            maxLength={500}
            rows={5}
            style={{ width: "500px",height:"135px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRemarkPopup(false)}>Cancel</Button>
          <Button onClick={handleSaveRemark}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TableofEditTimeSheet;
