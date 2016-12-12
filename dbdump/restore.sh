#!/bin/bash
read -p "Password: " -s PGPASSWORD
export PGPASSWORD;
echo #newline

dropdb -U socialnetwork socialnetwork
createdb -U socialnetwork socialnetwork
psql -U socialnetwork socialnetwork < socialnetwork.sql