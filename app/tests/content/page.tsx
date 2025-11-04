'use client';

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const initialMarkdown = `# Markdown Editor\n\nType on the left. Preview on the right.\n\n## Features\n- Live preview\n- GitHub Flavored Markdown (tables, task lists, code)\n\n### Code\n\n\`\`\`ts\nconst greet = (name: string) => \`Hello, \${name}!\`\n\`\`\`\n\n### Table\n\n| Name | Role |\n| ---- | ---- |\n| Alice | Admin |\n| Bob | User |\n\n### Tasks\n- [x] Wire up editor\n- [ ] Add persistence\n\n**Enjoy writing!**`;

export default function Page() {
  const [value, setValue] = useState<string>(initialMarkdown);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const md = useMemo(() => value, [value]);

  return (
    <main style={{ height: '100vh', display: 'grid' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          height: '100%',
        }}
      >
        <section
          style={{
            height: '100%',
            borderRight: '1px solid #222',
            background: 'linear-gradient(180deg, #0b0b0b, #121212)',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          <header style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Editor</h3>
            <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <p>{md.length} chars</p>
                <button>Save</button>
                <button>Undo</button>
                <button>Redo</button>
              </div>
            </div>
          </header>
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="Write markdown here…"
            style={{
              width: '100%',
              height: 'calc(100% - 36px)',
              resize: 'none',
              background: '#0d0d0d',
              color: '#eee',
              border: '1px solid #333',
              outline: 'none',
              borderRadius: 8,
              padding: 12,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
        </section>

        <section
          style={{
            height: '100%',
            background: 'linear-gradient(180deg, #0b0b0b, #121212)',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          <header style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Preview</h3>
            <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <p>Page# 1</p>
                <button>Previous</button>
                <button>Next</button>
              </div>
            </div>
          </header>
          <div
            style={{
              height: 'calc(100% - 36px)',
              overflow: 'auto',
              background: '#0d0d0d',
              color: '#eaeaea',
              border: '1px solid #333',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
          </div>
        </section>
      </div>
    </main>
  );
}
