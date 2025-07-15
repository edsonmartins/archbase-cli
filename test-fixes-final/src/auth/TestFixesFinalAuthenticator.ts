import { ArchbaseAuthenticator, ArchbaseUser, ArchbaseAccessToken } from '@archbase/security'
import { ARCHBASE_IOC_API_TYPE, ArchbaseRemoteApiClient } from '@archbase/data'
import { inject, injectable } from 'inversify'

interface RefreshToken {
  token: string
}

export class TestFixesFinalUser extends ArchbaseUser {
  public id: string
  public displayName: string
  public email: string
  public photo: string
  public isAdmin: boolean
  
  constructor(data: any) {
    super(data)
    this.id = data.id || ''
    this.displayName = data.displayName || data.name || ''
    this.email = data.email || ''
    this.photo = data.photo || data.avatar || ''
    this.isAdmin = data.isAdmin || false
  }

  public isAdministrator = (): boolean => {
    return this.isAdmin
  }
}

type UsernameAndPassword = {
  email: string
  password: string
}

@injectable()
export class TestFixesFinalAuthenticator implements ArchbaseAuthenticator {
  private client: ArchbaseRemoteApiClient
  
  constructor(@inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
    this.client = client
  }
  
  sendResetPasswordEmail(email: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  
  resetPassword(email: string, passwordResetToken: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async login(username: string, password: string): Promise<ArchbaseAccessToken> {
    // Prepara os dados de login
    const loginData: UsernameAndPassword = {
      email: username,
      password
    };
    
    // Para autenticação, geralmente não usamos token (withoutToken = true)
    const withoutToken = true;
    
    // Executa a requisição POST
    return this.client.post<UsernameAndPassword, ArchbaseAccessToken>(
      '/api/v1/auth/authenticate',
      loginData,
      {},
      withoutToken
    );
  }

  public async refreshToken(refresh_token: string): Promise<ArchbaseAccessToken> {
    const withoutToken = true;
    
    return this.client.post<RefreshToken, ArchbaseAccessToken>(
      '/api/v1/auth/refresh-token',
      { token: refresh_token },
      {},
      withoutToken
    );
  }
}