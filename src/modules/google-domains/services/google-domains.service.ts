import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleDomainRepository } from 'modules/google-domains/repositories/google-domain.repository';
import { GoogleDomainsResponse } from 'modules/google-domains/responses/google-domains.response';
import { IdType } from 'modules/common/types/id-type.type';
import { GoogleDomainEntity } from 'modules/google-domains/entities/google-domain.entity';

@Injectable()
export class GoogleDomainsService {
  constructor(
    private readonly googleDomainsRepository: GoogleDomainRepository,
  ) {}
  /**
   * Retrieves all Google domains from the repository.
   *
   * @return {Promise<GoogleDomainsResponse>} A promise that resolves to a GoogleDomainsResponse object containing the list of Google domains.
   */
  async getAll(): Promise<GoogleDomainsResponse> {
    const googleDomains = await this.googleDomainsRepository.find();
    return new GoogleDomainsResponse({ items: googleDomains });
  }

  /**
   * Retrieves a Google domain by its unique identifier.
   *
   * @param {IdType} googleDomainId - The unique identifier of the Google domain to retrieve.
   * @return {Promise<GoogleDomainEntity>} A promise that resolves to the Google domain entity.
   * @throws {NotFoundException} If no Google domain is found with the provided identifier.
   */
  async getGoogleDomain(googleDomainId: IdType): Promise<GoogleDomainEntity> {
    const googleDomain = await this.googleDomainsRepository.getGoogleDomainById(
      googleDomainId,
    );

    if (!googleDomain) {
      throw new NotFoundException('Google domain not found');
    }
    return googleDomain;
  }
}
