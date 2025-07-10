import { injectable, inject } from 'inversify';
import { ArchbaseRemoteApiService, ArchbaseRemoteApiClient, API_TYPE } from 'archbase-react';
import { PlatformKPIDto } from '../domain/PlatformKPIDto';

@injectable()
export class ExecutiveDashboardRemoteService extends ArchbaseRemoteApiService<PlatformKPIDto, string> {
    constructor(@inject(API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
        super(client);
    }

    configureHeaders(): Record<string, string> {
        return {};
    }

    transform(data: any): PlatformKPIDto {
        return new PlatformKPIDto(data);
    }

    getEndpoint(): string {
        return '/platformkpis';
    }

    getId(entity: PlatformKPIDto): string {
        return entity.id;
    }

    isNewRecord(entity: PlatformKPIDto): boolean {
        return !entity.id || entity.id === '';
    }

    async delete<R>(id: string): Promise<R> {
        return this.client.delete<R>(`${this.getEndpoint()}/${id}`, {}, false);
    }

    async findOne(id: string): Promise<PlatformKPIDto> {
        const result = await this.client.get<PlatformKPIDto>(`${this.getEndpoint()}/${id}`, {}, false);
        return this.transform(result);
    }
}