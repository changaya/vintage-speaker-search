'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Brand {
  id: string;
  name: string;
}

export interface ComponentImage {
  id?: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  isNew?: boolean;
}

export interface UseAdminCrudConfig {
  endpoint: string;
  modelName: string;
  componentType?: string; // For multi-image handling (e.g., 'turntable', 'cartridge')
}

export interface UseAdminCrudResult<T> {
  items: T[];
  brands: Brand[];
  isLoading: boolean;
  showForm: boolean;
  editingData: T | undefined;
  images: ComponentImage[];
  setShowForm: (show: boolean) => void;
  setImages: (images: ComponentImage[]) => void;
  handleCreate: () => void;
  handleEdit: (item: T) => Promise<void>;
  handleDelete: (id: string, modelName: string) => Promise<void>;
  handleFormSubmit: (data: any) => Promise<string | undefined>;
  refetch: () => Promise<void>;
  fetchComponentImages: (componentId: string) => Promise<void>;
  saveComponentImages: (componentId: string) => Promise<void>;
}

export function useAdminCrud<T extends { id: string; modelName: string }>(
  config: UseAdminCrudConfig
): UseAdminCrudResult<T> {
  const { endpoint, modelName, componentType } = config;

  const [items, setItems] = useState<T[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<T | undefined>();
  const [images, setImages] = useState<ComponentImage[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get<T[]>(endpoint);
      setItems(response.data);
    } catch (error) {
      console.error(`Failed to fetch ${modelName}s:`, error);
      toast.error(`Failed to load ${modelName}s`);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, modelName]);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await api.get<Brand[]>('/api/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    }
  }, []);

  const fetchComponentImages = useCallback(
    async (componentId: string) => {
      if (!componentType) return;
      try {
        const response = await api.get(`/api/component-images/${componentType}/${componentId}`);
        const fetchedImages: ComponentImage[] = (response.data.images || []).map((img: any) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
          isNew: false,
        }));
        setImages(fetchedImages);
      } catch (error) {
        console.error('Failed to fetch component images:', error);
        setImages([]);
      }
    },
    [componentType]
  );

  const saveComponentImages = useCallback(
    async (componentId: string) => {
      if (!componentType || images.length === 0) return;
      try {
        const imagesPayload = images.map((img, index) => ({
          id: img.id && img.id > 0 ? img.id : undefined,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: index,
        }));

        await api.put(`/api/component-images/${componentType}/${componentId}`, {
          images: imagesPayload,
        });
      } catch (error) {
        console.error('Failed to save component images:', error);
        toast.error('Failed to save images');
      }
    },
    [componentType, images]
  );

  useEffect(() => {
    fetchItems();
    fetchBrands();
  }, [fetchItems, fetchBrands]);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setImages([]);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback(
    async (item: T) => {
      try {
        const response = await api.get(`${endpoint}/${item.id}`);
        const fullItem = response.data;
        setEditingData(fullItem);

        // Fetch component images if supported
        if (componentType) {
          await fetchComponentImages(item.id);
        }

        setShowForm(true);
      } catch (error) {
        console.error(`Failed to fetch ${modelName} details:`, error);
        toast.error(`Failed to load ${modelName} details`);
      }
    },
    [endpoint, modelName, componentType, fetchComponentImages]
  );

  const handleDelete = useCallback(
    async (id: string, itemModelName: string) => {
      if (!confirm(`Are you sure you want to delete "${itemModelName}"?`)) {
        return;
      }

      try {
        await api.delete(`${endpoint}/${id}`);
        toast.success(`${modelName} deleted successfully`);
        fetchItems();
      } catch (error: any) {
        console.error('Delete error:', error);
        const message = error.response?.data?.message || `Failed to delete ${modelName}`;
        toast.error(message);
      }
    },
    [endpoint, modelName, fetchItems]
  );

  const handleFormSubmit = useCallback(
    async (data: any): Promise<string | undefined> => {
      try {
        let componentId: string | undefined;
        if (editingData?.id) {
          await api.put(`${endpoint}/${editingData.id}`, data);
          componentId = editingData.id;
          toast.success(`${modelName} updated successfully`);
        } else {
          const response = await api.post(endpoint, data);
          componentId = response.data.id;
          toast.success(`${modelName} created successfully`);
        }

        // Save component images if supported
        if (componentType && componentId && images.length > 0) {
          await saveComponentImages(componentId);
        }

        setShowForm(false);
        fetchItems();
        return componentId;
      } catch (error: any) {
        console.error('Submit error:', error);
        const message = error.response?.data?.message || `Failed to save ${modelName}`;
        toast.error(message);
        throw error;
      }
    },
    [endpoint, modelName, editingData, componentType, images, saveComponentImages, fetchItems]
  );

  return {
    items,
    brands,
    isLoading,
    showForm,
    editingData,
    images,
    setShowForm,
    setImages,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    refetch: fetchItems,
    fetchComponentImages,
    saveComponentImages,
  };
}

export default useAdminCrud;
