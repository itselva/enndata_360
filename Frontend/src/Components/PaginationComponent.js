import React from "react";
import "../Styles/Table.css";

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalRecords,
}) => {
  const generatePageSizes = () => [5, 10, 15, 20, 50, 100];
  const startEntry = (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, totalRecords);

  return (
    <div style={{ width: "100%" }}>
      {/* ✅ Top-right: Total Records */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
          marginRight:"8px",
          fontSize: "14px",
        }}
      >
       <strong>Total Records :</strong>&nbsp;&nbsp;{totalRecords}
      </div>

      <div
        className="pagination-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          width: "100%",
          marginTop: "1rem",
        }}
      >
        {/* Left: (remove this or keep blank since it's moved above) */}
        <span className="total-records" style={{ fontSize: "14px" }}>
          {/* You can leave this empty or remove it */}
        </span>

        {/* Right: Controls */}
        <div
          className="pagination-controls"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <label>
            Record(s):
            <select
              value={rowsPerPage}
              onChange={(e) => {
                onRowsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              style={{ marginLeft: "0.5rem", padding: "2px 6px" }}
            >
              {generatePageSizes().map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
            &laquo;
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationComponent;
