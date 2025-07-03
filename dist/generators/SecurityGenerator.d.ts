/**
 * SecurityGenerator - Generates security-related views and components
 *
 * Based on patterns from powerview-admin project:
 * - Login views (desktop/mobile)
 * - Security management views
 * - Authentication components
 * - User management interfaces
 * - API token management
 */
export interface SecurityConfig {
    type: 'login' | 'security-management' | 'user-management' | 'api-tokens' | 'authenticator';
    name: string;
    output?: string;
    typescript?: boolean;
    features?: string[];
    withMobile?: boolean;
    withBranding?: boolean;
    withPasswordRemember?: boolean;
    authenticatorClass?: string;
    userClass?: string;
    apiTokenClass?: string;
    brandName?: string;
    logoPath?: string;
    baseURL?: string;
}
export declare class SecurityGenerator {
    private templateDir;
    constructor();
    generate(config: SecurityConfig): Promise<{
        success: boolean;
        files: string[];
        errors?: string[];
    }>;
    private generateLoginViews;
    private generateSecurityManagement;
    private generateUserManagement;
    private generateApiTokens;
    private generateAuthenticator;
    private buildLoginContext;
    private buildSecurityContext;
    private buildUserManagementContext;
    private buildApiTokenContext;
    private buildAuthenticatorContext;
    private generateFromTemplate;
    private registerHandlebarsHelpers;
}
//# sourceMappingURL=SecurityGenerator.d.ts.map