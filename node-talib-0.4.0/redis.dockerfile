FROM ubuntu:14.04

MAINTAINER Doron Shuhuan

RUN apt-get update && apt-get install -y redis-server

EXPOSE 6379

ENTRYPOINT ["/usr/bin/redis-server"]
