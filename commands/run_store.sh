#!/bin/sh
sudo docker run -d --name store_part -p 4000:4000 --network my-net --env-file ./.env asyl/store-app