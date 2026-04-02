import { useState, useEffect } from 'react';
import {
  BookMarked, Bot, Wrench, FolderKanban, StickyNote,
  ChevronDown, ChevronRight, Plus, Trash2, Play,
  Terminal, Rocket, FileCheck, GitBranch, X
} from 'lucide-react';

type Tab = 'prompts' | 'agents' | 'skills' | 'harness' | 'memo';

interface MemoItem {
  id: string;
  text: string;
  createdAt: string;
}

const TABS: { id: Tab; label: string; icon: typeof BookMarked }[] = [
  { id: 'prompts', label: '프롬프트', icon: BookMarked },
  { id: 'agents', label: '에이전트', icon: Bot },
  { id: 'skills', label: '스킬', icon: Wrench },
  { id: 'harness', label: '하네스', icon: FolderKanban },
  { id: 'memo', label: '메모', icon: StickyNote },
];

const QUICK_COMMANDS = [
  { label: '/qa', desc: 'E2E 테스트', icon: FileCheck, color: '#0ed3b0' },
  { label: '/release', desc: 'Netlify 배포', icon: Rocket, color: '#4f6ef7' },
  { label: '/docs', desc: 'dev_log 업데이트', icon: Terminal, color: '#f4c542' },
  { label: 'git 백업', desc: 'add + commit + push', icon: GitBranch, color: '#7c3aed' },
];

// localStorage 키
const STORAGE_KEY = 'osori_panel_data';

function loadData(): { prompts: string[]; memos: MemoItem[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    prompts: [
      '오소리 부장, VibeBuilder 배포해줘',
      '오후3시 홈페이지 Netlify 배포 상태 확인해줘',
      'E2E 테스트 돌리고 결과 보고해',
      '가온글로벌 사이트 다국어 확인해줘',
    ],
    memos: [],
  };
}

