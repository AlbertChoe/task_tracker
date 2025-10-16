from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, Session
from ..core.security import verify_password, create_access_token
from .schemas import LoginInput, TokenOut, MeOut
from ..db import User, get_session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenOut)
def login(payload: LoginInput, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token}

@router.get("/me", response_model=MeOut)
def me(user_id: str, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email, "name": user.name, "role": user.role}
