// 세 앱이 함께 쓰는 핵심 모듈: 로그인, 데이터 동기화, 상단 바, 잠금, 대화상자
import { firebaseConfig } from './config.js';

/* ---------- 앱 목록 ---------- */
const ICON = {
  diary: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6',
  meal: 'M3.5 11.5h17a8.5 8.5 0 0 1-17 0ZM9 8c0-1.5 1.5-1.5 1.5-3M13.5 8c0-1.5 1.5-1.5 1.5-3',
  budget: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h14V9H6.5A2.5 2.5 0 0 1 4 7.5ZM16 14h.01',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  lock: 'M6 11h12v10H6ZM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  home: 'M4 11 12 4l8 7M6 9.5V20h12V9.5',
  chev: 'm6 9 6 6 6-6'
};
export const APPS = [
  { key: 'diary', path: 'diary/', name: { ko: '빛줍기', zh: '拾光集' }, desc: { ko: '일기장', zh: '日记' }, color: '#34437F', on: '#FFFFFF', ready: true },
  { key: 'budget', path: 'budget/', name: { ko: '살림결', zh: '烟火簿' }, desc: { ko: '가계부', zh: '记账' }, color: '#C2416F', on: '#FFF7F9', ready: true },
  { key: 'meal', path: 'meal/', name: { ko: '끼니결', zh: '知味录' }, desc: { ko: '칼로리와 탄단지', zh: '热量与营养' }, color: '#2E6A58', on: '#FFFFFF', ready: false }
];
// 이름에 한자가 있으면 중국어 글꼴 규칙(문장부호 모양)을 적용
export const nameLang = s => /[\u3400-\u9fff]/.test(s) && !/[\uac00-\ud7af]/.test(s) ? 'zh-CN' : 'ko';
export const svg = (d, w = 20) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

/* ---------- 공통 문구 ---------- */
const STR = {
  ko: {
    syncOk: '동기화됨', syncBusy: '저장 중…', syncOffline: '오프라인, 기기에 저장됨', syncErr: '저장 실패', syncLoading: '불러오는 중…', syncLocal: '테스트 모드',
    switchApp: '다른 앱으로 이동', home: '시작 화면', soon: '곧 옮겨 와요', lockNow: '지금 잠그기', settings: '설정',
    pinEnter: 'PIN을 입력하세요', pinWrong: 'PIN이 맞지 않아요. ({n}/5)', pinWait: '여러 번 틀렸어요. {s}초 뒤에 다시 입력하세요.', pinDel: '지우기',
    pinHelp: 'PIN을 잊었다면 Firebase 콘솔의 Firestore에서 settings 안 common 문서의 lock 항목을 지우면 풀려요.',
    theme: '화면 테마', themeSystem: '기기 설정', themeLight: '밝게', themeDark: '어둡게',
    lockTitle: '잠금', lockOffDesc: '앱을 열 때 PIN을 물어봐요. 세 앱과 모든 기기에 함께 적용돼요.', lockSet: 'PIN 설정',
    lockAuto: '자동 잠금: 화면을 떠나 있거나 손대지 않은 지', lockImm: '바로', min: '{n}분',
    pinChange: 'PIN 바꾸기', lockOff: '잠금 끄기', lockNote: '잠금은 화면을 가리는 기능이고, 기록 자체를 암호화하지는 않아요.',
    pinCur: '현재 PIN', pinNew: '새 PIN (숫자 4~6자리)', pinNew2: '새 PIN 한 번 더', pinBadCur: '현재 PIN이 맞지 않아요.', pinBadNew: '새 PIN은 숫자 4~6자리로 정해 주세요.', pinMismatch: '두 PIN이 서로 달라요.',
    pinSetDesc: '숫자 4~6자리로 정해 주세요.', lockOffDesc2: '현재 PIN을 입력하면 모든 기기에서 잠금이 꺼져요.',
    pinSetDone: 'PIN을 설정했어요.', pinChanged: 'PIN을 바꿨어요.', lockOffDone: '잠금을 껐어요.',
    account: '계정', signedInAs: '{e}로 로그인됨', signOut: '로그아웃', cancel: '취소', ok: '확인', close: '닫기',
    errPerm: '저장 권한이 없어요. Firestore 보안 규칙의 UID를 확인해 주세요.', errSave: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
    dataTitle: '데이터', wipeDesc: '이 앱의 기록만 지워요. 다른 앱과 테마·잠금 설정은 그대로예요. 누르면 백업 파일을 먼저 내려받아요.',
    wipeBackingUp: '백업 파일 만드는 중…', wipeBackupFail: '백업 파일을 만들지 못해서 지우지 않았어요. 인터넷 연결을 확인하고 다시 시도해 주세요.',
    wipeConfirmBody: '방금 백업 파일을 내려받았어요. 지우면 모든 기기에서 사라지고 되돌릴 수 없어요.', wipeWord: '삭제', wipeTypeHint: '계속하려면 아래 칸에 “{w}”를 입력하세요.',
    wipeGo: '모두 지우기', wiping: '지우는 중…', wipeDone: '모두 지웠어요.', wipeEmpty: '지울 기록이 없어요.', needOnline: '인터넷에 연결된 상태에서 다시 시도해 주세요.'
  },
  zh: {
    syncOk: '已同步', syncBusy: '保存中…', syncOffline: '离线，已存到本机', syncErr: '保存失败', syncLoading: '加载中…', syncLocal: '测试模式',
    switchApp: '切换应用', home: '首页', soon: '即将上线', lockNow: '立即锁定', settings: '设置',
    pinEnter: '请输入 PIN', pinWrong: 'PIN 不正确（{n}/5）', pinWait: '错误次数过多，请 {s} 秒后再试。', pinDel: '删除',
    pinHelp: '忘记 PIN 时，可在 Firebase 控制台的 Firestore 中删除 settings 下 common 文档里的 lock 字段。',
    theme: '外观', themeSystem: '跟随系统', themeLight: '浅色', themeDark: '深色',
    lockTitle: '锁定', lockOffDesc: '打开应用时需要输入 PIN，三个应用和所有设备同时生效。', lockSet: '设置 PIN',
    lockAuto: '自动锁定：离开或未操作', lockImm: '立即', min: '{n} 分钟',
    pinChange: '修改 PIN', lockOff: '关闭锁定', lockNote: '锁定只会遮住画面，不会加密记录本身。',
    pinCur: '当前 PIN', pinNew: '新 PIN（4～6 位数字）', pinNew2: '再次输入新 PIN', pinBadCur: '当前 PIN 不正确。', pinBadNew: '新 PIN 请设为 4～6 位数字。', pinMismatch: '两次输入的 PIN 不一致。',
    pinSetDesc: '请设为 4～6 位数字。', lockOffDesc2: '输入当前 PIN 后，所有设备都会关闭锁定。',
    pinSetDone: '已设置 PIN。', pinChanged: '已修改 PIN。', lockOffDone: '已关闭锁定。',
    account: '账户', signedInAs: '已登录：{e}', signOut: '退出登录', cancel: '取消', ok: '确定', close: '关闭',
    errPerm: '没有保存权限，请检查 Firestore 安全规则中的 UID。', errSave: '保存失败，请稍后再试。',
    dataTitle: '数据', wipeDesc: '只删除这个应用的记录，其他应用以及外观、锁定设置不受影响。点击后会先下载备份文件。',
    wipeBackingUp: '正在生成备份文件…', wipeBackupFail: '未能生成备份文件，所以没有删除。请检查网络连接后再试。',
    wipeConfirmBody: '备份文件已下载。删除后所有设备上的记录都会消失，且无法恢复。', wipeWord: '删除', wipeTypeHint: '如要继续，请在下方输入“{w}”。',
    wipeGo: '全部删除', wiping: '正在删除…', wipeDone: '已全部删除。', wipeEmpty: '没有可删除的记录。', needOnline: '请在联网状态下再试。'
  }
};
const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const SS = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch {} }
};
export { LS };

