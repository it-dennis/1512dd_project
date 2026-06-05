 Hier ist die CRUD-Übersicht für das Projekt:                                                                                                                                                            
                                                                                                                                                                                                          
  ---                                                                                                                                                                                                     
  CRUD-Übersicht: 1512DD-emu                                                                                                                                                                              
                                                                                                                                                                                                          
  Stack: FastAPI + SQLAlchemy (Backend) | React + Axios (Frontend) | MySQL                                                                                                                                
                                                                                                                                                                                                          
  ---                                                                                                                                                                                                     
  Entities & ihre CRUD-Operationen                                                                                                                                                                        
                                                                                                                                                                                                          
  ┌──────────┬─────────────────────────┬──────────────────────────────┬────────────────────────┬───────────────────────────┬────────────┐
  │  Entity  │            C            │              R               │           U            │             D             │ Admin-only │
  ├──────────┼─────────────────────────┼──────────────────────────────┼────────────────────────┼───────────────────────────┼────────────┤
  │ User     │ POST /api/auth/register │ GET /api/auth/me             │ E-Mail-Verifizierung   │ —                         │ Nein       │
  ├──────────┼─────────────────────────┼──────────────────────────────┼────────────────────────┼───────────────────────────┼────────────┤
  │ Article  │ POST /api/articles/     │ GET /api/articles/ + /{slug} │ PUT /api/articles/{id} │ DELETE /api/articles/{id} │ Ja         │
  ├──────────┼─────────────────────────┼──────────────────────────────┼────────────────────────┼───────────────────────────┼────────────┤
  │ Category │ — (nur Seed)            │ GET /api/categories/         │ —                      │ —                         │ —          │
  └──────────┴─────────────────────────┴──────────────────────────────┴────────────────────────┴───────────────────────────┴────────────┘

  ---
  Wo liegt was?

  Backend-Routen:
  - backend/routers/auth.py — User register, login, verify-email
  - backend/routers/articles.py — vollständiges Article-CRUD
  - backend/main.py — Category-List
  - backend/auth.py — JWT-Validierung, require_admin(), require_user()

  Backend-Datenbankzugriffe: SQLAlchemy direkt (kein Repository-Pattern) — db.add(), db.query(), db.delete(), db.commit() inline in den Route-Funktionen.

  Frontend:
  - frontend/src/api/client.js — alle Axios-Calls zentralisiert (articlesApi, authApi, categoriesApi)
  - frontend/src/pages/Admin.jsx — Create/Update/Delete-Formulare für Articles (Admin)
  - frontend/src/pages/Articles.jsx + ArticleDetail.jsx — Read-Ansichten

  Authentifizierung: JWT-Bearer-Token, im Frontend via localStorage gespeichert und per Axios-Interceptor automatisch an alle Requests angehängt.