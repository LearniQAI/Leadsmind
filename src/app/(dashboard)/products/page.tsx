import { getCurrentWorkspaceId } from '@/lib/auth';
import { getProducts } from '@/app/actions/finance';
import { ProductsClient } from '@/components/products/ProductsClient';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const products = await getProducts(workspaceId);

  return (
    <ProductsClient initialProducts={products} />
  );
}
