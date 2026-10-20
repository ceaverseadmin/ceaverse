#!/usr/bin/env bash
set -o errexit

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.production}"

python manage.py migrate --noinput
python manage.py create_superadmin

exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 2 \
  --threads 2 \
  --timeout 120
