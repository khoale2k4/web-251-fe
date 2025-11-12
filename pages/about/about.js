import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'about');
  mountFooter('.mount-footer');
});