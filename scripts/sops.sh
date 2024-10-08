#!/bin/bash

files=(
    "env/.env.production"
    "env/.env.staging"
    "env/.env.development"
    "terraform/backend/terraform.tfstate"
    "terraform/.env"
)

encrypt() {
    for file in ${files[@]}; do
        if [ ! -f $file ]; then
            continue
        fi
        # echo "encrypting $file"
        sops -e $file > $file.secret
    done
}

decrypt() {
    for file in ${files[@]}; do
        if [ ! -f $file.secret ]; then
            continue
        fi
        # echo "decrypting $file.secret"
        sops -d $file.secret > $file
    done
}

decrypt_and_run() {
    decrypt &>/dev/null
    trap "encrypt &>/dev/null" EXIT
    eval "$@"
}

if [ "$1" == "encrypt" ]; then
    encrypt
elif [ "$1" == "decrypt" ]; then
    decrypt
elif [ "$1" == "decrypt_and_run" ]; then
    shift
    decrypt_and_run $@
else
    echo "Invalid mode. Usage: sops.sh [encrypt|decrypt]"
fi