import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import EditTImeSheet from "./Pages/EditTimesheet";
import RejectTimesheet from "./Pages/RejectTimesheet";
import EditRejectTimesheet from "./Pages/EditRejectTimesheet";
import Approvetable from "./Pages/Approvetable";
import CreateTimesheet from "./Pages/CreateTimesheet";
import ApprovalList from './Pages/ApprovalList';
import ViewTimeSheet from './Pages/ViewTimeSheet';
// import Approve from './Pages/Approve'; // Make sure to import your Approve component
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/mulish';
import  PrivateRoute  from './Components/privateRoute';
import ChangePassword from "./Pages/ChangePassword";
import LeaveUpload from "./Pages/LeaveUpload";
import Reports from "./Pages/Reports";
function App() {
  return (
    <Router>
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
        theme="colored"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
 
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/CreateTimesheet"
          element={
            <PrivateRoute>
              <CreateTimesheet />
            </PrivateRoute>
          }
        />
        <Route
          path="/EditTimesheet"
          element={
            <PrivateRoute>
              <EditTImeSheet />
            </PrivateRoute>
          }
        />
        <Route
          path="/RejectTimesheet"
          element={
            <PrivateRoute>
              <RejectTimesheet />
            </PrivateRoute>
          }
        />
        <Route
          path="/EditRejectTimesheet"
          element={
            <PrivateRoute>
              <EditRejectTimesheet />
            </PrivateRoute>
          }
        />
        <Route
          path="/Approvetable"
          element={
            <PrivateRoute>
              <Approvetable />
            </PrivateRoute>
          }
        />
        <Route
          path="/ApprovalList"
          element={
            <PrivateRoute>
              <ApprovalList />
            </PrivateRoute>
          }
        />
          <Route
          path="/ViewTimeSheet"
          element={
            <PrivateRoute>
              <ViewTimeSheet />
            </PrivateRoute>
          }

        />
        <Route
          path="/ChangePassword"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route
          path="/ApprovalList"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
        path="/LeaveCalendar"
        element={
          <PrivateRoute>
            <LeaveUpload/>
          </PrivateRoute>
        }></Route>
         {/* <Route path="/ViewTimeSheet" element={ <PrivateRoute><ViewTimeSheet /></PrivateRoute>} /> */}
      </Routes>
    </Router>
  );
}
 
export default App;

















