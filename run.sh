#!/bin/bash

function  main() {
echo -n "Please enter a script name: "
read scriptname

echo "Starting script: $scriptname..."
case $scriptname in

  "dev")
    cd ./Client && nodemon ./app.js & cd ./Server && nodemon ../Server/app.js
    ;;

  "start")
    cd ./Client && node app.js & cd ./Server && node ../Server/app.js
    ;;

  *)
    echo "Script not found"
    ;;
esac
}

function cleanup() {
  echo "Exiting script..."
  exit 0
}

trap cleanup SIGINT SIGTSTP
main
