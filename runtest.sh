#!/usr/bin/env bash
docker compose -f "$(dirname "$0")/docker-compose.yml" run --rm app bash -c "cd /workspace && mvn test -Dtest=AuthServiceTest"
