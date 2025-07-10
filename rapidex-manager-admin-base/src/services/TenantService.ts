import { injectable, inject } from 'inversify';
import { ArchbaseRemoteApiService, ArchbaseRemoteApiClient, ARCHBASE_IOC_API_TYPE } from 'archbase-react';
import { TenantDto } from '../domain/TenantDto';
import { API_TYPE } from '../ioc/RapidexManagerAdminBaseIOCTypes';

@injectable()
export class TenantService extends ArchbaseRemoteApiService<TenantDto, string> {
    constructor(@inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
        super(client);
    }

    configureHeaders(): Record<string, string> {
        return {};
    }

    transform(data: any): TenantDto {
        return new TenantDto(data);
    }

    getEndpoint(): string {
        return '/api/v1/tenants';
    }

    getId(entity: TenantDto): string {
        return entity.id;
    }

    isNewRecord(entity: TenantDto): boolean {
        return !entity.id || entity.id === '';
    }

    // Custom methods based on backend endpoints
    async findByName(name: string): Promise<TenantDto> {
        const result = await this.client.get<TenantDto>(`${this.getEndpoint()}/name/${name}`);
        return this.transform(result);
    }

    async findByActive(active: boolean = true, page: number = 0, size: number = 25): Promise<any> {
        const result = await this.client.get<any>(`${this.getEndpoint()}/active`, {}, false, {
            params: { active, page, size }
        });
        return result;
    }

    async findByState(state: string, page: number = 0, size: number = 25): Promise<any> {
        const result = await this.client.get<any>(`${this.getEndpoint()}/state/${state}`, {}, false, {
            params: { page, size }
        });
        return result;
    }

    async findByCountry(country: string, page: number = 0, size: number = 25): Promise<any> {
        const result = await this.client.get<any>(`${this.getEndpoint()}/country/${country}`, {}, false, {
            params: { page, size }
        });
        return result;
    }

    async searchByName(name: string, page: number = 0, size: number = 25): Promise<any> {
        const result = await this.client.get<any>(`${this.getEndpoint()}/search`, {}, false, {
            params: { name, page, size }
        });
        return result;
    }
}

export default TenantService;