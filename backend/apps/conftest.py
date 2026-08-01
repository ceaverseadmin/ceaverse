import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _db_enabled(db):
    """Enable database access for every test in the suite."""
    yield db


@pytest.fixture(autouse=True)
def _clear_cache():
    """Reset throttling counters (locmem cache) between tests."""
    cache.clear()
    yield
    cache.clear()
