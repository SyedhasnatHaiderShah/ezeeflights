import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateEngineService {
  render(template: string, variables: Record<string, unknown>): string {
    const compiled = template.replace(/{{\s*([a-zA-Z0-9_\.]+)\s*}}/g, (_, key: string) => {
      const value = key.split('.').reduce<unknown>((acc, part) => {
        if (typeof acc === 'object' && acc !== null && part in (acc as Record<string, unknown>)) {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      }, variables);

      return value === undefined || value === null ? '' : String(value);
    });

    return compiled.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, '');
  }
}
