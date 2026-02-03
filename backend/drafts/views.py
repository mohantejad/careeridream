import json
import os
import re

from rest_framework import permissions, viewsets

from .models import SavedDraft
from .serializers import SavedDraftSerializer


GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')


def _slugify_filename(value: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '_', value.lower()).strip('_')
    return slug


def _truncate_text(text: str, limit: int = 2000) -> str:
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(' ', 1)[0]


def _extract_job_metadata(job_description: str) -> dict:
    if not GROQ_API_KEY:
        return {}

    prompt = (
        'Extract job metadata from the job description.\n'
        'Return STRICT JSON only (no markdown). Use this schema:\n'
        '{\n'
        '  "job_title": string,\n'
        '  "company": string,\n'
        '  "summary_line": string\n'
        '}\n'
        'summary_line should be a single concise sentence under 120 characters.'
    )

    payload = {
        'model': GROQ_MODEL,
        'temperature': 0.2,
        'messages': [
            {'role': 'system', 'content': prompt},
            {'role': 'user', 'content': _truncate_text(job_description)},
        ],
    }

    try:
        import requests

        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GROQ_API_KEY}',
            },
            json=payload,
            timeout=30,
        )
    except Exception:
        return {}

    if response.status_code >= 400:
        return {}

    data = response.json()
    content = (
        data.get('choices', [{}])[0]
        .get('message', {})
        .get('content', '')
    )

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {}


class SavedDraftViewSet(viewsets.ModelViewSet):
    serializer_class = SavedDraftSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedDraft.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        extra = {}
        job_title = serializer.validated_data.get('job_title', '').strip()
        company = serializer.validated_data.get('company', '').strip()
        summary_line = serializer.validated_data.get('summary_line', '').strip()
        job_description = serializer.validated_data.get('job_description', '').strip()

        if job_description and (not job_title or not company or not summary_line):
            extracted = _extract_job_metadata(job_description)
            if not job_title:
                extra['job_title'] = extracted.get('job_title', '').strip()
            if not company:
                extra['company'] = extracted.get('company', '').strip()
            if not summary_line:
                extra['summary_line'] = extracted.get('summary_line', '').strip()

        draft_type = serializer.validated_data.get('draft_type')
        resume_filename = serializer.validated_data.get('resume_filename', '').strip()
        if draft_type == SavedDraft.DraftType.RESUME and not resume_filename:
            name_source = extra.get('company') or company
            if name_source:
                base = _slugify_filename(name_source)
                extra['resume_filename'] = f'{base}_resume'

        serializer.save(user=self.request.user, **extra)
