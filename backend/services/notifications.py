import os
import httpx

MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY", "")
OWNER_PHONE = os.getenv("OWNER_PHONE", "")


def send_order_notification(order_id: str, total: float):
    if not MSG91_AUTH_KEY or not OWNER_PHONE:
        return {
            "sent": False,
            "reason": "MSG91 not configured",
            "order_id": order_id,
        }

    payload = {
        "template_id": "order_alert_template",
        "short_url": "0",
        "recipients": [
            {
                "mobiles": f"91{OWNER_PHONE}",
                "VAR1": order_id,
                "VAR2": str(total),
            }
        ]
    }

    headers = {
        "authkey": MSG91_AUTH_KEY,
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                "https://control.msg91.com/api/v5/flow/",
                json=payload,
                headers=headers,
            )
        return {"sent": response.status_code < 400, "status_code": response.status_code}
    except Exception as e:
        return {"sent": False, "error": str(e)}
