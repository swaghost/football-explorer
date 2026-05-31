import { Configuration } from '@soccr.io/api';

import { apiSoccerBasePath } from './apiSoccerBasePath.function';
import { environment } from '../../environments/environment';

export function apiSoccerConfigFactory(): Configuration {
  let params = apiSoccerBasePath();
  environment.basePath = params.basePath || 'FIX IT?';
  return new Configuration(params);
}
