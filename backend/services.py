
import jwt
from dotenv import load_dotenv
import os
import logging
from db_services import *
from db_services import SessionLocal, DimUser, RoleMaster
import hashlib
from datetime import datetime, date, timedelta
load_dotenv()


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def authenticate_reportees(auth, db):
        hashed_password = hash_password(auth.password)

        user = db.query(DimUser).filter(
            DimUser.email_id == auth.email,
            DimUser.password == hashed_password
        ).first()
        print("user", user)
        try:
            user_id = user.user_id
            user_name = user.user_name
            user_role = user.role.role_name

        except Exception as e:
            return {"status": False, "message": "Invalid username or password"}   

        if user_id and user_name:
            access_token = create_token(user_id, user_name, user_role)
            print("Token created:", access_token)
            # emp_id = user.employee_id
            # emp_name = user.employee_name
            # print('emp_id', emp_id)
            # reportees = db.query(EmployeeMaster).filter(EmployeeMaster.manager_id == emp_id).all()
            login_status = True
        else:   
            access_token = None
            login_status = False
            # reportees = None
            # emp_id = None   
            # emp_name = None
    
        if not user:
            return {"status": False, "message": "Invalid username or password"}
        
        return login_status, access_token, user_id, user_name, user_role
       
def decode_token_service(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return decoded.get("user_id"), decoded.get("user_name"), decoded.get("login_time"), decoded.get("session_active"), decoded.get("user_role")
    except jwt.ExpiredSignatureError:
        return None, None, None, False, None 
    except jwt.InvalidTokenError:
        return None, None, None, False, None  
    except Exception as e:
        logging.error(f"Unexpected error decoding token: {e}")
        return None, None, None, False, None  
    

def create_token(user_id: str, user_name : str, user_role: str):
    db = SessionLocal()
    payload = {
        "user_id": user_id,
        "user_name": user_name,
        "login_time": datetime.now().isoformat(),
        "session_active": True,
        "user_role": user_role,
        "exp": datetime.utcnow() + timedelta(minutes=60)
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token