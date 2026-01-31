'use client';

import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminItemsTable, { TableColumn } from '@/components/admin/AdminItemsTable';
import FormSection from '@/components/admin/FormSection';
import { TurntableForm } from './components/TurntableForm';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';

interface Turntable {
  id: string;
  brandId: string;
  modelName: string;
  driveType?: string;
  motorType?: string;
  speeds?: string;
  wowFlutter?: number;
  weight?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: { id: string; name: string };
}

const COLUMNS: TableColumn<Turntable>[] = [
  {
    key: 'driveType',
    header: 'Drive Type',
    render: (item) => item.driveType || '-',
  },
  {
    key: 'specs',
    header: 'Specs',
    render: (item) => (item.weight ? `${item.weight}kg` : '-'),
  },
];

export default function TurntablesPage() {
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
  } = useAdminCrud<Turntable>({
    endpoint: '/api/turntables',
    modelName: 'Turntable',
    componentType: 'turntable',
  });

  return (
    <AdminPageLayout
      title="Turntables"
      subtitle={`Manage turntables - Simplified to ${FIELD_VISIBILITY.turntableBase.visible?.length || 0} core fields`}
      onCreateClick={handleCreate}
      createButtonText="Add New Turntable"
    >
      {showForm && (
        <FormSection title="Turntable" isEditing={!!editingData?.id} onCancel={() => setShowForm(false)}>
          <TurntableForm
            initialData={editingData}
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
        emptyMessage="No turntables found. Create your first turntable!"
      />
    </AdminPageLayout>
  );
}
