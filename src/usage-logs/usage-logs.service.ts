import {
  // common
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateUsageLogDto } from './dto/create-usage-log.dto';
import { UpdateUsageLogDto } from './dto/update-usage-log.dto';
import { UsageLogRepository } from './infrastructure/persistence/usage-log.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { UsageLog } from './domain/usage-log';
import { OAuthService } from '../oauth/oauth.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class UsageLogsService {
  constructor(
    // Dependencies here
    private readonly usageLogRepository: UsageLogRepository,
    @Inject(forwardRef(() => OAuthService))
    private readonly oauthService: OAuthService,
  ) {}

  async create(createUsageLogDto: CreateUsageLogDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.usageLogRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      ...createUsageLogDto,
    } as UsageLog);
  }

  async findAllWithPagination({
    paginationOptions,
    userId,
    userRole,
  }: {
    paginationOptions: IPaginationOptions;
    userId?: number;
    userRole?: RoleEnum;
  }) {
    let oauthClientIds: number[] | undefined;

    // If user is not admin, filter by their OAuth clients
    if (userRole !== RoleEnum.admin && userId) {
      // Get all OAuth clients belonging to this user
      const userOAuthClients = await this.oauthService.findClientsByUserId(
        userId,
        {
          paginationOptions: {
            page: 1,
            limit: 1000, // Get all clients for filtering
          },
        },
      );
      oauthClientIds = userOAuthClients.map((client) => client.id);

      // If user has no OAuth clients, return empty array
      if (oauthClientIds.length === 0) {
        return [];
      }
    }

    return this.usageLogRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      apiKeyIds: oauthClientIds, // Still using apiKeyIds parameter name for backward compatibility
    });
  }

  findById(id: UsageLog['id']) {
    return this.usageLogRepository.findById(id);
  }

  findByIds(ids: UsageLog['id'][]) {
    return this.usageLogRepository.findByIds(ids);
  }

  async update(
    id: UsageLog['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateUsageLogDto: UpdateUsageLogDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.usageLogRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: UsageLog['id']) {
    return this.usageLogRepository.remove(id);
  }
}
