import { Request, Response } from 'express';
import { ZodSchema } from 'zod';
import {
  handlePrismaError,
  sendValidationError,
  sendNotFound,
  sendSuccess,
  sendDeleteSuccess,
} from './error-response.util';
import {
  filterHiddenFields,
  filterHiddenFieldsArray,
  filterDtoFields,
} from './field-filter.util';

type FieldVisibilityKey = 'cartridge' | 'tonearm' | 'sut' | 'phonoPreamp' | 'turntableBase';

export interface CrudControllerConfig {
  modelName: string;
  fieldVisibilityKey: FieldVisibilityKey;
  prismaModel: any;
  createSchema: ZodSchema;
  updateSchema: ZodSchema;
  getAllIncludes: object;
  getByIdIncludes: object;
  orderBy?: object[];

  // Optional hooks for model-specific logic
  beforeCreate?: (data: any) => any;
  beforeUpdate?: (data: any, existingRecord: any) => any;
  afterFindById?: (record: any) => any;
}

export interface CrudControllerMethods {
  getAll: (req: Request, res: Response) => Promise<void>;
  getById: (req: Request, res: Response) => Promise<void>;
  create: (req: Request, res: Response) => Promise<void>;
  update: (req: Request, res: Response) => Promise<void>;
  delete: (req: Request, res: Response) => Promise<void>;
}

/**
 * Factory function that creates standardized CRUD controller methods
 *
 * This reduces boilerplate by generating consistent implementations for:
 * - getAll: List all records with filtering
 * - getById: Get single record with detailed includes
 * - create: Create new record with validation
 * - update: Update existing record
 * - delete: Delete record
 *
 * Model-specific logic can be handled through beforeCreate/beforeUpdate hooks
 */
export function createCrudController(config: CrudControllerConfig): CrudControllerMethods {
  const {
    modelName,
    fieldVisibilityKey,
    prismaModel,
    createSchema,
    updateSchema,
    getAllIncludes,
    getByIdIncludes,
    orderBy = [{ modelName: 'asc' }],
    beforeCreate,
    beforeUpdate,
    afterFindById,
  } = config;

  const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await prismaModel.findMany({
        orderBy,
        include: getAllIncludes,
      });

      const filtered = filterHiddenFieldsArray(fieldVisibilityKey, records);
      sendSuccess(res, filtered);
    } catch (error: any) {
      handlePrismaError(res, error, modelName);
    }
  };

  const getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      let record = await prismaModel.findUnique({
        where: { id },
        include: getByIdIncludes,
      });

      if (!record) {
        sendNotFound(res, modelName);
        return;
      }

      // Apply afterFindById hook if provided
      if (afterFindById) {
        record = afterFindById(record);
      }

      const filtered = filterHiddenFields(fieldVisibilityKey, record);
      sendSuccess(res, filtered);
    } catch (error: any) {
      handlePrismaError(res, error, modelName);
    }
  };

  const create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = createSchema.safeParse(req.body);
      if (!validation.success) {
        sendValidationError(res, validation.error.errors);
        return;
      }

      let data = filterDtoFields(fieldVisibilityKey, validation.data);

      // Apply beforeCreate hook if provided
      if (beforeCreate) {
        data = beforeCreate(data);
      }

      const record = await prismaModel.create({
        data,
        include: {
          brand: true,
        },
      });

      const filtered = filterHiddenFields(fieldVisibilityKey, record);
      sendSuccess(res, filtered, 201);
    } catch (error: any) {
      handlePrismaError(res, error, modelName);
    }
  };

  const update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        sendValidationError(res, validation.error.errors);
        return;
      }

      // Check if record exists first
      const existingRecord = await prismaModel.findUnique({ where: { id } });
      if (!existingRecord) {
        sendNotFound(res, modelName);
        return;
      }

      let data = filterDtoFields(fieldVisibilityKey, validation.data);

      // Apply beforeUpdate hook if provided
      if (beforeUpdate) {
        data = beforeUpdate(data, existingRecord);
      }

      const record = await prismaModel.update({
        where: { id },
        data,
        include: {
          brand: true,
        },
      });

      const filtered = filterHiddenFields(fieldVisibilityKey, record);
      sendSuccess(res, filtered);
    } catch (error: any) {
      handlePrismaError(res, error, modelName);
    }
  };

  const deleteRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await prismaModel.delete({
        where: { id },
      });

      sendDeleteSuccess(res, modelName);
    } catch (error: any) {
      handlePrismaError(res, error, modelName);
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    delete: deleteRecord,
  };
}

export default createCrudController;
