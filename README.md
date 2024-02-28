1. mkdir data && mkdir data/hidra_data && mkdir data/prometheus_data && mkdir data/grafana_data && mkdir data/certs && touch .env
2. add in .env HIDRA_AUTH_BASIC_PASSWORD=xxxxx and USERS_AND_PASSWORDS={"email@email.es":"xxxxx"}
```
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce
# check docker service status
sudo systemctl status docker
# execute Docker Command Without Sudo
sudo usermod -aG docker ${USER}
su - ${USER} # type your password
groups # check if group docker exist
sudo usermod -aG docker YOUR_USERNAME
# install docker compose
sudo apt install docker-compose

# install supervisor
sudo apt-get install supervisor
sudo touch /etc/supervisor/conf.d/hidra-docker.conf

# add this content
[program:hidra_docker]
command=/usr/bin/docker-compose up --build
directory=/home/ubuntu/hidra-cloud-tech/
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/hidra_docker.err.log
stdout_logfile=/var/log/supervisor/hidra_docker.out.log

```