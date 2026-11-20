// Security-rule tests: each parent's data is theirs alone.
// Run: npm run test:rules   (starts the Firestore emulator; needs Java)
import { after, before, beforeEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

let env;
const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const data = (extra = {}) => ({ json: '{"v":1}', updated: Date.now(), ...extra });

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-tumbuh',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});
beforeEach(async () => env.clearFirestore());
after(async () => env?.cleanup());

test('owner can create, read, update and delete their own data', async () => {
  const ref = doc(db('alice'), 'users', 'alice');
  await assertSucceeds(setDoc(ref, data()));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(updateDoc(ref, { json: '{"v":2}', updated: Date.now() }));
  await assertSucceeds(deleteDoc(ref));
});

test('reading a document that does not exist yet is allowed for the owner', async () => {
  await assertSucceeds(getDoc(doc(db('alice'), 'users', 'alice')));
});

test('someone else cannot read or change it', async () => {
  await assertSucceeds(setDoc(doc(db('alice'), 'users', 'alice'), data()));
  await assertFails(getDoc(doc(db('bob'), 'users', 'alice')));
  await assertFails(setDoc(doc(db('bob'), 'users', 'alice'), data()));
  await assertFails(deleteDoc(doc(db('bob'), 'users', 'alice')));
});

test('signed-out visitors get nothing', async () => {
  await assertSucceeds(setDoc(doc(db('alice'), 'users', 'alice'), data()));
  await assertFails(getDoc(doc(db(null), 'users', 'alice')));
  await assertFails(setDoc(doc(db(null), 'users', 'x'), data()));
});

test('nobody can list everyone', async () => {
  await assertFails(getDocs(collection(db('alice'), 'users')));
});

test('only the expected fields and types are accepted', async () => {
  const ref = doc(db('alice'), 'users', 'alice');
  await assertFails(setDoc(ref, data({ admin: true })));
  await assertFails(setDoc(ref, { json: { v: 1 }, updated: Date.now() }));
  await assertFails(setDoc(ref, { json: '{}', updated: 'today' }));
  await assertFails(setDoc(ref, { json: 'x'.repeat(900001), updated: Date.now() }));
});

test('other collections are closed', async () => {
  await assertFails(setDoc(doc(db('alice'), 'notes', 'n1'), { a: 1 }));
  await assertFails(getDoc(doc(db('alice'), 'notes', 'n1')));
});
