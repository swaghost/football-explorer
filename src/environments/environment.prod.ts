import { version } from '../../package.json';

export const environment = {
  adSense: {
    adSenseClientID: 'ca-pub-3678345835829296',
    defaultAdSlot: '2993931015',
    showAds: true,
  },
  title: 'soccr.org',
  subTitle: 'Modern Player Development',
  welcomeVolume: 0.1,
  version: version + 'P',
  production: true,
  environmentName: 'Production',
  loginDefault: '',
  passwordDefault: '',
  absolutePathSoccrIO: 'https://www.soccr.io',
  relativePathSoccrIO: '/',
  IPAddressPathSoccrIO: 'N/A',
  pathAddressingMode: 'ABSOLUTE',
  basePath: '',
};
