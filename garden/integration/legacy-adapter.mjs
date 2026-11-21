/**
 * Existing turtle-math-forest reward data -> free-layout garden.
 * Pure: never reads localStorage, never changes the supplied profile.
 */
export const LEGACY_CATALOG = Object.freeze([
  'daisy', 'ladybug', 'tulip', 'butterfly', 'mushroom', 'squirrel',
  'hyacinth', 'duck', 'sunflower', 'rabbit', 'clover', 'lotus',
]);

// An explicit allocation guard, NOT a cap on earned rewards. Larger input
// throws before migration; the caller must retain the untouched original data.
export const MAX_MATERIALIZED_REWARDS = 100_000;
const EXTRA_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const KIND = /^[a-z][a-z0-9-]{0,63}$/;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const warning = (code, message, details = {}) => ({code, message, ...details});
const uniqueRecovery = entries => [...new Map(entries.map(entry => [JSON.stringify(entry), entry])).values()];

export class GardenDataError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GardenDataError';
    this.code = code;
  }
}

function rewardCount(profile) {
  const count = profile.rewards === undefined ? 0 : profile.rewards;
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new GardenDataError('INVALID_REWARD_COUNT', '보상 개수가 올바른 0 이상의 정수가 아닙니다. 원본을 유지하고 데이터를 확인하세요.');
  }
  if (count > MAX_MATERIALIZED_REWARDS) {
    throw new GardenDataError('REWARD_ALLOCATION_LIMIT', `보상 ${count}개는 이 어댑터의 메모리 보호 범위(${MAX_MATERIALIZED_REWARDS}개)를 넘습니다. 개수를 줄이거나 잘라 저장하지 말고 페이지 단위 처리로 전환하세요.`);
  }
  return count;
}

/** Stable legacy slot centers. The scene may project them to valid habitats. */
export function legacySlotPosition(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= 12) {
    throw new RangeError('Legacy garden slots are numbered 0 through 11.');
  }
  return {x: 0.12 + (slot % 6) * 0.152, y: slot < 6 ? 0.48 : 0.72};
}

function inventory(profile, warnings, recoverableItems) {
  const count = rewardCount(profile);
  const items = Array.from({length: count}, (_, index) => ({
    id: `reward-${index + 1}`,
    kind: LEGACY_CATALOG[index % LEGACY_CATALOG.length],
    source: 'earned', placed: false, x: null, y: null,
  }));
  if (profile.extraRewards !== undefined && !Array.isArray(profile.extraRewards)) {
    throw new GardenDataError('INVALID_EXTRA_REWARDS', 'extraRewards가 배열이 아닙니다. 원본을 유지하고 추가 보상 데이터를 확인하세요.');
  }
  const extraIds = new Set();
  for (const extra of profile.extraRewards ?? []) {
    if (!isRecord(extra) || !EXTRA_ID.test(extra.id ?? '') || !KIND.test(extra.kind ?? '')) {
      recoverableItems.push({reason: 'INVALID_EXTRA_REWARD', item: clone(extra)});
      warnings.push(warning('INVALID_EXTRA_REWARD', '형식이 잘못된 추가 보상을 복구 대기 목록에 보존했습니다.'));
      continue;
    }
    const id = `extra-${extra.id}`;
    if (extraIds.has(id)) {
      recoverableItems.push({reason: 'DUPLICATE_EXTRA_REWARD', item: clone(extra)});
      warnings.push(warning('DUPLICATE_EXTRA_REWARD', '동일한 추가 보상 ID를 한 번만 반영했습니다. 중복 원본은 보존했습니다.', {id}));
      continue;
    }
    extraIds.add(id);
    items.push({id, kind: extra.kind, source: 'extra', placed: false, x: null, y: null});
  }
  return items;
}

function validPosition(item) {
  return Number.isFinite(item.x) && Number.isFinite(item.y)
    && item.x >= 0 && item.x <= 1 && item.y >= 0 && item.y <= 1;
}

function applyPositions(items, entries, warnings, recoverableItems, {keepOmitted = false} = {}) {
  const byId = new Map(items.map(item => [item.id, item]));
  const seen = new Set();
  for (const entry of entries) {
    if (!isRecord(entry) || typeof entry.id !== 'string') {
      recoverableItems.push({reason: 'INVALID_LAYOUT_ITEM', item: clone(entry)});
      warnings.push(warning('INVALID_LAYOUT_ITEM', '형식이 잘못된 배치 정보를 복구 대기 목록에 보존했습니다.'));
      continue;
    }
    const target = byId.get(entry.id);
    if (!target) {
      const code = /^reward-\d+$/.test(entry.id) ? 'REWARD_COUNT_BEHIND_LAYOUT' : 'UNVERIFIED_LAYOUT_ITEM';
      recoverableItems.push({reason: code, item: clone(entry)});
      warnings.push(warning(code, '획득 원장으로 확인되지 않는 배치를 복구 대기 목록에 보존했습니다. 보상을 새로 만들지는 않았습니다.', {id: entry.id}));
      continue;
    }
    if (seen.has(entry.id)) {
      recoverableItems.push({reason: 'DUPLICATE_LAYOUT_ID', item: clone(entry)});
      warnings.push(warning('DUPLICATE_LAYOUT_ID', '중복 배치 ID의 첫 항목만 반영하고 나머지 원본은 보존했습니다.', {id: entry.id}));
      continue;
    }
    seen.add(entry.id);
    if (entry.kind !== target.kind || (entry.source !== undefined && entry.source !== target.source)) {
      recoverableItems.push({reason: 'IDENTITY_MISMATCH', item: clone(entry)});
      warnings.push(warning('IDENTITY_MISMATCH', '보상 종류가 획득 원장과 달라 해당 보상을 보관함으로 돌렸습니다.', {id: entry.id}));
      target.placed = false; target.x = null; target.y = null;
      continue;
    }
    // Preserve inert extension fields on verified instances. Canonical identity
    // always wins; placement is validated below.
    const identity = {id: target.id, kind: target.kind, source: target.source};
    for (const [key, value] of Object.entries(clone(entry))) {
      if (!['__proto__', 'constructor', 'prototype'].includes(key)) target[key] = value;
    }
    Object.assign(target, identity);
    if (entry.placed === true && validPosition(entry)) {
      target.placed = true; target.x = entry.x; target.y = entry.y;
    } else {
      target.placed = false; target.x = null; target.y = null;
      if (entry.placed === true) {
        recoverableItems.push({reason: 'INVALID_POSITION', item: clone(entry)});
        warnings.push(warning('INVALID_POSITION', '범위를 벗어나거나 잘못된 좌표의 보상을 보관함으로 돌렸습니다.', {id: entry.id}));
      }
    }
  }
  // Inventory is authoritative: omission never deletes an earned object.
  if (!keepOmitted) for (const item of items) {
    if (!seen.has(item.id)) {item.placed = false; item.x = null; item.y = null;}
  }
  return items;
}

