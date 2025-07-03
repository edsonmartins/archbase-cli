import { Container } from 'inversify';
import { CustomAuthenticator } from './CustomAuthenticator';

export interface CustomAuthContainerConfig {
  baseURL: string;
}

export class CustomAuthContainer {
  private container: Container;
  private config: CustomAuthContainerConfig;

  constructor(config: CustomAuthContainerConfig) {
    this.config = config;
    this.container = new Container();
    this.setupBindings();
  }

  private setupBindings() {
    // Basic authenticator binding
    this.container.bind<CustomAuthenticator>('Authenticator').to(CustomAuthenticator).inSingletonScope();
  }

  get<T>(serviceIdentifier: string): T {
    return this.container.get<T>(serviceIdentifier);
  }

  getAuthenticator(): CustomAuthenticator {
    return this.get<CustomAuthenticator>('Authenticator');
  }
}

export function createCustomAuthContainer(config: CustomAuthContainerConfig): CustomAuthContainer {
  return new CustomAuthContainer(config);
}