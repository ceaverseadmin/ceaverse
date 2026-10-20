#!/usr/bin/env bash
set -o errexit

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.production}"

pip install -r requirements/production.txt
python manage.py collectstatic --noinput
