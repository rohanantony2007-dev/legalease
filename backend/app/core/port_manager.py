import socket
import json
import os
from pathlib import Path

MANIFEST_PATH = Path(__file__).resolve().parents[3] / ".runtime-ports.json"

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a specific port is already bound."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        try:
            s.bind((host, port))
            return False
        except (socket.error, OSError):
            return True

def find_available_port(start_port: int, max_attempts: int = 50, host: str = "127.0.0.1") -> int:
    """Find the next available open port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port, host):
            return port
    raise RuntimeError(f"Could not find an available port in range {start_port}-{start_port + max_attempts}")

def record_runtime_port(service: str, port: int, host: str = "127.0.0.1") -> None:
    """Persist active service port to the shared runtime manifest."""
    data = {}
    if MANIFEST_PATH.exists():
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
            
    data[service] = {
        "host": host,
        "port": port,
        "url": f"http://{host}:{port}"
    }
    
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def get_runtime_port(service: str) -> dict | None:
    """Retrieve recorded port info for a service."""
    if not MANIFEST_PATH.exists():
        return None
    try:
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get(service)
    except Exception:
        return None