function migrateSlots(profile, items, warnings, recoverableItems) {
  if (profile.garden !== undefined && !Array.isArray(profile.garden)) {
    recoverableItems.push({reason: 'INVALID_LEGACY_GARDEN', item: clone(profile.garden)});
    warnings.push(warning('INVALID_LEGACY_GARDEN', '기존 정원 배열이 손상되어 획득한 보상을 보관함에 표시합니다. 원본은 보존했습니다.'));
    return;
  }
  const byKind = new Map(LEGACY_CATALOG.map(kind => [kind, items.filter(item => item.source === 'earned' && item.kind === kind)]));
  (profile.garden ?? []).forEach((index, slot) => {
    if (index == null) return;
    if (slot >= 12 || !Number.isInteger(index) || index < 0 || index >= LEGACY_CATALOG.length) {
      recoverableItems.push({reason: 'INVALID_LEGACY_SLOT', item: {slot, value: clone(index)}});
      warnings.push(warning('INVALID_LEGACY_SLOT', '잘못된 기존 정원 칸을 복구 대기 목록에 보존했습니다.', {slot}));
      return;
    }
    const target = byKind.get(LEGACY_CATALOG[index]).find(item => !item.placed);
    if (!target) {
      recoverableItems.push({reason: 'LEGACY_OVERPLACED', item: {slot, value: index}});
      warnings.push(warning('LEGACY_OVERPLACED', '획득 수보다 많은 기존 배치는 복구 대기 목록에 보존했습니다.', {slot}));
      return;
    }
    Object.assign(target, legacySlotPosition(slot), {placed: true});
  });
}

/**
 * @param {object} profile One selected child profile (not the whole app state).
 * @returns {{schemaVersion:2,items:Array,warnings:Array,recoverableItems:Array}}
 * Throws GardenDataError for unsafe counts/future schemas. No clamping, writes,
 * reward issuance, localStorage access, profile selection or animation occurs.
 */
export function prepareGardenV2(profile) {
  if (!isRecord(profile)) throw new TypeError('A child profile object is required.');
  const warnings = [];
  const recoverableItems = Array.isArray(profile.gardenV2?.recoverableItems)
    ? clone(profile.gardenV2.recoverableItems) : [];
  const items = inventory(profile, warnings, recoverableItems);
  const saved = profile.gardenV2;
  if (isRecord(saved) && saved.schemaVersion !== undefined && saved.schemaVersion !== 2) {
    throw new GardenDataError('UNSUPPORTED_SCHEMA', '알 수 없는 정원 버전입니다. 덮어쓰지 말고 해당 버전에 맞는 어댑터를 사용하세요.');
  }
  if (isRecord(saved) && saved.schemaVersion === 2 && Array.isArray(saved.items)) {
    applyPositions(items, saved.items, warnings, recoverableItems);
  } else {
    if (saved != null) {
      recoverableItems.push({reason: 'INVALID_V2_LAYOUT', item: clone(saved)});
      warnings.push(warning('INVALID_V2_LAYOUT', '새 정원 형식이 손상되어 기존 배치를 사용합니다. 새 정원 원본은 복구 대기 목록에 보존했습니다.'));
    }
    migrateSlots(profile, items, warnings, recoverableItems);
  }
  return {schemaVersion: 2, items, warnings, recoverableItems: uniqueRecovery(recoverableItems)};
}

/**
 * Returns a new profile with a validated layout; all unrelated fields and the
 * old garden remain intact. Missing IDs retain their layout; explicit
 * placed:false returns a friend to the tray. Unknown IDs never mint rewards.
 */
export function withGardenLayout(profile, nextItems) {
  if (!Array.isArray(nextItems)) throw new TypeError('onChange must supply an items array.');
  const prepared = prepareGardenV2(profile);
  applyPositions(prepared.items, nextItems, prepared.warnings, prepared.recoverableItems, {keepOmitted: true});
  const saved = isRecord(profile.gardenV2) ? clone(profile.gardenV2) : {};
  return {...profile, gardenV2: {
    ...saved, schemaVersion: 2, items: prepared.items,
    recoverableItems: uniqueRecovery(prepared.recoverableItems),
    migrationWarnings: prepared.warnings,
  }};
}
