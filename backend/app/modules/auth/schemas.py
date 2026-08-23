from pydantic import BaseModel, Field
from app.database.models.user import UserRole

class UserRegister(BaseModel):
    name: str
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.RESIDENT

class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole

    class Config:
        from_attributes = True