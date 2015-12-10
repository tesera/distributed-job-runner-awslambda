'use strict';

require('node-env-file')('environment/.env');
require('node-env-file')('environment/'+(process.env.NODE_ENV||'production')+'.env');
