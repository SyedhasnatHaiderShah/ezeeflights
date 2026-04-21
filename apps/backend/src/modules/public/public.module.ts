import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Airlines')
@Controller({ path: 'airlines', version: '1' })
export class PublicAirlinesController {
  @Get()
  getAirlines() {
    Logger.log('GET /v1/airlines called', 'PublicAirlinesController');
    return [
      { id: '1', name: 'Emirates', code: 'EK', logoUrl: 'https://images.unsplash.com/photo-1610642372651-fe6e7bc209ef?auto=format&fit=crop&q=80&w=100' },
      { id: '2', name: 'Qatar Airways', code: 'QR', logoUrl: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&q=80&w=100' },
      { id: '3', name: 'British Airways', code: 'BA', logoUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&q=80&w=100' },
      { id: '4', name: 'Singapore Airlines', code: 'SQ', logoUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=100' },
      { id: '5', name: 'Turkish Airlines', code: 'TK', logoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=100' },
    ];
  }
}

@ApiTags('Public Reviews')
@Controller({ path: 'reviews', version: '1' })
export class PublicReviewsController {
  @Get('featured')
  getFeatured(@Query('limit') limit = 8) {
    Logger.log('GET /v1/reviews/featured called', 'PublicReviewsController');
    return [
      {
        id: '1',
        authorName: 'Sarah Johnson',
        authorAvatar: 'https://i.pravatar.cc/150?u=sarah',
        authorLocation: 'London, UK',
        rating: 5,
        text: 'The booking process was seamless. I found a great deal to Dubai that was much cheaper than other sites.',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        authorName: 'Michael Chen',
        authorAvatar: 'https://i.pravatar.cc/150?u=michael',
        authorLocation: 'Singapore',
        rating: 4,
        text: 'Great customer service. They helped me change my flight dates without any hassle.',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        authorName: 'Elena Rodriguez',
        authorAvatar: 'https://i.pravatar.cc/150?u=elena',
        authorLocation: 'Madrid, Spain',
        rating: 5,
        text: 'Stunning destinations suggested by the AI. Really impressed with the recommendations.',
        isVerified: true,
        createdAt: new Date().toISOString(),
      }
    ];
  }

  @Get('stats')
  getStats() {
    return {
      distribution: { 5: 850, 4: 120, 3: 20, 2: 5, 1: 5 },
      average: 4.8,
      total: 1000
    };
  }
}

@Module({
  controllers: [PublicAirlinesController, PublicReviewsController],
})
export class PublicModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('PublicModule initialized', 'PublicModule');
  }
}
