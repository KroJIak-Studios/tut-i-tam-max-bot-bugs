from pydantic import BaseModel, ConfigDict, Field


class AdminLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    password: str = Field(min_length=1, max_length=512)


class AdminRefresh(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str = Field(min_length=1, max_length=512)


class AdminTokens(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    refresh_expires_in: int


class AdminSession(BaseModel):
    authenticated: bool = True
    expires_in: int


class AdminStats(BaseModel):
    events: "AdminEventStats"
    users: "AdminUserStats"


class AdminEventStats(BaseModel):
    total: int
    official: int
    user_created: int


class AdminUserStats(BaseModel):
    total: int
