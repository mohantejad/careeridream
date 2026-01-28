from __future__ import annotations

from typing import Iterable

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.message import EmailMessage

import resend


class ResendEmailBackend(BaseEmailBackend):
    """Send emails using the Resend HTTP API."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.api_key = getattr(settings, "EMAIL_API_KEY", None)

    def _build_payload(self, message: EmailMessage) -> dict:
        html_content = None
        if getattr(message, "alternatives", None):
            for content, mime_type in message.alternatives:
                if mime_type == "text/html":
                    html_content = content
                    break

        if message.content_subtype == "html" and not html_content:
            html_content = message.body

        payload: dict = {
            "from": message.from_email or settings.DEFAULT_FROM_EMAIL,
            "to": message.to,
            "subject": message.subject,
        }

        if html_content:
            payload["html"] = html_content
            if message.body and message.body != html_content:
                payload["text"] = message.body
        else:
            payload["text"] = message.body

        if message.cc:
            payload["cc"] = message.cc
        if message.bcc:
            payload["bcc"] = message.bcc
        if message.reply_to:
            payload["reply_to"] = message.reply_to

        return payload

    def send_messages(self, email_messages: Iterable[EmailMessage]) -> int:
        if not email_messages:
            return 0

        if not self.api_key:
            raise ValueError("EMAIL_API_KEY is not configured.")

        resend.api_key = self.api_key

        sent_count = 0
        for message in email_messages:
            payload = self._build_payload(message)
            try:
                resend.Emails.send(payload)
                sent_count += 1
            except Exception as exc:
                # Raise the Resend error so Render logs show the real cause.
                raise RuntimeError(f"Resend send failed: {exc}") from exc

        return sent_count
