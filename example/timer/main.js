debugger;

import {} from 'w3c_timer';
import {} from 'console';

const id_timeout = setTimeout(() => {
  console.log('fired');
}, 2000);

const id_interval = setInterval(() => {
  console.log(Date.now());
}, 1000);
