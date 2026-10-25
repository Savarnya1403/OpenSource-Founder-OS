from __future__ import annotations
import asyncio
import json
import base64
import httpx
from datetime import datetime, timezone


def _get_settings():
    from app.core.config import get_settings
    return get_settings()


GITHUB_API = "https://api.github.com"
_FALLBACK_STORE: list[dict] = []  # in-memory fallback for local dev without token
_write_lock = asyncio.Lock()       # serialise concurrent writes within a single invocation


def _headers(token: str) -> dict:
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


async def _ensure_branch(token: str, owner: str, repo: str, branch: str) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/ref/heads/{branch}",
            headers=_headers(token),
        )
        if r.status_code == 200:
            return
        # Branch doesn't exist — create from main
        r2 = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/ref/heads/main",
            headers=_headers(token),
        )
        main_sha = r2.json()["object"]["sha"]
        await client.post(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/refs",
            json={"ref": f"refs/heads/{branch}", "sha": main_sha},
            headers=_headers(token),
        )


async def _read_file(token: str, owner: str, repo: str, branch: str, path: str):
    """Returns (content_list, sha) or ([], None) if file missing."""
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            params={"ref": branch},
            headers=_headers(token),
        )
        if r.status_code == 404:
            return [], None
        data = r.json()
        # GitHub may return list if path is a dir — guard against it
        if isinstance(data, list):
            return [], None
        sha = data["sha"]
        raw = base64.b64decode(data["content"]).decode()
        return json.loads(raw), sha


async def _write_file(
    token: str, owner: str, repo: str, branch: str, path: str,
    content: list, sha: str | None, message: str
) -> None:
    encoded = base64.b64encode(
        json.dumps(content, indent=2, default=str).encode()
    ).decode()
    payload: dict = {"message": message, "content": encoded, "branch": branch}
    if sha:
        payload["sha"] = sha
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.put(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            json=payload,
            headers=_headers(token),
        )
        if r.status_code not in (200, 201):
            raise httpx.HTTPStatusError(
                f"GitHub write failed: {r.status_code}", request=r.request, response=r
            )


# ── Public interface ──────────────────────────────────────────────────────────

async def get_users() -> tuple[list[dict], str | None]:
    s = _get_settings()
    if not s.GITHUB_TOKEN:
        return _FALLBACK_STORE, None
    await _ensure_branch(s.GITHUB_TOKEN, s.GITHUB_OWNER, s.GITHUB_REPO, s.GITHUB_DB_BRANCH)
    return await _read_file(s.GITHUB_TOKEN, s.GITHUB_OWNER, s.GITHUB_REPO, s.GITHUB_DB_BRANCH, "users.json")


async def save_users(users: list[dict], sha: str | None) -> None:
    s = _get_settings()
    if not s.GITHUB_TOKEN:
        _FALLBACK_STORE.clear()
        _FALLBACK_STORE.extend(users)
        return

    async with _write_lock:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        last_exc: Exception | None = None
        for attempt in range(3):
            try:
                await _write_file(
                    s.GITHUB_TOKEN, s.GITHUB_OWNER, s.GITHUB_REPO, s.GITHUB_DB_BRANCH,
                    "users.json", users, sha, f"db: update users [{ts}]"
                )
                return
            except httpx.HTTPStatusError as exc:
                # 409 = sha conflict (another write landed first); re-read and retry
                if exc.response.status_code in (409, 422) and attempt < 2:
                    await asyncio.sleep(0.5 * (attempt + 1))
                    users, sha = await _read_file(
                        s.GITHUB_TOKEN, s.GITHUB_OWNER, s.GITHUB_REPO,
                        s.GITHUB_DB_BRANCH, "users.json"
                    )
                    last_exc = exc
                else:
                    raise
        if last_exc:
            raise last_exc


async def find_user_by_email(email: str) -> dict | None:
    users, _ = await get_users()
    return next((u for u in users if u["email"] == email), None)


async def find_user_by_id(user_id: int) -> dict | None:
    users, _ = await get_users()
    return next((u for u in users if u["id"] == user_id), None)
