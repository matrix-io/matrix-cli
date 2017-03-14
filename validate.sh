#!/bin/bash

if  grep -qR "Raspbian"  "/etc/os-release"
then
 echo "THIS IS A RASPBERRY DON'T INSTALL MATRIX CLI IN THIS MACHINE"
 while true; do
    echo "Keep in mind that MATRIX CLI is intended to run on your host computer, not directly on the Pi running MOS."
    read -p "Do you wish to install this program? (y/N) " answer
    case $answer in
        [Yy]* ) echo "Resuming installation"; exit 0;;
        * ) echo "Aborting installation"; exit 1;
    esac
done
else
 exit 0
fi
