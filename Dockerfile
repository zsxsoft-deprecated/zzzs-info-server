FROM node:5.7.0
MAINTAINER zsx <zsx@zsxsoft.com> 

## Main
ENV APP /usr/src/app
RUN mkdir -p ${APP}/
WORKDIR ${APP}/
ADD ./ ./
RUN npm install typescript tsd bower -g
RUN bower install
RUN npm install
RUN tsd install
## Compile 
RUN tsc; exit 0
## Clean Garbage
RUN npm cache clean

EXPOSE 3000
CMD ["npm start"]