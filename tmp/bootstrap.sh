#!/usr/bin/env bash

# update packages
yum update -y

# install dependencies
yum install gdal.x86_64 gdal-devel.x86_64 proj.x86_64 proj-devel.x86_64 proj-epsg.x86_64 proj-nad.x86_64 --enablerepo epel -y
yum install R -y

# install R library dependencies
Rscript -e 'install.packages(c("yaml", "docopt", "sp", "rgdal", "raster"), repos="http://cran.r-project.org", lib="/usr/share/R/library")'

wget https://s3.amazonaws.com/1409-ibc-topo/ktpi-2.0.1.tar.gz
tar -zxvf ktpi-2.0.1.tar.gz
cd ktpi-2.0.1
chmod +x ktpi.r
