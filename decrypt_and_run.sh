#!/bin/bash

./scripts/sops.sh decrypt &>/dev/null
trap "./scripts/sops.sh encrypt &>/dev/null" EXIT
eval $@