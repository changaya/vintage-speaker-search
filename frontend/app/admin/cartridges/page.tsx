'use client';

import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminItemsTable, { TableColumn } from '@/components/admin/AdminItemsTable';
import FormSection from '@/components/admin/FormSection';
import { CartridgeForm } from './components/CartridgeForm';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';

interface Cartridge {
  id: string;
  brandId: string;
  modelName: string;
  cartridgeType: string;
  outputVoltage?: number;
  outputImpedance?: number;
  compliance?: number;
  trackingForceMin?: number;
  trackingForceMax?: number;
  stylusType?: string;
  channelSeparation?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: { id: string; name: string };
}

const COLUMNS: TableColumn<Cartridge>[] = [
  { key: 'cartridgeType', header: 'Type' },
  {
    key: 'specs',
    header: 'Specs',
    render: (item) =>
      [
        item.outputVoltage && `${item.outputVoltage}mV`,
        item.compliance && `${item.compliance}µm/mN`,
      ]
        .filter(Boolean)
        .join(' / ') || '-',
  },
];

export default function CartridgesPage() {
  const {
    items,
    isLoading,
    showForm,
    editingData,
    setShowForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
  } = useAdminCrud<Cartridge>({
    endpoint: '/api/cartridges',
    modelName: 'Cartridge',
  });

  return (
    <AdminPageLayout
      title="Cartridges"
      subtitle={`Manage cartridges - Simplified to ${FIELD_VISIBILITY.cartridge.visible?.length || 0} core fields`}
      onCreateClick={handleCreate}
      createButtonText="Add New Cartridge"
    >
      {showForm && (
        <FormSection title="Cartridge" isEditing={!!editingData?.id} onCancel={() => setShowForm(false)}>
          <CartridgeForm
            initialData={editingData as any}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            isEditing={!!editingData?.id}
          />
        </FormSection>
      )}

      <AdminItemsTable
        items={items}
        isLoading={isLoading}
        columns={COLUMNS}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No cartridges found. Create your first cartridge!"
      />
    </AdminPageLayout>
  );
}
