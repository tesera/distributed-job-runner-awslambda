#!/bin/bash

yum update -y
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
source ~/.bashrc
nvm install stable
nvm use stable

yum install gdal.x86_64 gdal-devel.x86_64 proj.x86_64 proj-devel.x86_64 proj-epsg.x86_64 proj-nad.x86_64 --enablerepo epel -y
yum install R -y
Rscript -e 'install.packages(c("yaml", "sp", "rgdal", "raster"), repos="http://cran.r-project.org", lib="/usr/share/R/library")'

curl -o- https://raw.githubusercontent.com/tesera/queue2worker-awslambda/master/client.js > client.js
npm install sqs-worker 
npm install aws-sdk 
npm install daemon 

node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/q2worker > /home/ec2-user/output.txt

