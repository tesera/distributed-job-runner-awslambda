'use strict'

require('node-env-file')('.env');

if(process.env.NODE_ENV === 'development') {
    require('node-env-file')('dev.env');
}
