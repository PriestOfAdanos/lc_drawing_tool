#! /bin/bash
docker run -it --rm --name lc_node --mount type=bind,source="$(pwd)"/web,target=/web lc_node:18 bash