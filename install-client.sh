#!/bin/bash

export instance_id=$(curl http://169.254.169.254/latest/meta-data/instance-id)

yum update -y
yum install gdal.x86_64 gdal-devel.x86_64 proj.x86_64 proj-devel.x86_64 proj-epsg.x86_64 proj-nad.x86_64 --enablerepo epel -y
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
yum install R -y
Rscript -e 'install.packages(c("yaml", "sp", "rgdal", "raster"), repos="http://cran.r-project.org", lib="/usr/share/R/library")'

export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
source ~/.bashrc
nvm install stable
nvm use stable

npm install sqs-worker
curl -o- https://raw.githubusercontent.com/tesera/queue2worker-awslambda/master/client.js > client.js

node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/queue2worker > /home/ec2-user/output.txt

