#/bin/bash

scriptpath="$( dirname "$0" )"
cd "$scriptpath"

TARGET="firefox"

if [[ "$1" ]]; then
    TARGET="$1"
fi

GPP_MACRO=
if [[ "$TARGET" == "firefox" ]]; then
    GPP_MACRO=""
elif [[ "$TARGET" == "chrome" ]]; then
    GPP_MACRO="-D CHROME"
fi

while read -r SRCF
do
    echo "$SRCF"
    gpp $GPP_MACRO "$SRCF" -o "${SRCF:2}"
done < <(ls -1 g_*)
