#!/bin/bash

script=$(readlink -f "$0")
scriptpath=$(dirname "$script")

cd "$scriptpath"


function gpp_those_files() 
{
    local TARGET="$1"
    echo "TARGET is $TARGET"
    
    mkdir -p dist/$TARGET/
    rm    -r dist/$TARGET/*

    cp  *.html *.js *.png LICENSE dist/$TARGET/

    rm  dist/$TARGET/g_*  
    
    GPP_MACRO="-D $TARGET"
    while read -r SRCF
    do
        echo "compile $SRCF"
        gpp $GPP_MACRO "$SRCF" -o "dist/$TARGET/${SRCF:2}"
    done < <(ls -1 g_*)
}

gpp_those_files "FIREFOX"
gpp_those_files "CHROME"

cp manifest.json          dist/FIREFOX/manifest.json
cp manifest-chrome.json   dist/CHROME/manifest.json

rm dist/FIREFOX/browser-polyfill.min.js

