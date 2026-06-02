import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_verification_email(to_email: str, username: str, token: str):
    smtp_host = os.getenv("SMTP_HOST", "")
    base_url = os.getenv("APP_BASE_URL", "http://localhost:5173")
    verify_url = f"{base_url}/verify-email?token={token}"

    if not smtp_host:
        print(f"\n[DEV EMAIL] Bestätigungslink für {to_email}:\n{verify_url}\n")
        return

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Bitte bestätige deine E-Mail-Adresse – PC1512 Emulator"
    msg["From"] = smtp_from
    msg["To"] = to_email

    html = f"""<!DOCTYPE html>
<html>
<body style="background:#0a0a0a;color:#d1d5db;font-family:monospace;padding:40px;margin:0;">
  <div style="max-width:500px;margin:0 auto;border:1px solid #374151;padding:32px;border-radius:4px;">
    <h1 style="color:#00FF41;margin:0 0 8px 0;font-size:20px;">PC1512 Emulator Platform</h1>
    <p style="color:#9ca3af;margin:0 0 16px 0;">Hallo {username},</p>
    <p style="margin:0 0 16px 0;">danke für deine Registrierung! Bitte bestätige deine E-Mail-Adresse, um den Emulator nutzen zu können.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="{verify_url}"
         style="background:#00FF41;color:#000000;padding:12px 28px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">
        E-Mail bestätigen
      </a>
    </div>
    <p style="color:#6b7280;font-size:12px;margin:0 0 8px 0;">Der Link ist 72 Stunden gültig.</p>
    <p style="color:#6b7280;font-size:12px;margin:0;">Falls du dich nicht registriert hast, ignoriere diese E-Mail einfach.</p>
    <hr style="border:none;border-top:1px solid #374151;margin:24px 0;">
    <p style="color:#4b5563;font-size:11px;margin:0;">Amstrad PC1512-DD Emulator Platform · Weiterbildungsprojekt</p>
  </div>
</body>
</html>"""

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_from, to_email, msg.as_string())
        print(f"[EMAIL OK] Bestätigungsmail erfolgreich gesendet an {to_email} via {smtp_host}")
    except Exception as e:
        print(f"[EMAIL ERROR] Fehler beim Senden der Bestätigungsmail an {to_email}: {e}")
