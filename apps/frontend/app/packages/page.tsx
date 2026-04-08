import { PackageCard } from '@/components/packages/PackageCard';
import { listPackages } from '@/lib/api/packages-api';

export default async function PackagesPage() {
  const res = await listPackages();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Travel Packages</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {res.data.map((item) => <PackageCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
