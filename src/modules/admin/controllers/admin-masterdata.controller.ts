import { Request, Response } from 'express';
import { adminMasterDataService } from '../services/admin-masterdata.service';
import {
  AdminCreateCategoryInput,
  AdminUpdateCategoryInput,
  AdminListCategoriesQuery,
  AdminCreateMachineInput,
  AdminUpdateMachineInput,
  AdminListMachinesQuery,
} from '../schemas/admin-masterdata.schema';

// ----------------- Category Handlers -----------------

export async function listCategories(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as AdminListCategoriesQuery;
  const result = await adminMasterDataService.listCategories(query);

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getCategoryById(req: Request, res: Response): Promise<void> {
  const identifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const category = await adminMasterDataService.getCategoryById(identifier);

  res.status(200).json({
    success: true,
    data: category,
  });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const input = req.body as AdminCreateCategoryInput;
  const created = await adminMasterDataService.createCategory(input);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: created,
  });
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const identifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = req.body as AdminUpdateCategoryInput;
  const updated = await adminMasterDataService.updateCategory(identifier, input);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: updated,
  });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const identifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await adminMasterDataService.deleteCategory(identifier);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
}

// ----------------- Machine Handlers -----------------

export async function listMachines(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as AdminListMachinesQuery;
  const result = await adminMasterDataService.listMachines(query);

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getMachineById(req: Request, res: Response): Promise<void> {
  const identifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const machine = await adminMasterDataService.getMachineById(identifier);

  res.status(200).json({
    success: true,
    data: machine,
  });
}

export async function createMachine(req: Request, res: Response): Promise<void> {
  const input = req.body as AdminCreateMachineInput;
  const created = await adminMasterDataService.createMachine(input);

  res.status(201).json({
    success: true,
    message: 'Machine created successfully',
    data: created,
  });
}

export async function updateMachine(req: Request, res: Response): Promise<void> {
  const identifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = req.body as AdminUpdateMachineInput;
  const updated = await adminMasterDataService.updateMachine(identifier, input);

  res.status(200).json({
    success: true,
    message: 'Machine updated successfully',
    data: updated,
  });
}

export async function deleteMachine(req: Request, res: Response): Promise<void> {
  const identifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await adminMasterDataService.deleteMachine(identifier);

  res.status(200).json({
    success: true,
    message: 'Machine deleted successfully',
  });
}

// ----------------- Masterdata Overview & Stats -----------------

export async function getMasterDataOverview(_req: Request, res: Response): Promise<void> {
  const overview = await adminMasterDataService.getMasterDataOverview();

  res.status(200).json({
    success: true,
    data: overview,
  });
}

export async function getMasterDataStats(_req: Request, res: Response): Promise<void> {
  const stats = await adminMasterDataService.getMasterDataStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
}

export const adminMasterDataController = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  listMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMasterDataOverview,
  getMasterDataStats,
};
