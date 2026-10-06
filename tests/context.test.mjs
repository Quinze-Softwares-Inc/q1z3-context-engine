import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceCategory,normalizeQuestion,chooseExactLesson} from '../index.js';

test('declared source categories never infer authority or execute getters',()=>{
  assert.equal(sourceCategory({kind:'ai_summary',mime:'text/plain'}),'ai-summary');
  assert.equal(sourceCategory({mime:'application/pdf'}),'document');
  assert.equal(sourceCategory({mime:'image/png'}),'image');
  assert.equal(sourceCategory({mime:'application/octet-stream'}),'unknown');
  const input={};Object.defineProperty(input,'kind',{get(){throw new Error('Untrusted getter executed.');}});
  assert.equal(sourceCategory(input),'unknown');
});

test('exact questions normalize Unicode, case and whitespace without semantic matching',()=>{
  assert.equal(normalizeQuestion('  CAFÉ\n tomorrow? '),normalizeQuestion('cafe\u0301 tomorrow?'));
  const decision={id:'synthetic-rule',audience:'alice',question:'What are you building?',mode:'allow'};
  assert.equal(chooseExactLesson([decision],{audience:'@ALICE',question:' what ARE you building? '}),decision);
  assert.equal(chooseExactLesson([decision],{audience:'alice',question:'What do you build?'}),null);
  assert.equal(chooseExactLesson([decision],{audience:'bruno',question:decision.question}),null);
});

test('a newer private decision blocks the older allow candidate',()=>{
  const newest={id:'new-private',audience:'alice',question:'Project status?',mode:'private'};
  const older={id:'old-allow',audience:'alice',question:'Project status?',mode:'allow'};
  assert.equal(chooseExactLesson([newest,older],{audience:'alice',question:'Project status?'}),newest);
  assert.equal(chooseExactLesson([newest,older],{audience:'invalid--handle',question:'Project status?'}),null);
});
