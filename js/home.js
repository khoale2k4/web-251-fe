import { ready } from './main.js';
import { mountHeader } from '../components/Header.js';
import { mountFooter } from '../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'home');
  mountFooter('.mount-footer');
});


