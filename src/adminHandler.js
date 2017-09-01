const Vote = require('./voteHandler.js');
import auth from './auth.js';

export function handler(cli, message) {
  console.log('starting admin duties')
  if(!auth(cli, message)) {
    return;
  }

  
}
