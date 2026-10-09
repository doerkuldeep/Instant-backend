import { Request, Response } from 'express';
import { partnerMachinesService } from '../services/partner-machines.service';
import {
  SelectPartnerMachineInput,
  BatchSelectPartnerMachinesInput,
  UpdatePartnerMachineInput,
  ListPartnerMachinesQuery,
  ListAvailableCatalogMachinesQuery,
} from '../schemas/partner-machines.schema';
import { UnauthorizedError } from '../../../shared/errors/http-errors';

const getParamId = (req: Request): string =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

export async function selectMachine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as SelectPartnerMachineInput;
  const result = await partnerMachinesService.selectMachine(req.user.id, input);

  res.status(201).json({
    success: true,
    message: 'Machine selected and rental pricing configured successfully',
    data: result,
  });
}

export async function batchSelectMachines(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const input = req.body as BatchSelectPartnerMachinesInput;
  const result = await partnerMachinesService.batchSelectMachines(req.user.id, input);

  res.status(201).json({
    success: true,
    message: `Successfully selected and configured rates for ${result.count} machine(s)`,
    data: result.machines,
    count: result.count,
  });
}

export async function listPartnerMachines(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const query = req.query as unknown as ListPartnerMachinesQuery;
  const { data, summary } = await partnerMachinesService.listPartnerMachines(req.user.id, query);

  res.status(200).json({
    success: true,
    data: data.data,
    meta: data.meta,
    summary,
  });
}

export async function getAvailableCatalogMachines(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const query = req.query as unknown as ListAvailableCatalogMachinesQuery;
  const result = await partnerMachinesService.getAvailableCatalogMachines(req.user.id, query);

  res.status(200).json({
    success: true,
    data: result,
    count: result.length,
  });
}

export async function getPartnerMachine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const id = getParamId(req);
  const result = await partnerMachinesService.getPartnerMachine(req.user.id, id);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function updatePartnerMachine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const id = getParamId(req);
  const input = req.body as UpdatePartnerMachineInput;
  const result = await partnerMachinesService.updatePartnerMachine(req.user.id, id, input);

  res.status(200).json({
    success: true,
    message: 'Partner machine rates and details updated successfully',
    data: result,
  });
}

export async function removePartnerMachine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError('Unauthorized');

  const id = getParamId(req);
  const result = await partnerMachinesService.removePartnerMachine(req.user.id, id);

  res.status(200).json({
    success: true,
    message: result.message,
    data: { machineId: result.machineId },
  });
}

export async function getMachinePartnerOffers(req: Request, res: Response): Promise<void> {
  const idOrSlug = Array.isArray(req.params.idOrSlug)
    ? req.params.idOrSlug[0]
    : req.params.idOrSlug;
  const offers = await partnerMachinesService.getPartnerOffersForMachine(idOrSlug);

  res.status(200).json({
    success: true,
    data: offers,
    count: offers.length,
  });
}

export const partnerMachinesController = {
  selectMachine,
  batchSelectMachines,
  listPartnerMachines,
  getAvailableCatalogMachines,
  getPartnerMachine,
  updatePartnerMachine,
  removePartnerMachine,
  getMachinePartnerOffers,
};
