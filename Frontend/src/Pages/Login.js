// export default Login;
import { useState } from 'react';
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import ennveeLogo from '../assets/Ennvee_logo.svg';
import "../Styles/login.css";
import { ToastContainer, toast } from 'react-toastify';
import Visibility from '@mui/icons-material/Visibility';
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
function Login() {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const dropdownRef = useRef();
  // const [isOpen,setIsOpen]=useState(false)
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
    password: false
  })
  // const options = [
  //   { value: "employee", label: "Employee" },
  //   { value: "contractor", label: "Contractor" },
  //   { value: "intern", label: "Intern" },
  // ];
  const [step, setStep] = useState(1);
  const [showForgot, setShowForgot] = useState(false);
  // const [userType, setUserType] = useState("");

  // useEffect(() => {
  //   localStorage.clear();
  //   const handleClickOutside = (e) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
  //       setIsOpen(false);
  //     }
  //   };
 
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);
  const handleLogin = async () => {
    setLoading(true)
    if (!email || !password) {
      setError('Please enter both username and password.');
      setLoading(false)
      return;
    }
    // if (!email || !userType) {
    //   setError("Please enter email and select user type");
    //   setLoading(false)
    //   return;
    // }

    // Regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const netRegex = /^[^\s@]+@[^\s@]+\.(net)$/i;
    // const comRegex = /^[^\s@]+@[^\s@]+\.(com)$/i;

    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      setLoading(false)
      return;
    }

    // if (userType === "employee" && !netRegex.test(email)) {
    //   setError("Please enter correct email-id");
    //   setLoading(false)
    //   return;
    // }

    // if ((userType === "contracter" || userType === "intern") && !comRegex.test(email)) {
    //   setError("Please enter correct email-id");
    //   setLoading(false)
    //   return;
    // }


    setError("");


    try {
      let BodyData = {
        email,
        password
      }
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
        method: "POST",
        body: JSON.stringify(BodyData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
        if(response.headers.get('Refresh-Token')){
          localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
        }
      const emp_name = responseData?.emp_name;
      const emp_id = responseData?.emp_id || responseData?.user?.emp_id;
      const emp_code = responseData?.emp_code || responseData?.user?.emp_code;
      const managerReportees = responseData?.Manager_Reportees;
      const access_token = responseData?.access_token;

      if (response.status === 200 && emp_id) {
        const now = Date.now(); // current time in ms
        const expiresInMinutes = 10;

        // Store login details
        localStorage.setItem("emp_id", emp_id);
        localStorage.setItem("emp_name", emp_name);
        localStorage.setItem("emp_code", emp_code);
        localStorage.setItem("login_time", now.toString());
        localStorage.setItem("session_expiry_minutes", expiresInMinutes.toString());
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user_role', responseData?.user_role)
        localStorage.setItem('work_location', responseData?.work_location)
        localStorage.setItem('department', responseData?.department)
        localStorage.setItem('min_hours',responseData?.min_hours)
        localStorage.setItem('export',responseData?.export)
        localStorage.setItem('launch_date',responseData?.launch_date)
        localStorage.setItem('permissions',responseData?.permissions)
        localStorage.setItem('show_not_submit', true)
        if (['Manager', 'Time Keeper', 'PMO', 'Admin'].includes(responseData?.user_role)) {
          localStorage.setItem("isManager", "true");
          localStorage.setItem('show_approval', true)
        } else {
          localStorage.setItem("reportees", JSON.stringify([]));
          localStorage.setItem("isManager", "false");
        }

        navigate('/CreateTimesheet');
      } else {
        setError("Invalid credentials.");
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    handleLogin();
  };

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      if (!email.trim()) {
        toast.error("Please enter your email",{
          toastId:"enter email"
        });
        setLoading(false)
        return;
      }
      let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

      if (!emailRegex.test(email)) {
        setError("Invalid email format");
        setLoading(false)
        return;
      }
      setError('')
      let formData = new FormData()
      formData.append('email', email)

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/forget_password`, {
        method: "POST",
        body: formData,
      })
      const responseData = await response.json()
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 200) {
        setStep(2);
        toast.success(responseData?.message,{
          toastId:"response-datas"
        })
      } else {
        toast.error(responseData?.detail,{
          toastId:"send-otperror"
        })
        setemail('')
      }
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
      // alert(err.response.data.message);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      if (!otp.trim()) {
        toast.error("Please enter the OTP", { theme: "light" },{toastId:"enter-otp"});
        setLoading(false)
        return;
      }

      if (!/^\d{4}$/.test(otp)) {
        toast.error("OTP must be exactly 4 digits", { theme: "light" },{
          toastId:"otp must be"
        });
        setLoading(false)
        return;
      }
      let formData = new FormData()
      formData.append('email', email)
      formData.append('otp', otp)

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/verify_otp`, {
        method: "POST",
        body: formData,
      })
      const responseData = await response.json()
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 200) {
        console.log(responseData.message)
        setStep(3);
        toast.success(responseData?.message,{
          toastId:"resposense-data-successs"
        })
      } else {
        toast.error(responseData?.detail,{
          toastId:"verifyotperror"
        })
        setemail('')
        setOtp('')
      }
      setLoading(false)
      // setStep(3);
    } catch (err) {
      console.log('erro', err)
      setLoading(false)
      // alert(err.response.data.message);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true)
    try {
      if (!newPassword.trim() && !confirmPassword.trim()) {
        toast.error("Please enter both New Password and Confirm Password", { theme: "light" },{toastId:"please-enter-both-new-and-confirm"
        });
        setLoading(false)
        return;
      }

      if (newPassword.trim() && !confirmPassword.trim()) {
        toast.error("Please confirm your password", { theme: "light" },{
          toastId:"confirm-pwd"
        });
        setLoading(false)
        return;
      }

      if (!newPassword.trim() && confirmPassword.trim()) {
        toast.error("Please enter a new password", { theme: "light" },{
          toastId:"enter-new"
        });
        setLoading(false)
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match", { theme: "light" },{
          toastId:"pwd-not-match"
        });
        setLoading(false)
        return;
      }

      let formData = new FormData()
      formData.append('email', email)
      formData.append('new_password', newPassword)
      formData.append('confirm_password', confirmPassword)

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reset_password`, {
        method: "POST",
        body: formData,
      })
      const responseData = await response.json()
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if (response.status === 200) {
        console.log(responseData.message)
        setemail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setShowForgot(false);
        setStep(1);
      }
      toast.success(responseData?.message,{
        toastId:"reset-success"
      })
      setLoading(false)
    } catch (err) {
      console.log('err', err)
      setLoading(false)
      // alert(err?.response?.data?.message || "Error resetting password");
    }
  };

  const toggleShowPassword = (prop) => () => {
    setShowPassword((prev) => ({ ...prev, [prop]: !prev[prop] }));
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

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
      <div className="login-container">
        <div className="container" style={{ textAlign: 'center', }}>
          <div className="login-box" style={{ maxWidth: 400, margin: 'auto' }}>
            <img src={ennveeLogo} alt="Login Banner" className="login-banner" />
            {error && <p style={{ color: 'red' }}>{error}</p>}


            {/* Login Form */}
            {!showForgot && (
              <>
           {/* <div className='user-type'>
    Login as : &nbsp;
    <div
      className="user-drop-wrapper"
      onMouseEnter={() => setIsOpen(true)}
       onBlur={() => setIsOpen(false)}
       ref={dropdownRef}
     
    >
      <div className="user-drop-display">
        {userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : "User Type"}
      </div>
      {isOpen && (
       <div className="user-drop-options">
          <div  onClick={() => {
          setUserType("employee");
          setIsOpen(false);
        }}  className={`user-option ${userType === "employee" ? "selected-option" : ""}`}
        >Employee</div>
          <div onClick={() => {
          setUserType("contractor");
          setIsOpen(false);
        }}  className={`user-option ${userType === "contractor" ? "selected-option" : ""}`}>Contractor</div>
          <div onClick={() => {
          setUserType("intern");
          setIsOpen(false);
        }}  className={`user-option ${userType === "intern" ? "selected-option" : ""}`}>Intern</div>
        </div>
      )}
    </div>
  </div> */}
                <form onSubmit={handleSubmit}>
                  <div className='grid-gap'>
                    <TextField
                      label="Email ID"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontFamily: 'Mulish',
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: 'Mulish',
                        }
                      }}
                    />
                    <TextField
                      label="Password"
                      type={showPassword.password ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontFamily: 'Mulish',
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: 'Mulish',
                        }
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleShowPassword("password")}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                aria-label="toggle password visibility"
                              >
                                {showPassword.password ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      style={{ marginTop: '20px', fontFamily: 'Mulish', }}
                      disabled={loading}
                    >
                      Login
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Forgot Password Link or Flow */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              {!showForgot ? (
                <div
                  className="forgotpassword"

                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </div>
              ) : (
                <div style={{ marginTop: '20px' }}>
                  {/* <div>Forgot Password</div> */}

                  {step === 1 && (
                    <>
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => {
                          setError('')
                          setemail(e.target.value)
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'Mulish',
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Mulish',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ marginTop: '20px', fontFamily: 'Mulish', cursor: loading ? 'wait' : 'pointer', }}
                        onClick={handleSendOtp}
                        disabled={loading}
                      >
                        Send OTP
                      </Button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <TextField
                        label="Enter OTP"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                        type="text"
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'Mulish',
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Mulish',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ marginTop: '20px', fontFamily: 'Mulish' }}
                        onClick={handleVerifyOtp}
                        disabled={loading}
                      >
                        Verify OTP
                      </Button>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="password-section">

                        <Tooltip
                          title="Password must be 8 to 15 characters and include a special character like @#$."
                          arrow
                          slotProps={{
                            tooltip: { className: "tooltip" }
                          }}
                        >
                          <IconButton className="password-info-icon" size="small">
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>

                      <TextField
                        label="New Password"
                        type={showPassword.newPassword ? "text" : "password"}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <>

                                  <IconButton
                                    onClick={toggleShowPassword("newPassword")}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    aria-label="toggle password visibility"
                                  >
                                    {showPassword.newPassword ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                </>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'Mulish',
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Mulish',
                          }
                        }}
                      />


                      <TextField
                        label="Confirm Password"
                        type={showPassword.confirmPassword ? "text" : "password"}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={toggleShowPassword("confirmPassword")}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                  aria-label="toggle password visibility"
                                >
                                  {showPassword.confirmPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'Mulish',
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Mulish',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ marginTop: '20px', fontFamily: 'Mulish' }}
                        onClick={handleResetPassword}
                        disabled={loading}
                      >
                        Reset Password
                      </Button>
                    </>
                  )}

                  {/* Option to go back to login */}
                  <div
                    style={{ marginTop: '20px', color: 'gray', cursor: 'pointer', fontFamily: 'Mulish' }}
                    onClick={() => {
                      setShowForgot(false);
                      setStep(1);
                    }}
                  >
                    ← Back to Login
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

}

export default Login;

