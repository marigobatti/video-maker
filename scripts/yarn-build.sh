#!/bin/sh

set -o errexit

THIS_DIR=`readlink -f $0`
THIS_DIR=`dirname $THIS_DIR`
. $THIS_DIR/setenv.sh

cd "$THIS_DIR/../"
yarn install
yarn run test
yarn run build
