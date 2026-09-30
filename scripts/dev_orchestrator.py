import os
import sys
import socket
import json
import time
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
RUNTIME_MANIFEST = ROOT_DIR / ".runtime-ports.json"
FRONTEND_ENV = ROOT_DIR / "frontend" / ".env.local"

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        try:
            s.bind((host, port))
            return False
        except (socket.error, OSError):
            return True

def find_open_port(base_port: int, max_attempts: int = 50) -> int:
    for port in range(base_port, base_port + max_attempts):
        if not is_port_in_use(port):
            return port
    raise RuntimeError(f"Unable to find open port starting from {base_port}")

def resolve_and_sync_ports():
    backend_port = find_open_port(8000)
    frontend_port = find_open_port(3000)

    manifest = {
        "backend": {
            "host": "127.0.0.1",
            "port": backend_port,
            "url": f"http://127.0.0.1:{backend_port}",
            "status": "ready"
        },
        "frontend": {
            "host": "127.0.0.1",
            "port": frontend_port,
            "url": f"http://127.0.0.1:{frontend_port}",
            "status": "ready"
        }
    }

    with open(RUNTIME_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    # Sync frontend .env.local
    with open(FRONTEND_ENV, "w", encoding="utf-8") as f:
        f.write(f"NEXT_PUBLIC_API_URL=http://127.0.0.1:{backend_port}\n")
        f.write(f"PORT={frontend_port}\n")

    print(f"[Orchestrator] Dynamic ports resolved successfully:")
    print(f"  -> FastAPI Backend:  http://127.0.0.1:{backend_port}")
    print(f"  -> Next.js Frontend: http://127.0.0.1:{frontend_port}")
    return manifest

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--start-backend":
        manifest = resolve_and_sync_ports()
        b_port = manifest["backend"]["port"]
        cmd = [
            sys.executable,
            "-m",
            "uvicorn",
            "backend.app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(b_port),
        ]
        print(f"[Orchestrator] Starting FastAPI on port {b_port}...")
        subprocess.run(cmd, cwd=str(ROOT_DIR))
    else:
        resolve_and_sync_ports()