/* ---------- 상태 ---------- */
const core = {
  lang: 'ko', app: null, root: './', user: null, mode: 'firebase',
  fb: null, db: null, auth: null,
  inflight: 0, pendingSnaps: new Map(), loaded: false, lastErr: null,
  lock: null, commonUnsub: null, listeners: new Set(), settingsHandlers: []
};
const T = k => STR[core.lang]?.[k] ?? STR.ko[k] ?? k;
export const coreT = T;

/* ---------- 데이터 계층: Firebase 또는 테스트용 메모리 ---------- */
function makeMock() {
  const KEY = 'core.mock.v1';
  const data = LS.get(KEY, {});
  const subs = new Set();
  const save = () => LS.set(KEY, data);
  const emit = path => { for (const s of subs) if (s.path === path) setTimeout(() => s.cb(), 0); };
  const user = { uid: 'mock-user', email: 'test@example.com' };
  return {
    user,
    watchCol(path, cb) {
      const s = { path, cb: () => cb(Object.entries(data[path] || {}).map(([id, v]) => ({ id, data: v })), { fromCache: false, pending: false }) };
      subs.add(s); s.cb(); return () => subs.delete(s);
    },
    watchDoc(path, cb) {
      const [col, id] = splitDoc(path);
      const s = { path: col, cb: () => cb((data[col] || {})[id] || null, { fromCache: false }) };
      subs.add(s); s.cb(); return () => subs.delete(s);
    },
    async set(path, val, merge) {
      const [col, id] = splitDoc(path);
      data[col] ||= {};
      data[col][id] = merge ? { ...(data[col][id] || {}), ...val } : val;
      for (const k of Object.keys(data[col][id])) if (data[col][id][k] === DELETE) delete data[col][id][k];
      save(); emit(col);
    },
    async get(path) { const [col, id] = splitDoc(path); return (data[col] || {})[id] || null; },
    async readAll(path) { return Object.entries(data[path] || {}).map(([id, v]) => ({ id, data: v })); },
    watchRange(path, field, from, to, cb) {
      const s = { path, cb: () => cb(Object.entries(data[path] || {}).filter(([, v]) => v[field] >= from && v[field] <= to).map(([id, v]) => ({ id, data: v })), { fromCache: false, pending: false }) };
      subs.add(s); s.cb(); return () => subs.delete(s);
    },
    async readRange(path, field, from, to) { return Object.entries(data[path] || {}).filter(([, v]) => v[field] >= from && v[field] <= to).map(([id, v]) => ({ id, data: v })); },
    async del(path) { const [col, id] = splitDoc(path); if (data[col]) delete data[col][id]; save(); emit(col); },
    async batch(ops) { for (const o of ops) o.del ? await this.del(o.path) : await this.set(o.path, o.val, o.merge); }
  };
}
const DELETE = { __delete: true };
function splitDoc(path) { const i = path.lastIndexOf('/'); return [path.slice(0, i), path.slice(i + 1)]; }

