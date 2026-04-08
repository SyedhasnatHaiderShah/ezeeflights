import { Injectable } from '@nestjs/common';
import { CreatePackageDto, PackageQueryDto, UpdatePackageDto } from './dto/package.dto';
import { PackageRepository } from './package.repository';

@Injectable()
export class PackageService {
  constructor(private readonly repository: PackageRepository) {}

  async create(createdBy: string, dto: CreatePackageDto) {
    const slug = this.makeSlug(dto.title);
    return this.repository.createPackage(createdBy, slug, dto);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const slug = dto.title ? this.makeSlug(dto.title) : undefined;
    return this.repository.updatePackage(id, dto, slug);
  }

  delete(id: string) {
    return this.repository.deletePackage(id);
  }

  list(query: PackageQueryDto, includeUnpublished = false) {
    return this.repository.listPackages(query, includeUnpublished);
  }

  getBySlug(slug: string) {
    return this.repository.findPackageBySlug(slug);
  }

  getById(id: string) {
    return this.repository.findPackageById(id);
  }

  private makeSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
