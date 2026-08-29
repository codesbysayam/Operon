import React, { useState } from 'react';
import { CUSTOM_SKILLS } from '../data/agentsAndSkills';
import { Wand2, Code, Cpu, Zap, Sparkles, Search, Copy, Check, Filter } from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(CUSTOM_SKILLS.map((s) => s.category)))];

  const filteredSkills = CUSTOM_SKILLS.filter((skill) => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopySchema = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="skills-page"
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6 select-none font-sans max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="meta-label text-[#FFB000]">SKILL REGISTRY &amp; SCHEMAS</span>
              <span className="text-white/20">•</span>
              <span className="meta-label">Domain Capabilities</span>
            </div>
            <h1 className="page-title leading-tight">Custom Agent Skills</h1>
            <p className="text-xs text-white/50 mt-1">
              Reusable domain capability modules and typed input/output contracts attached to specialized autonomous agents.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000]" />
            <span className="text-white/80 font-medium">
              {CUSTOM_SKILLS.length} Custom Skills Active
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.06] overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skills or schemas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="p-6 rounded-[20px] bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#FFB000]">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{skill.name}</h3>
                    <span className="text-[10px] font-mono uppercase text-white/40">
                      CATEGORY: {skill.category}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono bg-white/[0.06] text-white/70 px-2.5 py-1 rounded border border-white/[0.08]">
                  {skill.usageCount.toLocaleString()} Executions
                </span>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">{skill.description}</p>

              {/* Schema Boxes */}
              <div className="space-y-3 font-mono text-[11px]">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase font-sans font-semibold tracking-wider mb-1">
                    <span>Input Schema</span>
                    <button
                      type="button"
                      onClick={() => handleCopySchema(`${skill.id}-in`, skill.inputSchema)}
                      className="text-white/40 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer font-sans normal-case"
                      title="Copy Input Schema"
                    >
                      {copiedId === `${skill.id}-in` ? (
                        <>
                          <Check className="w-3 h-3 text-[#22D3A7]" />
                          <span className="text-[#22D3A7]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-black/40 p-3 rounded-xl border border-white/[0.06] text-white/70 overflow-x-auto leading-relaxed">
                    {skill.inputSchema}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase font-sans font-semibold tracking-wider mb-1">
                    <span>Output Schema</span>
                    <button
                      type="button"
                      onClick={() => handleCopySchema(`${skill.id}-out`, skill.outputSchema)}
                      className="text-white/40 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer font-sans normal-case"
                      title="Copy Output Schema"
                    >
                      {copiedId === `${skill.id}-out` ? (
                        <>
                          <Check className="w-3 h-3 text-[#22D3A7]" />
                          <span className="text-[#22D3A7]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-black/40 p-3 rounded-xl border border-white/[0.06] text-[#22D3A7] overflow-x-auto leading-relaxed">
                    {skill.outputSchema}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="p-12 rounded-[20px] bg-white/[0.04] border border-white/[0.08] text-center space-y-3">
          <Wand2 className="w-8 h-8 text-white/20 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No skills match your search query</h3>
          <p className="text-xs text-white/40">Try searching for a different keyword or resetting the category filter.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="btn-secondary text-xs h-8 px-3.5 mt-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
