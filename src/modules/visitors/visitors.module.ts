import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorRepository } from 'modules/visitors/repositories/visitor.repository';
import { VisitorsService } from 'modules/visitors/services/visitors.service';
import { VisitorsController } from 'modules/visitors/controllers/visitors.controller';

/**
 * The VisitorsModule is responsible for handling the visitor-related logic within the application.
 * It imports the necessary TypeOrmModule configured with the VisitorRepository,
 * provides the VisitorsService for business logic, and uses the VisitorsController
 * to handle incoming HTTP requests.
 * The VisitorsService is also exported to make it available for use in other modules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([VisitorRepository])],
  providers: [VisitorsService],
  controllers: [VisitorsController],
  exports: [VisitorsService],
})
export class VisitorsModule {}
