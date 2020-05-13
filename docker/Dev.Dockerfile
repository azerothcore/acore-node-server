FROM node:12-slim

ARG idrsa
ARG idrsapub

RUN apt-get update -y
RUN apt-get install openssh-client -y
# Download public key for github.com
RUN mkdir -p /root/.ssh/
RUN echo ${idrsa} > /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN echo ${idrsapub} > /root/.ssh/id_rsa.pub
RUN chmod 600 /root/.ssh/id_rsa.pub
RUN ssh-keyscan -H gitlab.89109.nl >> /root/.ssh/known_hosts
RUN ssh-keyscan -H gitlab.com >> /root/.ssh/known_hosts
RUN ssh-keyscan -H github.com >> /root/.ssh/known_hosts
RUN chmod 700 /root/.ssh/known_hosts