async function makeFirebase() {
  const F = await import('./firebase.js');
  const app = F.initializeApp(firebaseConfig);
  const auth = F.initializeAuth(app, { persistence: [F.indexedDBLocalPersistence, F.browserLocalPersistence] });
  let db;
  try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch { db = F.initializeFirestore(app, {}); }
  const toRef = path => F.doc(db, path);
  return {
    F, auth, db,
    watchCol(path, cb, onErr) {
      return F.onSnapshot(F.collection(db, path), { includeMetadataChanges: true },
        snap => cb(snap.docs.map(d => ({ id: d.id, data: d.data() })), { fromCache: snap.metadata.fromCache, pending: snap.metadata.hasPendingWrites }),
        e => onErr && onErr(e));
    },
    watchDoc(path, cb, onErr) {
      return F.onSnapshot(toRef(path), { includeMetadataChanges: true },
        snap => cb(snap.exists() ? snap.data() : null, { fromCache: snap.metadata.fromCache, pending: snap.metadata.hasPendingWrites }),
        e => onErr && onErr(e));
    },
    set(path, val, merge) { return F.setDoc(toRef(path), val, merge ? { merge: true } : undefined); },
    del(path) { return F.deleteDoc(toRef(path)); },
    async get(path) { const snap = await F.getDoc(toRef(path)); return snap.exists() ? snap.data() : null; },
    // 한 필드의 값이 from~to 사이인 문서만 지켜봄(기간별 읽기)
    watchRange(path, field, from, to, cb, onErr) {
      const q = F.query(F.collection(db, path), F.where(field, '>=', from), F.where(field, '<=', to));
      return F.onSnapshot(q, { includeMetadataChanges: true },
        snap => cb(snap.docs.map(d => ({ id: d.id, data: d.data() })), { fromCache: snap.metadata.fromCache, pending: snap.metadata.hasPendingWrites }),
        e => onErr && onErr(e));
    },
    readRange(path, field, from, to, ms) { return this.readAll(path, ms, F.query(F.collection(db, path), F.where(field, '>=', from), F.where(field, '<=', to))); },
    // 컬렉션 전체(또는 q 조건)를 서버에서 한 번 읽음(백업·전체 삭제용). 오프라인이면 실패로 알림
    readAll(path, ms = 20000, q) {
      return new Promise((res, rej) => {
        let done = false, unsub = null;
        const fin = (fn, v) => { if (done) return; done = true; clearTimeout(timer); if (unsub) unsub(); fn(v); };
        const timer = setTimeout(() => fin(rej, new Error('offline')), ms);
        unsub = F.onSnapshot(q || F.collection(db, path), { includeMetadataChanges: true },
          snap => { if (!snap.metadata.fromCache) fin(res, snap.docs.map(d => ({ id: d.id, data: d.data() }))); },
          e => fin(rej, e));
        if (done) unsub();
      });
    },
    // 한 번에 보내는 양 제한(문서 400개, 약 8MB)에 맞춰 나눠서 저장
    async batch(ops) {
      let b = null, n = 0, bytes = 0;
      const flush = async () => { if (b && n) await b.commit(); b = F.writeBatch(db); n = 0; bytes = 0; };
      await flush();
      for (const o of ops) {
        const size = o.del ? 100 : JSON.stringify(o.val).length + 200;
        if (n && (n >= 400 || bytes + size > 8e6)) await flush();
        o.del ? b.delete(toRef(o.path)) : b.set(toRef(o.path), o.val, o.merge ? { merge: true } : undefined);
        n++; bytes += size;
      }
      await flush();
    }
  };
}

/* ---------- 쓰기 추적 → 동기화 상태 ---------- */
function track(p) {
  core.inflight++; updateSync();
  return Promise.resolve(p).then(r => { core.lastErr = null; return r; }, e => {
    core.lastErr = e;
    toast(e && e.code === 'permission-denied' ? T('errPerm') : T('errSave'), { kind: 'err', ms: 7000 });
    console.error(e);
    throw e;
  }).finally(() => { core.inflight--; updateSync(); });
}
function syncState() {
  if (core.mode === 'mock') return { k: 'ok', t: T('syncLocal') };
  if (core.lastErr) return { k: 'err', t: T('syncErr') };
  const pending = core.inflight > 0 || [...core.pendingSnaps.values()].some(Boolean);
  if (!navigator.onLine) return { k: 'wait', t: T('syncOffline') };
  if (pending) return { k: 'busy', t: T('syncBusy') };
  if (!core.loaded) return { k: 'wait', t: T('syncLoading') };
  return { k: 'ok', t: T('syncOk') };
}
function updateSync() {
  const el = document.getElementById('core-sync'); if (!el) return;
  const s = syncState(); el.dataset.k = s.k; el.querySelector('.txt').textContent = s.t; el.title = s.t;
}
addEventListener('online', updateSync); addEventListener('offline', updateSync);

