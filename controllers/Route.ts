import Methods from './Methods';

export interface IRoute {
  method: Methods;
  path: string;
  action: string;
}
