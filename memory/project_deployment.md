---
name: project-deployment
description: Deployment-Ziel: Backend + Docker laufen auf einem eigenen VPS
metadata:
  type: project
---

Das Backend (FastAPI + MySQL via Docker) wird auf einem eigenen VPS des Nutzers betrieben. Docker ist dort bereits installiert.

**Why:** Der VPS ist die Produktionsumgebung; lokales Docker dient nur der Entwicklung.

**How to apply:** Bei README-Texten, docker-compose-Anpassungen oder Deployment-Hinweisen immer vom VPS als Zielplattform ausgehen. Lokales Setup (ohne Docker) ist nur für Entwicklung relevant, nicht für den Produktivbetrieb.
