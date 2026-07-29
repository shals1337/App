"""Hent kamp-resultater GRATIS fra football-data.org og skriv dem i samme
format som The Odds API /scores, så ``build.py --scores`` kan afgøre facit
(ramt/forkert) uden at bruge odds-credits.

Kræver en gratis API-nøgle (env ``FOOTBALL_DATA_KEY``) fra
https://www.football-data.org/client/register — sendes som ``X-Auth-Token``.

Brug::

    FOOTBALL_DATA_KEY=xxxx python web/results_fd.py 4 fd_scores.json
    # 4 = antal dage tilbage der hentes færdigspillede kampe for

Output er en liste af "events" på The Odds API-form::

    [{"id","completed":true,"home_team","away_team","commence_time",
      "sport_title","scores":[{"name","score"},{"name","score"}]}]
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timedelta, timezone

API = "https://api.football-data.org/v4/matches"


def fetch_finished(key: str, days: int = 4) -> list:
    """Hent færdigspillede kampe de seneste ``days`` dage (alle ligaer i planen)."""
    today = datetime.now(timezone.utc).date()
    params = urllib.parse.urlencode(
        {
            "dateFrom": (today - timedelta(days=days)).isoformat(),
            "dateTo": today.isoformat(),
            "status": "FINISHED",
        }
    )
    req = urllib.request.Request(API + "?" + params, headers={"X-Auth-Token": key})
    with urllib.request.urlopen(req, timeout=40) as r:
        data = json.loads(r.read())
    return data.get("matches", [])


def to_scores_format(matches: list) -> list:
    """Konvertér football-data.org-kampe til The Odds API /scores-form."""
    out = []
    for m in matches:
        ft = (m.get("score") or {}).get("fullTime") or {}
        hs, as_ = ft.get("home"), ft.get("away")
        if hs is None or as_ is None:
            continue
        home = (m.get("homeTeam") or {}).get("name")
        away = (m.get("awayTeam") or {}).get("name")
        if not home or not away:
            continue
        out.append(
            {
                "id": str(m.get("id", "")),
                "completed": True,
                "home_team": home,
                "away_team": away,
                "commence_time": m.get("utcDate", ""),
                "sport_title": (m.get("competition") or {}).get("name", ""),
                "scores": [
                    {"name": home, "score": str(hs)},
                    {"name": away, "score": str(as_)},
                ],
            }
        )
    return out


def main(argv: list) -> int:
    key = os.environ.get("FOOTBALL_DATA_KEY")
    if not key:
        print("mangler FOOTBALL_DATA_KEY (gratis på football-data.org)", file=sys.stderr)
        return 2
    days = int(argv[0]) if argv and argv[0].isdigit() else 4
    out_file = None
    for a in argv:
        if a.endswith(".json"):
            out_file = a
    try:
        matches = fetch_finished(key, days)
    except Exception as e:  # netværk/kvote — fejl blødt, så build ikke vælter
        print("football-data fejl:", e, file=sys.stderr)
        matches = []
    scores = to_scores_format(matches)
    text = json.dumps(scores, ensure_ascii=False)
    if out_file:
        open(out_file, "w", encoding="utf-8").write(text)
        print(f"skrev {len(scores)} resultater til {out_file}", file=sys.stderr)
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