/* ---------- 공개 데이터 API (경로는 users/{uid}/ 아래) ---------- */
const base = () => `users/${core.user.uid}`;
export function watchCollection(name, cb) {
  const key = 'col:' + name;
  const unsub = core.fb.watchCol(`${base()}/${name}`, (docs, meta) => {
    core.pendingSnaps.set(key, meta.pending);
    if (!meta.fromCache) core.loaded = true;
    updateSync(); cb(docs, meta);
  }, e => { core.lastErr = e; updateSync(); console.error(e); });
  return () => { core.pendingSnaps.delete(key); unsub(); };
}
// 기간별 읽기: field 값이 from~to 사이인 문서만(예: 날짜 'YYYY-MM-01'~'YYYY-MM-31')
export function watchRange(name, field, from, to, cb) {
  const key = 'rng:' + name;
  const unsub = core.fb.watchRange(`${base()}/${name}`, field, from, to, (docs, meta) => {
    core.pendingSnaps.set(key, meta.pending);
    if (!meta.fromCache) core.loaded = true;
    updateSync(); cb(docs, meta);
  }, e => { core.lastErr = e; updateSync(); console.error(e); });
  return () => { core.pendingSnaps.delete(key); unsub(); };
}
export function watchSettings(name, cb) {
  return core.fb.watchDoc(`${base()}/settings/${name}`, (d, meta) => { core.pendingSnaps.set('set:' + name, meta.pending); updateSync(); cb(d || {}, meta); },
    e => { console.error(e); });
}
export const putDoc = (name, id, val) => track(core.fb.set(`${base()}/${name}/${id}`, val));
export const removeDoc = (name, id) => track(core.fb.del(`${base()}/${name}/${id}`));
export const putMany = (name, list) => track(core.fb.batch(list.map(([id, val]) => ({ path: `${base()}/${name}/${id}`, val }))));
export const removeMany = (name, ids) => track(core.fb.batch(ids.map(id => ({ path: `${base()}/${name}/${id}`, del: true }))));
export const saveSettings = (name, partial) => track(core.fb.set(`${base()}/settings/${name}`, partial, true));
// 문서 하나 읽기(없으면 null). 오프라인이면 기기에 저장된 것을 돌려줌
export const getDoc = (name, id) => core.fb.get(`${base()}/${name}/${id}`);
// 컬렉션 전체를 서버에서 한 번 읽기: 백업·전체 삭제·보관본 때만 사용
export const readAll = name => core.fb.readAll(`${base()}/${name}`);
// 기간 안의 문서를 서버에서 한 번 읽기(가져오기 중복 확인용)
export const readRange = (name, field, from, to) => core.fb.readRange(`${base()}/${name}`, field, from, to);
// 여러 컬렉션에 걸친 쓰기·지우기를 한꺼번에: [{ name, id, val } 또는 { name, id, del: true }]
export const writeBatch = ops => track(core.fb.batch(ops.map(o => ({ path: `${base()}/${o.name}/${o.id}`, val: o.val, del: !!o.del }))));
export const deleteField = () => core.mode === 'mock' ? DELETE : core.fb.F.deleteField();

/* ---------- 초기화와 로그인 ---------- */
export async function init({ app, lang = 'ko', root = '../', requireAuth = true } = {}) {
  core.app = app; core.root = root; setLang(lang);
  if (app) document.documentElement.dataset.app = app;
  applyTheme(LS.get('core.theme', 'system'));
  mountLockOverlay();
  const cached = LS.get('core.lock', null);
  if (cached) { core.lock = cached; if (needsLockOnLoad()) lockNow(); }
  registerSW();
  const mock = new URLSearchParams(location.search).has('mock') || !firebaseConfig.apiKey;
  core.mode = mock ? 'mock' : 'firebase';
  core.fb = mock ? makeMock() : await makeFirebase();
  core.user = mock ? core.fb.user : await new Promise(res => { const u = core.fb.F.onAuthStateChanged(core.fb.auth, user => { u(); res(user); }); });
  if (!core.user) {
    if (requireAuth) { location.replace(root + 'index.html?next=' + encodeURIComponent(app || '')); return new Promise(() => {}); }
    return null;
  }
  startCommon();
  return core.user;
}
export async function signIn(email, password) {
  const r = await core.fb.F.signInWithEmailAndPassword(core.fb.auth, email, password);
  core.user = r.user; startCommon(); return r.user;
}
export async function resetPassword(email) { return core.fb.F.sendPasswordResetEmail(core.fb.auth, email); }
export async function signOutAll() {
  if (core.mode !== 'mock') await core.fb.F.signOut(core.fb.auth);
  LS.del('core.lock'); SS.set('core.unlocked', '');
  location.replace(core.root + 'index.html');
}
export const currentUser = () => core.user;
export const isMock = () => core.mode === 'mock';
export function setLang(l) {
  core.lang = l === 'zh' ? 'zh' : 'ko';
  document.documentElement.lang = core.lang === 'zh' ? 'zh-CN' : 'ko';
  renderAppbar(); updateSync(); renderLockText();
}

