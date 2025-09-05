/* eslint-disable no-undef */
import "../Styles/ChangePassword.css";
import Header from "../Components/header";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from "react-router-dom";

function ChangePassword() {
    const navigate = useNavigate();
    const accessToken=localStorage.getItem('access_token');
    const [values, setValues] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // For each field, track whether to show password
    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [loading,setLoading]=useState(false);

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const toggleShowPassword = (prop) => () => {
        setShowPassword((prev) => ({ ...prev, [prop]: !prev[prop] }));
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSubmit = async(e) => {
        setLoading(true)
        try{
        e.preventDefault();
        const regex = /^[A-Za-z0-9@#$]{8,15}$/;
        if (!regex.test(values.newPassword)) {
            toast.error('Check Password format',{
                toastId:"checkpwdformat"
            })
            setLoading(false)
            return
        }

        // Step 2: Send everything to backend (don't check match or regex in frontend now)
        let formData = new FormData();
        formData.append('old_password', oldPassword);
        formData.append('new_password', newPassword);
        formData.append('confirm_password', confirmPassword);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/change_password`, {
        method: "POST",
        body: formData,
        headers: {
                    "Authorization": `${accessToken}`
                },
      })
      const responseData = await response.json()
       if(response.headers.get('Refresh-Token')){
        localStorage.setItem('access_token', response.headers.get('Refresh-Token'));
      }
      if(response.status === 401){
        toast.error('Session expired',{
          onClose: () => window.location.reload(),
          toastId:"pwd-session"
        })
      }
      if (response.status === 200 ) {
           toast.success('Password Changed successfully',{
            toastId:"pwd-change-success"
           })
      }else{
        toast.error(responseData?.error,{
            toastId:"pwd-error"
        })
      }
       setValues({
         oldPassword: "",
        newPassword: "",
        confirmPassword: "",
       })
        // 
        setLoading(false)

    }catch(err){
        console.log(err)
    }
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
            <Header />


            <div className="over-all-bg-input">
                <div className="title" onClick={() => navigate('/CreateTimesheet')} style={{ cursor: 'pointer' }}>
                    <HomeIcon />
                </div>
                <div className="title"  >
                    Change Password
                </div>

                <div className="container-input">

                    <form className="page " onSubmit={handleSubmit}>
                        <div className='grid-gap-input'>
                            <TextField
                                label="Old Password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                type={showPassword.oldPassword ? "text" : "password"}
                                value={values.oldPassword}
                                onChange={handleChange("oldPassword")}
                                style={{ fontFamily: 'Mulish' }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={toggleShowPassword("oldPassword")}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    aria-label="toggle password visibility"
                                                >
                                                    {showPassword.oldPassword ? <Visibility /> : <VisibilityOff />}
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

                            <TextField
                                label="New Password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                type={showPassword.newPassword ? "text" : "password"}
                                value={values.newPassword}
                                onChange={handleChange("newPassword")}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={toggleShowPassword("newPassword")}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    aria-label="toggle password visibility"
                                                >
                                                    {showPassword.newPassword ? <Visibility /> : <VisibilityOff />}
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

                            <TextField
                                label="Confirm Password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                type={showPassword.confirmPassword ? "text" : "password"}
                                value={values.confirmPassword}
                                onChange={handleChange("confirmPassword")}
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
                                type="submit"
                                variant="contained"
                                fullWidth
                                style={{ marginTop: '20px', fontFamily: 'Mulish' }}
                                disabled={loading}
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                    <div style={{ marginTop: '25px' }}>
                        <h3 className='text-h'>Password Format:</h3>
                        <p className='text-p'>1.Minimum 8 character and Max 15 character</p>
                        <p className='text-p'>2.Special character allowed - @#$ </p>
                        {/* <p className='text-p'>3.</p> */}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChangePassword; 