'use client';

import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminItemsTable, { TableColumn } from '@/components/admin/AdminItemsTable';
import FormSection from '@/components/admin/FormSection';
import { TonearmForm } from './components/TonearmForm';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';

interface Tonearm {
  id: string;
  brandId: string;
  modelName: string;
  armType?: string;
  effectiveMass?: number;
  effectiveLength?: number;
  headshellType?: string;
  vtaAdjustable?: boolean;
  azimuthAdjust?: boolean;
  totalWeight?: number;
  height?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: { id: string; name: string };
}

const COLUMNS: TableColumn<Tonearm>[] = [
  {
    key: 'armType',
    header: 'Type',
    render: (item) => item.armType || '-',
  },
  {
    key: 'specs',
    header: 'Specs',
    render: (item) => (item.effectiveMass ? `${item.effectiveMass}g` : '-'),
  },
];

export default function TonearmsPage() {
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
  } = useAdminCrud<Tonearm>({
    endpoint: '/api/tonearms',
    modelName: 'Tonearm',
  });

  return (
    <AdminPageLayout
      title="Tonearms"
      subtitle={`Manage tonearms - Simplified to ${FIELD_VISIBILITY.tonearm.visible?.length || 0} core fields`}
      onCreateClick={handleCreate}
      createButtonText="Add New Tonearm"
    >
      {showForm && (
        <FormSection title="Tonearm" isEditing={!!editingData?.id} onCancel={() => setShowForm(false)}>
          <TonearmForm
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
        emptyMessage="No tonearms found. Create your first tonearm!"
      />
    </AdminPageLayout>
  );
}