function startCommon() {
  if (core.commonUnsub) return;
  core.commonUnsub = watchSettings('common', (d, meta) => {
    if (d.theme) { LS.set('core.theme', d.theme); applyTheme(d.theme); }
    if (d.lock || !meta.fromCache) applyLockCfg(d.lock || null);
    core.settingsHandlers.forEach(h => h(d));
    if (document.getElementById('core-common')) renderCommon();
  });
}
export function onCommonSettings(h) { core.settingsHandlers.push(h); }

/* ---------- 테마 ---------- */
function applyTheme(t) {
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) requestAnimationFrame(() => m.setAttribute('content', getComputedStyle(document.body).backgroundColor));
}

/* ---------- 상단 바와 앱 전환 ---------- */
let barOpts = null;
export function mountAppbar(opts = {}) { barOpts = opts; renderAppbar(); }
function renderAppbar() {
  const host = document.getElementById('appbar'); if (!host || !barOpts) return;
  const a = APPS.find(x => x.key === core.app);
  const name = a ? a.name[core.lang] : (barOpts.title || '');
  host.className = 'appbar';
  host.innerHTML = `<div class="appbar-in">
    <button class="app-switch" id="core-switch" aria-haspopup="true" aria-expanded="false" aria-label="${esc(T('switchApp'))}">
      <span class="app-glyph">${svg(ICON[core.app] || ICON.home, 18)}</span>
      <span class="app-name">${esc(name)}</span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON.chev}"/></svg>
    </button>
    <span class="grow"></span>
    ${barOpts.extra || ''}
    <span class="sync" id="core-sync" role="status" data-k="wait"><span class="dot"></span><span class="txt"></span></span>
    ${barOpts.onSettings ? `<button class="icon-btn" id="core-settings" aria-label="${esc(T('settings'))}">${svg(ICON.gear)}</button>` : ''}
  </div>`;
  host.querySelector('#core-switch').onclick = toggleSwitcher;
  const sb = host.querySelector('#core-settings'); if (sb) sb.onclick = () => barOpts.onSettings();
  host.querySelector('#core-sync').onclick = () => barOpts.onSettings && barOpts.onSettings('sync');
  updateSync();
}
function toggleSwitcher() {
  const open = document.getElementById('core-switcher');
  const btn = document.getElementById('core-switch');
  if (open){ open.remove(); document.getElementById('core-scrim')?.remove(); btn.setAttribute('aria-expanded','false'); return; }
  btn.setAttribute('aria-expanded', 'true');
  const scrim = document.createElement('div'); scrim.className = 'switch-scrim'; scrim.id = 'core-scrim';
  const nav = document.createElement('nav'); nav.className = 'switcher'; nav.id = 'core-switcher'; nav.setAttribute('aria-label', T('switchApp'));
  nav.innerHTML = APPS.map(a => `<a href="${core.root}${a.path}" class="${a.ready ? '' : 'sw-off'}" ${a.key === core.app ? 'aria-current="page"' : ''} ${a.ready ? '' : 'aria-disabled="true" tabindex="-1"'}>
      <span class="sw-glyph" style="background:${a.color};color:${a.on}">${svg(ICON[a.key], 22)}</span>
      <span class="sw-text"><span class="sw-name" style="font-family:var(--title)" lang="${nameLang(a.name[core.lang])}">${esc(a.name[core.lang])}</span><span class="sw-desc">${esc(a.ready ? a.desc[core.lang] : T('soon'))}</span></span>
    </a>`).join('') + `<span class="sw-sep"></span>
    <a href="${core.root}index.html">${svg(ICON.home)}<span class="sw-text">${esc(T('home'))}</span></a>
    ${core.lock ? `<button type="button" id="core-lock-now">${svg(ICON.lock)}<span class="sw-text">${esc(T('lockNow'))}</span></button>` : ''}`;
  const close = () => { nav.remove(); scrim.remove(); btn.setAttribute('aria-expanded', 'false'); };
  scrim.onclick = close;
  nav.addEventListener('click', e => {
    const a = e.target.closest('a'); if (a) SS.set('core.nav', String(Date.now()));
    if (e.target.closest('#core-lock-now')) { close(); lockNow(); }
  });
  nav.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); btn.focus(); } });
  document.body.append(scrim, nav);
  nav.querySelector('a:not(.sw-off)')?.focus();
}

