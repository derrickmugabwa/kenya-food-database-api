import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthTokenEntity } from '../entities/oauth-token.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { OAuthToken } from '../../../../domain/oauth-token';
import { OAuthTokenMapper } from '../mappers/oauth-token.mapper';

@Injectable()
export class OAuthTokenRelationalRepository {
  constructor(
    @InjectRepository(OAuthTokenEntity)
    private readonly oauthTokenRepository: Repository<OAuthTokenEntity>,
  ) {}

  async create(data: OAuthToken): Promise<OAuthToken> {
    const persistenceModel = OAuthTokenMapper.toPersistence(data);
    const newEntity = await this.oauthTokenRepository.save(
      this.oauthTokenRepository.create(persistenceModel),
    );
    return OAuthTokenMapper.toDomain(newEntity);
  }

  async findByAccessToken(
    accessToken: string,
  ): Promise<NullableType<OAuthToken>> {
    const entity = await this.oauthTokenRepository.findOne({
      where: { accessToken },
    });

    return entity ? OAuthTokenMapper.toDomain(entity) : null;
  }

  async revokeToken(accessToken: string): Promise<void> {
    await this.oauthTokenRepository.update({ accessToken }, { revoked: true });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.oauthTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
