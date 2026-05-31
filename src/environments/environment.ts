// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {  
  adSense: {
    adSenseClientID: 'ca-pub-3678345835829296',
    defaultAdSlot: '2993931015',
    showAds: true
 },
  title:'soccr.org',  
  subTitle:'Modern Player Development',
  welcomeVolume: .10,
  //version: require('../../package.json').version+'D',
  version: '0.0.1'+'D',
  production: false,
  environmentName: "Development",
  loginDefault: 'sassenheimer',
  passwordDefault:'swOrdsman1971~',
  absolutePathSoccrIO: 'http://localhost:1761',
  relativePathSoccrIO: '/',
  IPAddressPathSoccrIO: 'http://192.168.50.246:81',
  pathAddressingMode: 'AUTO', 
  basePath:'' 
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