/* ---------- 알림·확인 대화상자 ---------- */
export function toast(msg, { action, onAction, ms = 3500, kind } = {}) {
  let box = document.querySelector('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'toast' + (kind === 'err' ? ' err' : ''); el.setAttribute('role', kind === 'err' ? 'alert' : 'status');
  const span = document.createElement('span'); span.textContent = msg; el.appendChild(span);
  const dismiss = () => el.remove();
  if (action) { const b = document.createElement('button'); b.textContent = action; b.onclick = () => { dismiss(); onAction && onAction(); }; el.appendChild(b); }
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  if (ms) setTimeout(dismiss, ms);
  return { dismiss };
}
export function ask({ title, body, actions }) {
  return new Promise(res => {
    const d = document.createElement('dialog');
    d.innerHTML = `<div class="dlg"><h2></h2><p></p><div class="dlg-actions"></div></div>`;
    d.querySelector('h2').textContent = title; d.querySelector('p').textContent = body || '';
    const box = d.querySelector('.dlg-actions');
    for (const a of actions) {
      const b = document.createElement('button'); b.className = 'btn ' + (a.kind || ''); b.textContent = a.label;
      b.onclick = () => { res(a.value); d.close(); }; box.appendChild(b);
    }
    d.addEventListener('close', () => { res(null); d.remove(); });
    document.body.appendChild(d); d.showModal(); box.lastElementChild?.focus();
  });
}

/* ---------- 잠금 ---------- */
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function hashPin(pin, salt, iter) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations: iter }, key, 256));
}
async function makeLock(pin, autoLock) {
  const salt = b64(crypto.getRandomValues(new Uint8Array(16))), iter = 150000;
  return { salt, iter, hash: await hashPin(pin, salt, iter), len: pin.length, autoLock, updatedAt: Date.now() };
}
function validLock(v) {
  return v && typeof v.salt === 'string' && typeof v.hash === 'string' && Number(v.iter) >= 1000 && v.len >= 4 && v.len <= 6
    ? { salt: v.salt, hash: v.hash, iter: Number(v.iter), len: Number(v.len), autoLock: [0, 1, 5, 15].includes(v.autoLock) ? v.autoLock : 5, updatedAt: Number(v.updatedAt) || 0 } : null;
}
let pinBuf = '', fails = 0, waitUntil = 0, pinBusy = false, waitTimer = null, hiddenAt = 0;
const isLocked = () => document.documentElement.classList.contains('locked');
function needsLockOnLoad() {
  if (!core.lock) return false;
  if (SS.get('core.unlocked') !== '1') return true;
  const last = Number(SS.get('core.lastActive')) || 0;
  return core.lock.autoLock > 0 && Date.now() - last >= core.lock.autoLock * 60000;
}
function mountLockOverlay() {
  if (document.getElementById('core-lock')) return;
  const el = document.createElement('div'); el.id = 'core-lock'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<h1 id="core-lock-title"></h1><p class="lock-msg" id="core-lock-msg" aria-live="assertive"></p>
    <div class="pin-dots" id="core-pin-dots" aria-hidden="true"></div>
    <div class="keypad" id="core-keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}
    <span class="blank"></span><button data-k="0">0</button><button data-k="del" class="del" id="core-pin-del"></button></div>
    <p class="lock-help" id="core-lock-help"></p>`;
  document.body.appendChild(el);
  el.querySelector('#core-keypad').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) pressKey(b.dataset.k); });
  renderLockText();
}
function renderLockText() {
  const el = document.getElementById('core-lock'); if (!el) return;
  const a = APPS.find(x => x.key === core.app);
  el.querySelector('#core-lock-title').textContent = a ? a.name[core.lang] : (core.lang === 'zh' ? '我的记录' : '나의 기록');
  el.querySelector('#core-pin-del').textContent = T('pinDel');
  el.querySelector('#core-lock-help').textContent = T('pinHelp');
  if (Date.now() >= waitUntil) el.querySelector('#core-lock-msg').textContent = T('pinEnter');
}
function renderPin() {
  const n = core.lock ? core.lock.len : 4;
  const dots = document.getElementById('core-pin-dots'); if (!dots) return;
  dots.innerHTML = Array.from({ length: n }, (_, i) => `<span class="${i < pinBuf.length ? 'on' : ''}"></span>`).join('');
  const waiting = Date.now() < waitUntil;
  document.querySelectorAll('#core-keypad button').forEach(b => b.disabled = waiting);
}
export function lockNow() {
  if (!core.lock) return;
  SS.set('core.unlocked', ''); pinBuf = '';
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  document.getElementById('core-switcher')?.remove(); document.getElementById('core-scrim')?.remove();
  document.documentElement.classList.add('locked');
  document.getElementById('core-lock').hidden = false;
  renderLockText(); renderPin();
}
function unlockUI() {
  SS.set('core.unlocked', '1'); SS.set('core.lastActive', String(Date.now()));
  document.documentElement.classList.remove('locked');
  document.getElementById('core-lock').hidden = true;
}
function applyLockCfg(cfg) {
  cfg = validLock(cfg); core.lock = cfg;
  if (cfg) LS.set('core.lock', cfg); else LS.del('core.lock');
  if (cfg && !isLocked() && SS.get('core.unlocked') !== '1') lockNow();
  if (!cfg && isLocked()) unlockUI();
}
async function pressKey(k) {
  if (!isLocked() || pinBusy || Date.now() < waitUntil || !core.lock) return;
  if (k === 'del') { pinBuf = pinBuf.slice(0, -1); renderPin(); return; }
  if (!/^\d$/.test(k) || pinBuf.length >= core.lock.len) return;
  pinBuf += k; renderPin();
  if (pinBuf.length < core.lock.len) return;
  pinBusy = true;
  const ok = (await hashPin(pinBuf, core.lock.salt, core.lock.iter)) === core.lock.hash;
  pinBusy = false; pinBuf = '';
  if (ok) { fails = 0; unlockUI(); return; }
  fails++; renderPin();
  const dots = document.getElementById('core-pin-dots'); dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
  const msg = document.getElementById('core-lock-msg');
  if (fails >= 5) {
    waitUntil = Date.now() + 30000; clearInterval(waitTimer);
    const tick = () => {
      const left = Math.ceil((waitUntil - Date.now()) / 1000);
      if (left <= 0) { clearInterval(waitTimer); fails = 0; msg.textContent = T('pinEnter'); renderPin(); return; }
      msg.textContent = fmt(T('pinWait'), { s: left });
    };
    tick(); renderPin(); waitTimer = setInterval(tick, 1000);
  } else msg.textContent = fmt(T('pinWrong'), { n: fails });
}
document.addEventListener('keydown', e => {
  if (!isLocked()) return;
  if (/^\d$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); pressKey(e.key); }
  else if (e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); pressKey('del'); }
}, true);
let lastPersist = 0;
['pointerdown', 'keydown', 'input'].forEach(ev => document.addEventListener(ev, () => {
  if (isLocked()) return;
  const now = Date.now(); if (now - lastPersist > 5000) { lastPersist = now; SS.set('core.lastActive', String(now)); }
}, true));
document.addEventListener('visibilitychange', () => {
  if (!core.lock) return;
  if (document.visibilityState === 'hidden') {
    hiddenAt = Date.now(); SS.set('core.lastActive', String(hiddenAt));
    const navigating = Date.now() - (Number(SS.get('core.nav')) || 0) < 3000;
    if (core.lock.autoLock === 0 && !navigating && !isLocked()) lockNow();
  } else if (!isLocked() && hiddenAt && Date.now() - hiddenAt >= core.lock.autoLock * 60000) lockNow();
});
setInterval(() => {
  if (!core.lock || isLocked() || core.lock.autoLock === 0) return;
  const last = Math.max(Number(SS.get('core.lastActive')) || 0, lastPersist);
  if (last && Date.now() - last >= core.lock.autoLock * 60000) lockNow();
}, 15000);

function pinDialog({ title, desc, cur, fresh }) {
  return new Promise(res => {
    const d = document.createElement('dialog');
    const field = (id, label) => `<label class="pin-field"><span>${esc(label)}</span><input id="${id}" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off"></label>`;
    d.innerHTML = `<div class="dlg"><h2>${esc(title)}</h2>${desc ? `<p>${esc(desc)}</p>` : ''}
      ${cur ? field('pinCur', T('pinCur')) : ''}${fresh ? field('pinNew', T('pinNew')) + field('pinNew2', T('pinNew2')) : ''}
      <p class="pin-err" role="alert"></p>
      <div class="dlg-actions"><button class="btn" data-p="cancel">${esc(T('cancel'))}</button><button class="btn primary" data-p="ok">${esc(T('ok'))}</button></div></div>`;
    let done = false;
    const finish = v => { if (done) return; done = true; res(v); if (d.open) d.close(); d.remove(); };
    const err = m => { d.querySelector('.pin-err').textContent = m; };
    const submit = async () => {
      const q = id => d.querySelector('#' + id);
      if (cur && (!core.lock || (await hashPin(q('pinCur').value, core.lock.salt, core.lock.iter)) !== core.lock.hash)) { err(T('pinBadCur')); q('pinCur').select(); return; }
      if (fresh) {
        const a = q('pinNew').value, b = q('pinNew2').value;
        if (!/^\d{4,6}$/.test(a)) { err(T('pinBadNew')); q('pinNew').focus(); return; }
        if (a !== b) { err(T('pinMismatch')); q('pinNew2').select(); return; }
        finish({ pin: a }); return;
      }
      finish({ pin: '' });
    };
    d.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) b.dataset.p === 'ok' ? submit() : finish(null); });
    d.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    d.addEventListener('close', () => finish(null));
    document.body.appendChild(d); d.showModal(); d.querySelector('input').focus();
  });
}
async function saveLock(cfg) {
  SS.set('core.unlocked', '1');
  applyLockCfg(cfg);
  await saveSettings('common', { lock: cfg ? cfg : deleteField() });
}

