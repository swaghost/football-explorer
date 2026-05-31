import { ConfigurationParameters } from '@soccr.io/api';
import { environment } from '../../environments/environment.prod';

export function apiSoccerBasePath(): ConfigurationParameters {
  let basePath = '';
  if (environment.pathAddressingMode == 'ABSOLUTE') {
    basePath = environment.absolutePathSoccrIO;
  } else if (environment.pathAddressingMode == 'RELATIVE') {
    basePath = environment.relativePathSoccrIO;
  } else if (environment.pathAddressingMode == 'REMOTE') {
    basePath = environment.IPAddressPathSoccrIO;
  } else if (environment.pathAddressingMode == 'AUTO') {
    basePath = window.location.origin;
  }

  const params: ConfigurationParameters = {
    basePath: basePath,
  };

  return params;
}
