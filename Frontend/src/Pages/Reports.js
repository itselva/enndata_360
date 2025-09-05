import React, { useEffect, useState, useRef } from "react";
import Select from 'react-select';
import { selectCustomStyles, selectCustomStylesRevert } from "../Components/selectCustomStyles";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { components } from 'react-select';
import "../Styles/reports.css";
function Reports() {
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
      <div className="report-page">
        <div className="form-grid">
          <div className="label">
            <label>From Date:</label>
            <input className="date-inputs" type="date" />
          </div>
          <div className="label">
            <label>To Date:</label>
            <input className="date-inputs" type="date" />
          </div>
          <div className="label">
            <label>Employee:</label>
            <Select
              styles={selectCustomStyles}
              closeMenuOnSelect={true}
              hideSelectedOptions={false}
              placeholder="Select"
              name="employee-select"
              inputId="employee-select"
              components={{ DropdownIndicator }}
            />
          </div>
          <div className="label">
            <label>Customer:</label>
            <Select
              styles={selectCustomStyles}
              closeMenuOnSelect={true}
              hideSelectedOptions={false}
              placeholder="Select"
              name="customer-select"
              inputId="customer-select"
              components={{ DropdownIndicator }}
            />
          </div>
          <div className="label">
            <label>Ticket:</label>
            <Select
              styles={selectCustomStyles}
              closeMenuOnSelect={true}
              hideSelectedOptions={false}
              placeholder="Select"
              name="ticket-select"
              inputId="ticket-select"
              components={{ DropdownIndicator }}
            />
          </div>
          <div className="label">
            <label>Timesheet Status:</label>
            <Select
              styles={selectCustomStyles}
              closeMenuOnSelect={true}
              hideSelectedOptions={false}
              placeholder="Select"
              name="status-select"
              inputId="status-select"
              components={{ DropdownIndicator }}
            />
          </div>
          <div className="label">
            <label>Employee (Again):</label>
            <Select
              styles={selectCustomStyles}
              closeMenuOnSelect={true}
              hideSelectedOptions={false}
              placeholder="Select"
              name="employee-select-2"
              inputId="employee-select-2"
              components={{ DropdownIndicator }}
            />
          </div>
          <div className="button-preview">
            <button className="cancel-btn" >
              Preview
            </button>
          </div>
        </div>
      </div>
      <div className="reports-list">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Ticket</th>
              <th>Project</th>
              <th>Duration</th>
              <th>Task</th>
              <th>Billing Type</th>
              <th>Ticket Description</th>
              <th>Remarks</th>
              <th>Line of Business</th>
              <th>Customer</th>
              <th>Chargeable(Yes/No)</th>
              <th>Reporting Manager</th>
              <th>Department</th>
              <th>Approver</th>
              <th>Approver Remarks</th>
              <th>Rejected By</th>
              <th>Netsuite Flag</th>
              <th>Billable hours</th>
              <th>Rejection Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="20">
                <div className="noProject">No Data Available</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
     <div style={{display:'flex',justifyContent:'flex-end' ,alignItems:'center',gap:'10px' ,padding:'10px'}}>
       <Select
                          // value={selectedRevert}
                          // onChange={handleRevertChanges}
                          // options={revertActionOptions}
                          styles={selectCustomStyles}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder="Select"
                          name='revert-action-select'
                          inputId='revert-action-select'
                          components={{ DropdownIndicator }}
                        />
                        <button  className="cancel-btn" >Send Mail</button>
     </div>
    </>
  )
}

export default Reports;