/* ---------- 공통 설정 구역 (테마, 잠금, 계정) ---------- */
export function mountCommonSettings(container) {
  container.id = 'core-common'; renderCommon();
  container.addEventListener('click', async e => {
    const th = e.target.closest('[data-theme-set]');
    if (th) { const v = th.dataset.themeSet; LS.set('core.theme', v); applyTheme(v); renderCommon(); saveSettings('common', { theme: v }).catch(() => {}); return; }
    const al = e.target.closest('[data-autolock]');
    if (al && core.lock) { await saveLock({ ...core.lock, autoLock: Number(al.dataset.autolock), updatedAt: Date.now() }); renderCommon(); return; }
    const b = e.target.closest('[data-c]'); if (!b) return;
    const a = b.dataset.c;
    const parentDlg = container.closest('dialog');
    if (a === 'signout') { await signOutAll(); return; }
    if (a === 'lock-now') { parentDlg?.close(); lockNow(); return; }
    parentDlg?.close();
    const r = await pinDialog(a === 'pin-set' ? { title: T('lockSet'), desc: T('pinSetDesc'), fresh: true }
      : a === 'pin-change' ? { title: T('pinChange'), cur: true, fresh: true }
      : { title: T('lockOff'), desc: T('lockOffDesc2'), cur: true });
    if (!r) return;
    if (a === 'pin-off') { await saveLock(null); toast(T('lockOffDone')); }
    else { await saveLock(await makeLock(r.pin, core.lock ? core.lock.autoLock : 5)); toast(a === 'pin-set' ? T('pinSetDone') : T('pinChanged')); }
  });
}
function renderCommon() {
  const c = document.getElementById('core-common'); if (!c) return;
  const theme = LS.get('core.theme', 'system');
  c.innerHTML = `
    <div class="set-sec"><h3>${esc(T('theme'))}</h3>
      <div class="seg" role="group" aria-label="${esc(T('theme'))}">
        ${[['system', 'themeSystem'], ['light', 'themeLight'], ['dark', 'themeDark']].map(([v, k]) => `<button data-theme-set="${v}" aria-pressed="${theme === v}">${esc(T(k))}</button>`).join('')}
      </div></div>
    <div class="set-sec"><h3>${esc(T('lockTitle'))}</h3>
      ${core.lock ? `<p>${esc(T('lockAuto'))}</p>
        <div class="seg" role="group" aria-label="${esc(T('lockAuto'))}" style="margin-bottom:10px">
          ${[0, 1, 5, 15].map(v => `<button data-autolock="${v}" aria-pressed="${core.lock.autoLock === v}">${esc(v ? fmt(T('min'), { n: v }) : T('lockImm'))}</button>`).join('')}
        </div>
        <div class="set-row"><button class="btn" data-c="lock-now">${esc(T('lockNow'))}</button><button class="btn" data-c="pin-change">${esc(T('pinChange'))}</button><button class="btn danger" data-c="pin-off">${esc(T('lockOff'))}</button></div>`
      : `<p>${esc(T('lockOffDesc'))}</p><div class="set-row"><button class="btn" data-c="pin-set">${esc(T('lockSet'))}</button></div>`}
      <p style="font-size:13px;margin-top:8px">${esc(T('lockNote'))}</p></div>
    <div class="set-sec"><h3>${esc(T('account'))}</h3>
      <p>${esc(fmt(T('signedInAs'), { e: core.user?.email || '' }))}</p>
      <div class="set-row"><button class="btn" data-c="signout">${esc(T('signOut'))}</button></div></div>`;
}

