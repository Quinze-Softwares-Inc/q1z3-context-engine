import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
test('every published source and repository addition retains its recorded bytes and scope',async()=>{
  const manifest=JSON.parse(await readFile(resolve(root,'PUBLICATION_MANIFEST.json'),'utf8'));
  assert.equal(manifest.schema,'q1z3.github-publication');assert.equal(manifest.version,1);
  assert.equal(new Set(manifest.files.map(file=>file.path)).size,manifest.files.length);
  for(const file of manifest.files){
    assert(typeof file.path==='string'&&!isAbsolute(file.path)&&/^[-a-zA-Z0-9_./]+$/.test(file.path));
    assert(file.path.split('/').every(part=>part&&part!=='.'&&part!=='..'));
    let path=root;for(const part of file.path.split('/')){path=resolve(path,part);assert(!(await lstat(path)).isSymbolicLink());}
    const stat=await lstat(path);assert(stat.isFile());const bytes=await readFile(path);
    assert.equal(bytes.length,file.bytes,file.path);assert.equal(sha(bytes),file.sha256,file.path);
    assert(['upstream-archive','separate-published-source','repository-addition'].includes(file.scope));
  }
  const upstream=JSON.parse(await readFile(resolve(root,'UPSTREAM_MANIFEST.json'),'utf8'));
  assert.equal(upstream.license,'MIT');assert.equal(upstream.archiveSha256,manifest.upstreamArchiveSha256);
});
