import { TemplateEngineService } from '../src/modules/notification/services/template-engine.service';

describe('TemplateEngineService', () => {
  it('renders variables and sanitizes html', () => {
    const service = new TemplateEngineService();
    const result = service.render('Hi {{name}} <script>alert(1)</script>', { name: 'Jane' });
    expect(result).toBe('Hi Jane ');
  });
});
