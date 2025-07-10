import { injectable, inject } from 'inversify';
import { ArchbaseRemoteApiService, ArchbaseRemoteApiClient, API_TYPE } from 'archbase-react';
import { TenantDto } from '../domain/TenantDto';

@injectable()
export class TenantService extends ArchbaseRemoteApiService<TenantDto, string> {
    constructor(@inject(API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
        super(client);
    }

    configureHeaders(): Record<string, string> {
        return {};
    }

    transform(data: any): TenantDto {
        return new TenantDto(data);
    }

    getEndpoint(): string {
        return '/tenants';
    }

    getId(entity: TenantDto): string {
        return entity.id;
    }

    isNewRecord(entity: TenantDto): boolean {
        return !entity.id || entity.id === '';
    }

    async delete<R>(id: string): Promise<R> {
        return this.client.delete<R>(`${this.getEndpoint()}/${id}`, {}, false);
    }

    async findOne(id: string): Promise<TenantDto> {
        const result = await this.client.get<TenantDto>(`${this.getEndpoint()}/${id}`, {}, false);
        return this.transform(result);
    }

    // Custom methods from Java controller
    async createEntity(entity: TenantDTO): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async updateEntity(id: string, entity: TenantDTO): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async removeEntity(id: string): Promise<boolean> {
        const result = await this.client.get<boolean>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async findById(id: string): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async findAll(): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async findAll(): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async findAll(true: (required &#x3D;): Promise<TenantDTO[]> {
        const result = await this.client.get<TenantDTO[]>(
            `/tenants`,
            {},
            false,
            { params: { true } }
        );
        return result;
            }

    async find(): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async find(): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async findByName(name: string): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async findByActive(&quot;true&quot;: (defaultValue &#x3D;): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false,
            { params: { &quot;true&quot; } }
        );
        return result;
            }

    async findByState(state: string, &quot;0&quot;: (defaultValue &#x3D;): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false,
            { params: { &quot;0&quot; } }
        );
        return result;
            }

    async findByCountry(country: string, &quot;0&quot;: (defaultValue &#x3D;): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false,
            { params: { &quot;0&quot; } }
        );
        return result;
            }

    async searchByName(name: string, &quot;0&quot;: (defaultValue &#x3D;): Promise<Page&lt;TenantDTO&gt;> {
        const result = await this.client.get<Page&lt;TenantDTO&gt;>(
            `/tenants`,
            {},
            false,
            { params: { name, &quot;0&quot; } }
        );
        return result;
            }

    async getStatistics(id: string): Promise<TenantStatisticsDTO> {
        const result = await this.client.get<TenantStatisticsDTO>(
            `/tenants`,
            {},
            false
        );
        return result;
            }

    async getPerformance(id: string, startDate: string, endDate: string): Promise<TenantPerformanceDTO> {
        const result = await this.client.get<TenantPerformanceDTO>(
            `/tenants`,
            {},
            false,
            { params: { startDate, endDate } }
        );
        return result;
            }

    async setTenantActive(id: string, active: boolean): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false,
            { params: { active } }
        );
        return result;
            }

    async updateDefaultCommissionRate(id: string, rate: number): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false,
            { params: { rate } }
        );
        return result;
            }

    async updateDefaultCashbackRate(id: string, rate: number): Promise<TenantDTO> {
        const result = await this.client.get<TenantDTO>(
            `/tenants`,
            {},
            false,
            { params: { rate } }
        );
        return result;
            }
}