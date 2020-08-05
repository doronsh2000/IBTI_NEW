FROM centos:6.7

MAINTAINER Doron Shushan

#VOLUME 
WORKDIR /node-talib-0.4.0/


COPY ./files/epel.repo //etc/yum.repos.d/epel.repo 

COPY  ./files/RPM-GPG-KEY-EPEL-6  /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6

RUN mkdir -p  /IB_TI/node-talib-0.4.0/ & yum install npm -y  && yum install iputils -y

#WORKDIR /IB_TI/node-talib-0.4.0/

#COPY  ./package.json  //IB_TI/node-talib-0.4.0/ 
ADD  ./  //IB_TI/node-talib-0.4.0/

#RUN npm install

WORKDIR //IB_TI/node-talib-0.4.0/examples

ENV REDIS_ENV=Development
ENV REDIS_IP=redis
ENV MONGO_IP=mongodb
#ENTRYPOINT ["node","//IB_TI/node-talib-0.4.0/examples/rsi_5m_cad.js"]

