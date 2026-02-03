import { Test, TestingModule } from '@nestjs/testing';
import { GamingController } from './gaming.controller';
import { GamingService } from './gaming.service';

describe('GamingController', () => {
  let gamingController: GamingController;
  let gamingService: GamingService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GamingController],
      providers: [
        {
          provide: GamingService,
          useValue: {
            register: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    gamingController = app.get<GamingController>(GamingController);
    gamingService = app.get<GamingService>(GamingService);
  });

  it('should be defined', () => {
    expect(gamingController).toBeDefined();
  });
});
