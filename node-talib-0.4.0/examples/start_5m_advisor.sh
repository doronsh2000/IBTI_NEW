#!/bin/bash

node  /IB_API/node-ib/examples/clear_mongodb_advisor.js
sleep 2
node /IB_API/node-ib/examples/reqAdvisorData.js &
sleep 10
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_gbp.js &
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_eur.js &
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_cad.js &
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_jpy.js &
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_aud.js &
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_chf.js &
node /IB_TI/node-talib-0.4.0/examples/Advisor_15m_nzd.js &
sleep 3
pkill -f 'Adv'

