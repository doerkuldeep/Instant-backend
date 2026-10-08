import { Request, Response } from 'express';
import { machinesService } from '../services/machines.service';
import {
  ListCategoriesQuery,
  ListMachinesQuery,
  SearchSuggestionsQuery,
} from '../schemas/machines.schema';

const getParamIdOrSlug = (req: Request): string =>
  Array.isArray(req.params.idOrSlug) ? req.params.idOrSlug[0] : req.params.idOrSlug;

export async function listCategories(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListCategoriesQuery;
  const categories = await machinesService.listCategories(query);

  res.status(200).json({
    success: true,
    data: categories,
  });
}

export async function getCategoryByIdOrSlug(req: Request, res: Response): Promise<void> {
  const idOrSlug = getParamIdOrSlug(req);
  const category = await machinesService.getCategoryByIdOrSlug(idOrSlug);

  res.status(200).json({
    success: true,
    data: category,
  });
}

export async function listMachines(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListMachinesQuery;
  const result = await machinesService.listMachines(query);

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getMachineByIdOrSlug(req: Request, res: Response): Promise<void> {
  const idOrSlug = getParamIdOrSlug(req);
  const machine = await machinesService.getMachineByIdOrSlug(idOrSlug);

  res.status(200).json({
    success: true,
    data: machine,
  });
}

export async function getSegmentsOverview(_req: Request, res: Response): Promise<void> {
  const segments = await machinesService.getSegmentsOverview();

  res.status(200).json({
    success: true,
    data: segments,
  });
}

export async function getFeaturedMachines(_req: Request, res: Response): Promise<void> {
  const featured = await machinesService.getFeaturedMachines();

  res.status(200).json({
    success: true,
    data: featured,
  });
}

export async function getSearchSuggestions(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as SearchSuggestionsQuery;
  const suggestions = await machinesService.getSearchSuggestions(query);

  res.status(200).json({
    success: true,
    data: suggestions,
  });
}
