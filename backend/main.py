from fastapi import FastAPI, Form, HTTPException, Request, Body, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import logging
from services import *
import uvicorn
from db_services import *


DEBUG_MODE = True
EXEMPT_PATHS = ["/login", "/refresh_token","/forget_password","/verify_otp","/reset_password"]

# Custom Middleware
class AuthLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        print("Incoming path:", path)
        print("EXEMPT_PATHS:", EXEMPT_PATHS)
        if path in EXEMPT_PATHS:
            return await call_next(request)

        secure_key = request.headers.get("Authorization")
        print("SecureKey:", secure_key)
        

        if not secure_key:
            return JSONResponse(content={"error": "Secure key missing"}, status_code=401)
        try:
            user_id, user_name, login_time, session_state, user_role = decode_token_service(secure_key)
        except Exception as e:
            logging.error(f"Token decoding error: {e}")
            return JSONResponse(content={"error": "Invalid secure key"}, status_code=401)
        
        print("Decoded emp_id:", user_id)
        print("Decoded login_time:", login_time)        
        print("Decoded session_state:", session_state)
        print("Decoded user_role:", user_role)

        if not session_state:
            return JSONResponse(
                content={
                    "error": "Session expired"
                },
                status_code=401
            )
        request.state.emp_id = user_id
        request.state.login_time = login_time
        request.state.session_state = session_state
        request.state.user_role = user_role
        request.state.user_name = user_name

        # if not check_api_access(user_role, SessionLocal(), path):
        #     return JSONResponse(
        #         content={"error": f"Access to {path} denied for role '{user_role}'"},
        #         status_code=403
        #     )
        response = await call_next(request)
        new_refresh_token = create_token(user_id, user_name, user_role)
        response.headers["Refresh-Token"] = new_refresh_token
        return response


app = FastAPI()
app.add_middleware(AuthLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # ✅ Allow all origins
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],   
    expose_headers=["Refresh-Token"]       # Allow all headers
)


@app.post("/login")
def login(auth: AuthRequest):
    print(auth)
    db = SessionLocal()
    try:
        login_status, access_token, user_id, user_name, user_role = authenticate_reportees(auth, db)
        # try:
        #     emp_permissions = fetch_role_permissions(user_role, db)
        # except Exception as e:
        #     logging.error(f"Error fetching role permissions: {e}")
        #     emp_permissions = []
        # try:
        #     emp_settings = fetch_setting( db)
        # except Exception as e:
        #     logging.error(f"Error fetching settingss: {e}")
        #     # emp_permissions = []
        if login_status:
            # if reportees:
            #     manager_reportees = [
            #         {"employee_id": emp.employee_id, "employee_name": emp.employee_name}
            #         for emp in reportees
            #     ]
            return {
                "status": True,
                "message": "User authenticated",
                "user_id": user_id,
                "user_name": user_name,
                "access_token": access_token,
                # "date_of_joining": date_of_joining,
                # "department": department,
                # "work_location": work_location,
                "user_role": user_role
            }
        else:
            
            return {
                "status": False,
                "message": "Invalid credentials"
            }
 
    except Exception as e:
        logging.error(f"Error during login: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()


if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
