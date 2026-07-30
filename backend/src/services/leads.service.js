/**
 * leads.service.js — read leads + export (CSV path for now).
 */
import * as leadRepository from "../repositories/lead.repository.js";
import * as exportService from "./export.service.js";

export async function listAll() {
  return leadRepository.listLeads();
}

export async function listBySearchId(searchId) {
  return leadRepository.findLeadsBySearchId(searchId);
}

export async function getById(id) {
  return leadRepository.findLeadById(id);
}

export async function exportBySearchId(searchId, options = {}) {
  const ids = Array.isArray(options.ids) ? options.ids : [];
  let leads = await leadRepository.findLeadsBySearchId(searchId);

  if (ids.length > 0) {
    leads = leads.filter((lead) => ids.includes(lead.id));
  }

  const columns = options.columns || {};
  return exportService.buildAndRecordExport(searchId, leads, {
    ...columns,
    format: options.format || columns.format || "csv",
  });
}