function saveData(data: { prompts: string[]; memos: MemoItem[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function OsoriPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('prompts');
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState(loadData);
  const [newPrompt, setNewPrompt] = useState('');
  const [newMemo, setNewMemo] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);

  // 스킬/에이전트 파일 목록 로드 (서버에서)
  useEffect(() => {
    // 정적 목록 (실제로는 API로 가져올 수 있음)
    setSkills([
      'HYBRID_HARNESS_E2E.md — 하이브리드 테스트 표준',
      'CONNECT_AI_LAB_RULES.md — 글로벌 개발 규칙',
      'CONVERSATION_LOG_RULES.md — 세션 로그 규칙',
      'supanova-design-engine — 랜딩페이지 디자인',
      'supanova-premium-aesthetic — 프리미엄 디자인',
      'supanova-full-output — 완전 출력',
    ]);
    setAgents([
      'Explore — 코드베이스 탐색 (quick/medium/thorough)',
      'Plan — 구현 계획 설계',
      'General — 범용 코드 수정/생성',
      'claude-code-guide — Claude Code 가이드',
    ]);
  }, []);

  const addPrompt = () => {
    if (!newPrompt.trim()) return;
    const updated = { ...data, prompts: [newPrompt.trim(), ...data.prompts] };
    setData(updated);
    saveData(updated);
    setNewPrompt('');
  };

  const removePrompt = (idx: number) => {
    const updated = { ...data, prompts: data.prompts.filter((_, i) => i !== idx) };
    setData(updated);
    saveData(updated);
  };

  const addMemo = () => {
    if (!newMemo.trim()) return;
    const item: MemoItem = { id: Date.now().toString(), text: newMemo.trim(), createdAt: new Date().toLocaleString('ko-KR') };
    const updated = { ...data, memos: [item, ...data.memos] };
    setData(updated);
    saveData(updated);
    setNewMemo('');
  };

  const removeMemo = (id: string) => {
    const updated = { ...data, memos: data.memos.filter(m => m.id !== id) };
    setData(updated);
    saveData(updated);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (collapsed) {
    return (
      <div
        style={{ padding: '8px 12px', borderTop: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        onClick={() => setCollapsed(false)}
      >
        <ChevronRight size={14} style={{ color: '#888' }} />
        <span style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>🐟 오소리 도구</span>
      </div>
    );
  }

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }}>
      {/* 헤더 */}
      <div
        style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setCollapsed(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronDown size={14} style={{ color: '#888' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>🐟 오소리 도구</span>
        </div>
      </div>

      {/* 빠른 명령 바 */}
      <div style={{ padding: '4px 8px 8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {QUICK_COMMANDS.map(cmd => (
          <button
            key={cmd.label}
            onClick={() => copyToClipboard(cmd.label)}
            title={`${cmd.desc} — 클릭하면 복사`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
              background: `${cmd.color}15`, color: cmd.color,
              border: `1px solid ${cmd.color}30`, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <cmd.icon size={10} />
            {cmd.label}
          </button>
        ))}
      </div>

      {/* 탭 바 */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 4px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '6px 2px', fontSize: '9px', fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#4f6ef7' : '#999',
              borderBottom: activeTab === tab.id ? '2px solid #4f6ef7' : '2px solid transparent',
              background: 'none', border: 'none', borderBottomStyle: 'solid', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>

        {/* 프롬프트 메모 */}
        {activeTab === 'prompts' && (
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <input
                value={newPrompt}
                onChange={e => setNewPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPrompt()}
                placeholder="프롬프트 저장..."
                style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '11px', outline: 'none' }}
              />
              <button onClick={addPrompt} style={{ padding: '4px 8px', borderRadius: '6px', background: '#4f6ef7', color: '#fff', border: 'none', fontSize: '10px', cursor: 'pointer' }}>
                <Plus size={12} />
              </button>
            </div>
            {data.prompts.map((p, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', borderRadius: '6px', marginBottom: '3px', background: '#f8f8fc', cursor: 'pointer', fontSize: '11px', color: '#444' }}
                onClick={() => copyToClipboard(p)}
                title="클릭하면 복사"
              >
                <Play size={9} style={{ color: '#4f6ef7', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p}</span>
                <button onClick={(e) => { e.stopPropagation(); removePrompt(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  <X size={10} style={{ color: '#ccc' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 서브에이전트 리스트 */}
        {activeTab === 'agents' && (
          <div>
            <p style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>사용 가능한 서브에이전트</p>
            {agents.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', borderRadius: '6px', marginBottom: '3px', background: '#f0f7ff', fontSize: '11px', color: '#335' }}>
                <Bot size={10} style={{ color: '#4f6ef7', flexShrink: 0 }} />
                {a}
              </div>
            ))}
          </div>
        )}

        {/* 스킬 리스트 */}
        {activeTab === 'skills' && (
          <div>
            <p style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>.claude/skills/ + commands/</p>
            {skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', borderRadius: '6px', marginBottom: '3px', background: '#f5f0ff', fontSize: '11px', color: '#535' }}>
                <Wrench size={10} style={{ color: '#7c3aed', flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
        )}

        {/* 하네스 Gate 상태 */}
        {activeTab === 'harness' && (
          <div>
            <p style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>하이브리드 하네스 v2.0 Gate</p>
            {[
              { gate: 'Gate 0', name: 'CEO Review', cmd: '/plan-review', color: '#f4c542' },
              { gate: 'Gate 1', name: 'EM Design', cmd: '/design-review', color: '#4f6ef7' },
              { gate: 'Gate 2', name: 'Build (tsc)', cmd: 'npx tsc --noEmit', color: '#0ed3b0' },
              { gate: 'Gate 3', name: 'E2E Test', cmd: 'npm run test:vb', color: '#0ed3b0' },
              { gate: 'Gate 4', name: 'Deploy', cmd: '/release', color: '#7c3aed' },
            ].map((g, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '6px', marginBottom: '3px', background: `${g.color}10`, cursor: 'pointer', fontSize: '11px' }}
                onClick={() => copyToClipboard(g.cmd)}
                title={`${g.cmd} — 클릭하면 복사`}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: '#444', minWidth: '50px' }}>{g.gate}</span>
                <span style={{ color: '#666', flex: 1 }}>{g.name}</span>
                <code style={{ fontSize: '9px', color: g.color, background: `${g.color}15`, padding: '1px 4px', borderRadius: '3px' }}>{g.cmd}</code>
              </div>
            ))}
          </div>
        )}

        {/* 개발 메모 */}
        {activeTab === 'memo' && (
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <input
                value={newMemo}
                onChange={e => setNewMemo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMemo()}
                placeholder="메모 입력..."
                style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '11px', outline: 'none' }}
              />
              <button onClick={addMemo} style={{ padding: '4px 8px', borderRadius: '6px', background: '#f4c542', color: '#333', border: 'none', fontSize: '10px', cursor: 'pointer' }}>
                <Plus size={12} />
              </button>
            </div>
            {data.memos.length === 0 && (
              <p style={{ fontSize: '10px', color: '#bbb', textAlign: 'center', padding: '12px' }}>메모가 없습니다</p>
            )}
            {data.memos.map(m => (
              <div key={m.id} style={{ padding: '6px 8px', borderRadius: '6px', marginBottom: '3px', background: '#fffef5', border: '1px solid #f4c54230', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9px', color: '#bbb' }}>{m.createdAt}</span>
                  <button onClick={() => removeMemo(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                    <Trash2 size={10} style={{ color: '#ddd' }} />
                  </button>
                </div>
                <p style={{ color: '#555', lineHeight: 1.5 }}>{m.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
