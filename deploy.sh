#!/bin/bash

git pull

docker-compose -f docker-compose.yml down

docker system prune -f

docker-compose -f docker-compose.yml build

docker-compose -f docker-compose.yml up -d
