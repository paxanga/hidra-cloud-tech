#!/bin/sh

auth_basic_password=$HIDRA_AUTH_BASIC_PASSWORD

printenv

echo "----------------> Generating password <----------------"

if [ -n "$auth_basic_password" ]; then
    hashed_password=$(htpasswd -bnBC 10 "" $auth_basic_password | tr -d ':\n')

    echo "basic_auth_users:" > web.yml
    echo "    admin: $hashed_password" >> web.yml
    echo $auth_basic_password > passwdweb
    echo "----------------> The password has been generated successfully <----------------" 

    cat web.yml
else
    echo "The environment variable HIDRA_AUTH_BASIC_PASSWORD is not defined"
    exit 1
fi

# exec /bin/prometheus $@