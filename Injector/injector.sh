#!/bin/bash

mkdir -p "tmp/"
cd "tmp"
GIT_TERMINAL_PROMPT=0 git clone $2 $1