/* ---------- 데이터 구역: 전체 삭제 (세 앱 공통) ----------
   opts: { label(): 버튼 글자, count(): 지울 기록 수, backup(): 백업 파일 내려받기(성공하면 true, 지울 것이 없으면 'empty'), wipe(): 실제 삭제 } */
export function mountWipeSection(container, opts) {
  const render = () => {
    const n = opts.count();
    container.innerHTML = `<div class="set-sec"><h3>${esc(T('dataTitle'))}</h3><p>${esc(T('wipeDesc'))}</p>
      <div class="set-row"><button class="btn danger solid" data-wipe ${n ? '' : 'disabled'}>${esc(opts.label())}</button></div></div>`;
  };
  container.addEventListener('click', async e => {
    if (!e.target.closest('[data-wipe]')) return;
    container.closest('dialog')?.close();
    await runWipe(opts);
  });
  render();
  return { render };
}
async function runWipe(opts) {
  const tt = toast(T('wipeBackingUp'), { ms: 0 });
  let ok = false;
  try { ok = await opts.backup(); } catch (e) { console.error(e); }
  tt.dismiss();
  if (ok === 'empty') { toast(T('wipeEmpty')); return; }
  if (!ok) { toast(T('wipeBackupFail'), { kind: 'err', ms: 8000 }); return; }
  const word = T('wipeWord');
  const go = await new Promise(res => {
    const d = document.createElement('dialog');
    d.innerHTML = `<div class="dlg"><h2></h2><p></p><p class="wipe-hint"></p>
      <input class="input" id="wipeInput" autocomplete="off" autocapitalize="off" spellcheck="false" style="margin-top:8px">
      <div class="dlg-actions"><button class="btn" data-w="cancel">${esc(T('cancel'))}</button><button class="btn danger solid" data-w="go" disabled>${esc(T('wipeGo'))}</button></div></div>`;
    d.querySelector('h2').textContent = opts.label();
    d.querySelector('p').textContent = T('wipeConfirmBody');
    d.querySelector('.wipe-hint').textContent = fmt(T('wipeTypeHint'), { w: word });
    const input = d.querySelector('#wipeInput'), btn = d.querySelector('[data-w="go"]');
    input.placeholder = word;
    input.addEventListener('input', () => { btn.disabled = input.value.trim() !== word; });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing && !btn.disabled) { e.preventDefault(); btn.click(); } });
    let done = false;
    const finish = v => { if (done) return; done = true; res(v); if (d.open) d.close(); d.remove(); };
    d.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) finish(b.dataset.w === 'go'); });
    d.addEventListener('close', () => finish(false));
    document.body.appendChild(d); d.showModal(); input.focus();
  });
  if (!go) return;
  const t2 = toast(T('wiping'), { ms: 0 });
  try { await opts.wipe(); t2.dismiss(); toast(T('wipeDone')); }
  catch (e) { t2.dismiss(); console.error(e); toast(e && e.message === 'offline' ? T('needOnline') : T('errSave'), { kind: 'err', ms: 7000 }); }
}

/* ---------- 오프라인 실행(PWA) ---------- */
function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register(core.root + 'sw.js').catch(() => {});
}
