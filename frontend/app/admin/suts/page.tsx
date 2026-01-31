'use client';

import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminItemsTable, { TableColumn } from '@/components/admin/AdminItemsTable';
import FormSection from '@/components/admin/FormSection';
import { SUTForm } from './components/SUTForm';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';

interface SUT {
  id: string;
  brandId: string;
  modelName: string;
  transformerType?: string;
  gainDb?: number;
  gainRatio?: string;
  inputImpedance?: number;
  freqRespLow?: number;
  freqRespHigh?: number;
  inputConnectors?: string;
  outputConnectors?: string;
  channels?: number;
  balanced?: boolean;
  weight?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: { id: string; name: string };
}

const COLUMNS: TableColumn<SUT>[] = [
  {
    key: 'gainDb',
    header: 'Gain',
    render: (item) => (item.gainDb ? `${item.gainDb}dB` : '-'),
  },
  {
    key: 'gainRatio',
    header: 'Specs',
    render: (item) => item.gainRatio || '-',
  },
];

export default function SUTsPage() {
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
  } = useAdminCrud<SUT>({
    endpoint: '/api/suts',
    modelName: 'SUT',
  });

  return (
    <AdminPageLayout
      title="Step-Up Transformers (SUTs)"
      subtitle={`Manage SUTs - Simplified to ${FIELD_VISIBILITY.sut.visible?.length || 0} core fields`}
      onCreateClick={handleCreate}
      createButtonText="Add New SUT"
    >
      {showForm && (
        <FormSection title="SUT" isEditing={!!editingData?.id} onCancel={() => setShowForm(false)}>
          <SUTForm
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
        emptyMessage="No SUTs found. Create your first SUT!"
      />
    </AdminPageLayout>
  );
}
