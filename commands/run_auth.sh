#!/bin/sh
sudo docker run -d --name auth_part -p 5000:5000 --network my-net --env-file ./.env asyl/auth-app2 