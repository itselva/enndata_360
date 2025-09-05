import React, { useState } from 'react'
import Header from "../Components/header";
import { ReactComponent as CreateIcon } from '../assets/Create Timesheet_icon.svg';
import { ReactComponent as ReportIcon } from '../assets/Report_icon.svg';
import TableofCreateTImeSheet from '../Components/TableofCreateTimeSheet';
import "../Styles/Reject.css";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RejectTimesheet = () => {
    const [activeTab, setActiveTab] = useState("create");
    const [activeSubTab, setActiveSubTab] = useState("rejected");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isTableDisabled, setIsTableDisabled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call or async operation
        setTimeout(() => {
            console.log("Form submitted");
            // Optional: reset after complete
            // setIsSubmitting(false);
        }, 2000);
        toast.success('Timesheet Submitted Successfully',{
            toastId:"congrats"
        });
        
       navigate("/EditRejectTimesheet");
    }

    const handleResubmit = () => {

    }
    return (
        <>
            <Header />

            <div className="over-all-bg">
                <div className="Timesheet">
                    <div className="top-header">
                        <span className="top-title">Timesheet</span>
                        <div className="tabs">
                            <div
                                className={`tab ${activeTab === "create" ? "active" : ""}`}
                                onClick={() => setActiveTab("create")}
                            >
                                <div className="icon-box">
                                    <svg width="22" height="22" className={`icon ${activeTab === "create" ? "active-icon" : ""}`} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.7631 2.2881C19.7003 2.21911 19.6242 2.16356 19.5393 2.12482C19.4545 2.08608 19.3626 2.06495 19.2694 2.0627C19.1761 2.06045 19.0834 2.07713 18.9967 2.11174C18.9101 2.14634 18.8314 2.19815 18.7654 2.26404L18.2338 2.79298C18.1694 2.85744 18.1332 2.94484 18.1332 3.03597C18.1332 3.1271 18.1694 3.2145 18.2338 3.27896L18.7211 3.76536C18.753 3.79745 18.791 3.82292 18.8328 3.84029C18.8746 3.85767 18.9195 3.86661 18.9647 3.86661C19.01 3.86661 19.0548 3.85767 19.0967 3.84029C19.1385 3.82292 19.1764 3.79745 19.2084 3.76536L19.7266 3.24974C19.9887 2.98806 20.0132 2.56181 19.7631 2.2881ZM17.1592 3.8672L9.40247 11.6102C9.35545 11.657 9.32126 11.7152 9.30322 11.779L8.94443 12.8477C8.93583 12.8767 8.93522 12.9074 8.94267 12.9368C8.95011 12.9661 8.96532 12.9928 8.98671 13.0142C9.00809 13.0356 9.03485 13.0508 9.06417 13.0583C9.09348 13.0657 9.12426 13.0651 9.15326 13.0565L10.221 12.6977C10.2849 12.6797 10.3431 12.6455 10.3899 12.5985L18.1329 4.84087C18.2045 4.76847 18.2447 4.67073 18.2447 4.56888C18.2447 4.46703 18.2045 4.36929 18.1329 4.29689L17.7053 3.8672C17.6328 3.79491 17.5346 3.75432 17.4323 3.75432C17.3299 3.75432 17.2317 3.79491 17.1592 3.8672Z" fill="currentColor"></path><path d="M16.6005 8.32133L11.3631 13.5691C11.1606 13.772 10.9119 13.9226 10.6382 14.0078L9.52531 14.3804C9.2612 14.4549 8.98197 14.4578 8.7164 14.3885C8.45084 14.3193 8.20854 14.1804 8.01448 13.9864C7.82042 13.7923 7.68161 13.55 7.61236 13.2845C7.54311 13.0189 7.54592 12.7397 7.62051 12.4755L7.99305 11.3627C8.07805 11.0891 8.22832 10.8403 8.4309 10.6378L13.6787 5.39945C13.7268 5.3514 13.7595 5.29017 13.7728 5.22349C13.7861 5.15682 13.7794 5.08769 13.7534 5.02486C13.7274 4.96204 13.6834 4.90833 13.6269 4.87053C13.5703 4.83272 13.5039 4.81253 13.4359 4.8125H4.46875C3.83057 4.8125 3.21853 5.06602 2.76727 5.51727C2.31602 5.96853 2.0625 6.58057 2.0625 7.21875V17.5312C2.0625 18.1694 2.31602 18.7815 2.76727 19.2327C3.21853 19.684 3.83057 19.9375 4.46875 19.9375H14.7812C15.4194 19.9375 16.0315 19.684 16.4827 19.2327C16.934 18.7815 17.1875 18.1694 17.1875 17.5312V8.5641C17.1875 8.49611 17.1673 8.42966 17.1295 8.37314C17.0917 8.31663 17.038 8.2726 16.9751 8.24661C16.9123 8.22062 16.8432 8.21385 16.7765 8.22715C16.7098 8.24045 16.6486 8.27323 16.6005 8.32133Z" fill="currentColor"></path></svg>
                                    {/* <CreateIcon className={`icon ${activeTab === "create" ? "active-icon" : ""}`} /> */}
                                </div>
                                <span className="tab-text">Create Timesheet</span>
                            </div>

                            <div
                                className={`tab ${activeTab === "report" ? "active" : ""}`}
                                onClick={() => setActiveTab("report")}
                            >
                                <div className="icon-box">
                                    <ReportIcon className={`icon ${activeTab === "report" ? "active-icon" : ""}`} />
                                </div>
                                <span className="tab-text">Reports</span>
                            </div>
                        </div>
                    </div>

                    {activeTab === 'create' && (
                        <>
                            <div className="sub-tab-tabs">

                                <div
                                    className={`sub-tab filled-tab ${activeSubTab === "currentWeek" ? "active-tab" : ""}`}
                                    onClick={() => setActiveSubTab("currentWeek")}
                                >
                                    Current Week
                                </div>

                                <div
                                    className={`sub-tab filled-tab ${activeSubTab === "notSubmitted" ? "active-tab" : ""}`}
                                    onClick={() => setActiveSubTab("notSubmitted")}
                                >
                                    Not Submitted - <span>5</span>
                                </div>

                                <div
                                    className={`sub-tab filled-tab ${activeSubTab === "rejected" ? "active-tab" : ""}`}
                                    onClick={() => setActiveSubTab("rejected")}
                                >
                                    Rejected
                                </div>

                            </div>


                            {/* <div className='reject'>
                              <h5 className='reject-title'>Rejection Comments</h5>
                              <p className='reject-des'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                          </div> */}

                            <div className="custom-warning">
                                <strong className="custom-warning-title">Rejection Comments</strong>
                                <p className="custom-warning-text">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
                                </p>
                            </div>
                            {(activeSubTab === "currentWeek" || activeSubTab === "notSubmitted" || activeSubTab === "rejected") && (


                                <TableofCreateTImeSheet isRejectPage={true} isTableDisabled={isTableDisabled} />

                            )}


                            <div className="action-buttons">
                                <button
                                    className="submit-btn"
                                    onClick={handleSubmit}
                                    disabled={isSubmitted}
                                    style={{ display: isSubmitted ? 'none' : 'block' }}
                                >
                                    Submit
                                </button>
                                {/* <button
                                    className="withdraw-btn"
                                    onClick={handleResubmit}
                                    style={{ display: isSubmitted ? 'block' : 'none' }}
                                >
                                    Re-Submit
                                </button> */}
                            </div>

                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default RejectTimesheet;
