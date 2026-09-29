import asyncio
import json
import os
from urllib.parse import quote
from urllib.request import Request, urlopen


class IpGeolocationService:
    _TIMEOUT_SECONDS = 3

    async def lookup(self, ip_address: str | None) -> tuple[float, float] | None:
        if not ip_address:
            return None
        provider_url = os.getenv("IP_GEOLOCATION_URL", "https://ipapi.co/{ip}/json/")
        request = Request(
            provider_url.format(ip=quote(ip_address, safe="")),
            headers={"User-Agent": "TutITam/1.0"},
        )
        try:
            payload = await asyncio.to_thread(self._fetch, request)
        except Exception:
            return None
        latitude = payload.get("latitude")
        longitude = payload.get("longitude")
        if isinstance(latitude, (int, float)) and isinstance(longitude, (int, float)):
            return float(latitude), float(longitude)
        return None

    def _fetch(self, request: Request) -> dict:
        with urlopen(request, timeout=self._TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read())
        return payload if isinstance(payload, dict) else {}
