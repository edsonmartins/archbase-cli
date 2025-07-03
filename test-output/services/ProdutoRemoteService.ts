import { injectable, inject } from 'inversify';
import { ArchbaseRemoteApiService, ArchbaseRemoteApiClient, API_TYPE } from 'archbase-react';

@injectable()
export class ProdutoRemoteService extends ArchbaseRemoteApiService<ProdutoDto, string> {
    constructor(@inject(API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
        super(client);
    }

    configureHeaders(): Record<string, string> {
        return {};
    }

    transform(data: any): ProdutoDto {
        return new ProdutoDto(data);
    }

    getEndpoint(): string {
        return '/api/produtos';
    }

    getId(entity: ProdutoDto): string {
        return entity.id;
    }

    isNewRecord(entity: ProdutoDto): boolean {
        return !entity.id || entity.id === '';
    }

    async delete<R>(id: string): Promise<R> {
        return this.client.delete<R>(`${this.getEndpoint()}/${id}`, {}, false);
    }

    async findOne(id: string): Promise<ProdutoDto> {
        const result = await this.client.get<ProdutoDto>(`${this.getEndpoint()}/${id}`, {}, false);
        return this.transform(result);
    }
}