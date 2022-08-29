#! /bin/bash
docker run -it --mount type=bind,source="$(pwd)"/web,target=/web node:18 bash