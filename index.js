// MIT licensed deterministic core. No imports, I/O, clock, model or actions.
// A category describes declared metadata. A lesson is only a candidate.
const kinds=Object.freeze({text:'text',document:'document',file:'document',image:'image',screenshot:'image',ai_summary:'ai-summary','ai-summary':'ai-summary',service:'service-snapshot',service_snapshot:'service-snapshot','service-snapshot':'service-snapshot'});
const documentMimes=new Set(['application/pdf','application/msword','application/rtf','text/rtf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.ms-powerpoint','application/vnd.oasis.opendocument.text','application/vnd.oasis.opendocument.spreadsheet','application/vnd.oasis.opendocument.presentation']);
const textMimes=new Set(['application/json','application/xml','application/javascript']);
function ownData(record,key){if(!record||typeof record!=='object'||Array.isArray(record))return undefined;try{const property=Object.getOwnPropertyDescriptor(record,key);return property&&Object.hasOwn(property,'value')?property.value:undefined;}catch{return undefined;}}
function declared(value,max){return typeof value==='string'&&value.length<=max?value.trim().toLowerCase():'';}

/** Classify declarations, never content, truth, people, topics or authority. */
export function sourceCategory(source) {
  const kind=declared(ownData(source,'kind'),100);
  if(Object.hasOwn(kinds,kind))return kinds[kind];
  const mime=declared(ownData(source,'mime'),255).split(';',1)[0].trim();
  if(!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(mime))return 'unknown';
  if(documentMimes.has(mime))return 'document';
  if(mime.startsWith('image/'))return 'image';
  if(mime.startsWith('text/')||textMimes.has(mime))return 'text';
  return 'unknown';
}

/** Same exact normalization as the runtime broker; no semantic equivalence. */
export function normalizeQuestion(value) {
  if(typeof value!=='string')throw new TypeError('A question string is required.');
  return value.normalize('NFC').trim().replace(/\s+/gu,' ').toLowerCase();
}
function audienceHandle(value) {
  if(typeof value!=='string'||value.length>64||/[^\x00-\x7f]/.test(value))return null;
  const handle=value.trim().replace(/^@/,'').toLowerCase();
  return handle.length>=3&&handle.length<=24&&/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(handle)?handle:null;
}

/**
 * Return the first exact candidate from authoritative newest-first rows.
 * The caller must scope records to one owner and order by updated_at DESC,
 * id DESC (or an equally authoritative total decision order). Do not prefilter
 * modes or expiry: a newer private/ask/expired decision must block older allow.
 * This function never validates a grant or returns an authorized response.
 */
export function chooseExactLesson(lessons,request) {
  if(!Array.isArray(lessons))return null;
  const audience=audienceHandle(ownData(request,'audience')),question=ownData(request,'question');
  if(!audience||typeof question!=='string')return null;
  const normalized=normalizeQuestion(question);if(!normalized)return null;
  for(const lesson of lessons){const candidateQuestion=ownData(lesson,'question');if(audienceHandle(ownData(lesson,'audience'))===audience&&typeof candidateQuestion==='string'&&normalizeQuestion(candidateQuestion)===normalized)return lesson;}
  return null;
}
