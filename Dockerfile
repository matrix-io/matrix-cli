FROM node:latest

COPY ./ /admatrix-console

WORKDIR /admatrix-console

RUN npm install
