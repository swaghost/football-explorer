import { version } from '../../package.json';

export const environment = {
  adSense: {
    adSenseClientID: 'ca-pub-3678345835829296',
    defaultAdSlot: '2993931015',
    showAds: true,
  },
  title: 'soccr.org',
  subTitle: 'Get bent you are in STAGE',
  welcomeVolume: 0.2,
  version: version + 'S',
  production: true,
  environmentName: 'Staging',
  loginDefault: '',
  passwordDefault: '',
  absolutePathSoccrIO: 'https://localhost',
  relativePathSoccrIO: '/',
  IPAddressPathSoccrIO: 'N/A/',
  pathAddressingMode: 'RELATIVE',
  basePath: '',
};
