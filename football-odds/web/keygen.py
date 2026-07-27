"""Generér licensnøgler til OddsCalc Pro.

Nøglerne valideres i browseren (samme algoritme som i template.html).

    python web/keygen.py 10        # udskriv 10 gyldige nøgler
    python web/keygen.py 1 --check ABCDE-FGHJK-LMNPQ-RSTUV

VIGTIGT — dette er "soft" licensering: algoritmen ligger i klientens
JavaScript, så en teknisk bruger kan omgå den. Til ægte beskyttelse skal
nøglerne valideres på en server (se web/README om licens).
"""

from __future__ import annotations

import secrets
import sys

ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 32 tegn, ingen 0/O/1/I


def checksum(body: str) -> str:
    h = 7
    for c in body:
        h = ((h * 33) + (ALPHA.index(c) + 1)) & 0xFFFFFFFF
    return "".join(ALPHA[(h >> (k * 5)) & 31] for k in range(5))


def make_key() -> str:
    body = "".join(secrets.choice(ALPHA) for _ in range(15))
    full = body + checksum(body)
    return "-".join(full[i : i + 5] for i in range(0, 20, 5))


def is_valid(key: str) -> bool:
    key = "".join(c for c in key.upper() if c in ALPHA)
    if len(key) != 20:
        return False
    return checksum(key[:15]) == key[15:]


def main(argv: list) -> int:
    if "--check" in argv:
        i = argv.index("--check")
        key = argv[i + 1] if i + 1 < len(argv) else ""
        print("GYLDIG" if is_valid(key) else "UGYLDIG", key)
        return 0
    n = int(argv[0]) if argv and argv[0].isdigit() else 5
    for _ in range(n):
        print(make_key())
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
