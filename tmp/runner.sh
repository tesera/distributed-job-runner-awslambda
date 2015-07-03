#!/bin/bash

# usage: bash ./runner.sh 'statistic,3/4,2/3;2/4;2/5;3/3;3/4;3/5;4/3;4/4;4/5,-d 10 -x'

cmd=$1
key=`echo $cmd | tr / _ | tr [:blank:] - | tr , - | tr ';' ::`

func=`echo $cmd | awk -F, '{print $1}'`
feature=`echo $cmd | awk -F, '{print "./features/" $2 ".tif"}'`
args=`echo $cmd | awk -F, '{print $4}'`

bucket=1409-ibc-topo
input_path=input/tiles500x500
output_path=output/tiles500x500/queue2worker

output_dir=./output

tiles=`echo $cmd | awk -F, '{ORS=" "; split($3, tiles, ";"); for (tile in tiles) { print "--include \"features/" tiles[tile] ".tif\" "  "--include \"dems/" tiles[tile] ".tif\"" ;} }'`

mkdir -p $output_dir

eval "aws s3 cp s3://$bucket/$input_path/ . --exclude '*' $tiles --recursive"

eval "./ktpi.r $func $feature ./dems $output_dir $args"

aws s3 sync ./output s3://$bucket/$output_path
