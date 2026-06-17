from app.api.home_shared import router_home

from app.api import home_catalog as _home_catalog  # noqa: F401
from app.api import home_dashboard as _home_dashboard  # noqa: F401
from app.api import home_operations as _home_operations  # noqa: F401
from app.api import home_support as _home_support  # noqa: F401

__all__ = ["router_home"]
