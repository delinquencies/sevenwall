import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { EvenniaHtmlBlock, EvenniaHtmlLines } from './evennia/EvenniaHtmlBlock';
import { useEvenniaWebClient } from './evennia/useEvenniaWebClient';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'oracle' | 'empty';

type InventorySlot = {
  name: string;
  rarity: Rarity;
  emoji: string;
  desc: string;
  identified: boolean;
  tag: string | null;
};

type FeedEntry = { text: string; highlight: string[] };

type Pressure = { name: string; tone: string };

type RosterPerson = { name: string; note: string; key: string };
type RosterFixture = { name: string; note: string; key: string };
type RosterObject = { name: string; rarity: Rarity; hint: string; key: string };

type PresentTooltipState = {
  title: string;
  body: string;
  kind: string;
  style: { left: number; top: number };
};

type ItemTooltipState = {
  item: InventorySlot;
  style: { left: number; top: number };
};

const glow: Record<Rarity, string> = {
  common: 'border-[#8c6940] shadow-[0_0_8px_rgba(184,146,98,0.08)]',
  uncommon: 'border-[#8c6940] shadow-[0_0_14px_rgba(30,255,0,0.24)]',
  rare: 'border-[#8c6940] shadow-[0_0_16px_rgba(0,112,221,0.28)]',
  epic: 'border-[#8c6940] shadow-[0_0_18px_rgba(163,53,238,0.3)]',
  oracle: 'border-[#8c6940] shadow-[0_0_16px_rgba(141,116,168,0.28)]',
  empty: 'border-[#8c6940] shadow-none',
};

const rarityLabel: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  oracle: 'Oracle',
  empty: '',
};

const rarityTone: Record<Rarity, string> = {
  common: 'text-[#e2d2b6]',
  uncommon: 'text-[#1eff00]',
  rare: 'text-[#66b5ff]',
  epic: 'text-[#d196ff]',
  oracle: 'text-[#c9b4e6]',
  empty: 'text-[#7b6448]',
};

export default function SevenwallMUDMockup() {
  const evennia = useEvenniaWebClient();
  const [commandLine, setCommandLine] = useState('');
  const [pressureTooltipOpen, setPressureTooltipOpen] = useState(false);
  const [pressureTooltipStyle, setPressureTooltipStyle] = useState({ top: 0, left: 0 });
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [itemTooltip, setItemTooltip] = useState<ItemTooltipState | null>(null);
  const [presentTooltip, setPresentTooltip] = useState<PresentTooltipState | null>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = terminalScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      setShowTopFade(el.scrollTop > 8);
    }
  }, [evennia.lines, evennia.status, evennia.error]);

  const handleTerminalScroll = () => {
    const el = terminalScrollRef.current;
    if (!el) return;
    setShowTopFade(el.scrollTop > 8);
  };

  const submitCommand = () => {
    const t = commandLine.trim();
    if (!t) return;
    evennia.sendText(t);
    setCommandLine('');
  };

  const handleCommandKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitCommand();
    }
  };

  const houseSerif = useMemo(
    () => ({
      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
    }),
    []
  );

  const woodTexture = {
    backgroundImage: `
      linear-gradient(90deg, rgba(255,255,255,0.03), transparent 8%, transparent 92%, rgba(0,0,0,0.2)),
      linear-gradient(90deg, #2b1a11 0%, #4e3220 8%, #6a452c 16%, #553723 24%, #3b2518 34%, #2a1a11 50%, #3f281a 66%, #5e3d27 80%, #6b452c 90%, #2b1a11 100%)
    `,
    backgroundBlendMode: 'screen, normal' as const,
  };

  const parchmentTexture = {
    backgroundImage: `
      radial-gradient(circle at 18% 14%, rgba(255,255,255,0.16), transparent 20%),
      radial-gradient(circle at 82% 76%, rgba(111,74,31,0.14), transparent 22%),
      linear-gradient(180deg, rgba(255,255,255,0.06), transparent 26%),
      linear-gradient(180deg, #d9c49e 0%, #ccb184 48%, #b99262 100%)
    `,
    backgroundBlendMode: 'screen, multiply, overlay, normal' as const,
  };

  const brassTexture = {
    backgroundImage: `
      linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.06) 18%, transparent 18%),
      linear-gradient(135deg, #f0dda7 0%, #cfa864 28%, #95692f 55%, #c89c58 80%, #f2e1b1 100%)
    `,
  };

  const feed: FeedEntry[] = [
    {
      text: 'Rain needles softly against the upper panes. Magistrate Vale stands beneath the arch, one gloved hand resting on a cane of dark wood.',
      highlight: ['Magistrate Vale', 'arch', 'dark wood'],
    },
    {
      text: 'A bell sounds somewhere deeper in the wall. The brazier-light gutters, then steadies. Something about the room feels watched.',
      highlight: ['bell', 'brazier-light', 'watched'],
    },
    {
      text: 'Claire Marchand lowers her gaze to the silver basin. The surface trembles without being touched.',
      highlight: ['Claire Marchand', 'silver basin'],
    },
    {
      text: 'A narrow-backed chair sits near the window. On it: a folded letter, black sealing wax, and a small hand mirror.',
      highlight: ['folded letter', 'black sealing wax', 'hand mirror'],
    },
  ];

  const pressures: Pressure[] = [
    {
      name: 'Watched',
      tone: 'Something in the room discourages swagger and rewards restraint.',
    },
    {
      name: 'Oathbound',
      tone: 'Promises feel heavier here. Deception wants to snag on the way out.',
    },
    {
      name: 'Mirror Static',
      tone: 'Reflections are carrying extra signal. Small gestures feel louder than spoken words.',
    },
  ];

  const roomRoster: {
    people: RosterPerson[];
    fixtures: RosterFixture[];
    objects: RosterObject[];
  } = {
    people: [
      { name: 'Magistrate Vale', note: 'Still, observant, difficult to read.', key: 'magistrate-vale' },
      { name: 'Claire Marchand', note: 'Near the basin, eyes lowered.', key: 'claire-marchand' },
    ],
    fixtures: [
      { name: 'Ash Moth', note: 'Pinned near the window-lamp.', key: 'ash-moth' },
      { name: 'Archway', note: 'Dark stone, damp at the lower joints.', key: 'archway' },
    ],
    objects: [
      { name: 'Hand Mirror', rarity: 'oracle', hint: 'Cold-backed glass with a slight ripple at the edge.', key: 'hand-mirror' },
      { name: 'Folded Letter', rarity: 'rare', hint: 'Heavy paper sealed in black wax.', key: 'folded-letter' },
      { name: 'Silver Basin', rarity: 'uncommon', hint: 'Still water, but never fully still.', key: 'silver-basin' },
      { name: 'Window Latch', rarity: 'common', hint: 'Old iron gone dark with weather.', key: 'window-latch' },
    ],
  };

  const linkTargets: Record<string, string> = {
    'Magistrate Vale': 'magistrate-vale',
    arch: 'archway',
    'Claire Marchand': 'claire-marchand',
    'silver basin': 'silver-basin',
    'folded letter': 'folded-letter',
    'hand mirror': 'hand-mirror',
  };

  const inventory: InventorySlot[] = [
    {
      name: 'Velanite Shard',
      rarity: 'epic',
      emoji: '💎',
      desc: 'A sacred shard with a cutting gleam. It catches light too eagerly.',
      identified: true,
      tag: 'Velanite-Touched',
    },
    {
      name: 'Wax Tablet',
      rarity: 'common',
      emoji: '📜',
      desc: 'A scored tablet for names, debts, or half-finished notes.',
      identified: false,
      tag: null,
    },
    {
      name: 'Brass Key',
      rarity: 'uncommon',
      emoji: '🗝️',
      desc: 'Old brass with a warded bite. Warm even when the room is cold.',
      identified: true,
      tag: 'Keyholder',
    },
    {
      name: 'Prayer Thread',
      rarity: 'rare',
      emoji: '🪡',
      desc: 'A binding thread used in small rites of remembrance and restraint.',
      identified: true,
      tag: 'Consecrated',
    },
    {
      name: 'Ash Coin',
      rarity: 'common',
      emoji: '🪙',
      desc: 'A city coin dulled by soot and handling.',
      identified: false,
      tag: null,
    },
    { name: 'Empty', rarity: 'empty', emoji: '', desc: '', identified: false, tag: null },
    { name: 'Empty', rarity: 'empty', emoji: '', desc: '', identified: false, tag: null },
    { name: 'Empty', rarity: 'empty', emoji: '', desc: '', identified: false, tag: null },
    { name: 'Empty', rarity: 'empty', emoji: '', desc: '', identified: false, tag: null },
  ];

  const pressureCount = pressures.length;

  const score = {
    name: 'Claire Marchand',
    wall: 'Seventh Wall',
    condition: 'Steady',
    stance: 'Watchful',
  };

  const environment = {
    exits: ['South (Main Hall)', "East (Magistrate's Office)"],
    time: 'Midday',
    weather: 'Indoors, Cool',
    timeEmoji: '☀️',
    weatherEmoji: '🪟',
  };

  const renderHighlightedText = (text: string, highlights: string[]) => {
    let output = text;
    highlights.forEach((h) => {
      output = output.replace(h, `|||${h}|||`);
    });

    return output.split('|||').map((part, i) => {
      const isHighlighted = highlights.includes(part);
      const targetKey = linkTargets[part] ?? null;
      const isActive = Boolean(targetKey && activeLink === targetKey);

      return isHighlighted ? (
        <button
          key={`${part}-${i}`}
          type="button"
          onMouseEnter={() => targetKey && setActiveLink(targetKey)}
          onMouseLeave={() => setActiveLink(null)}
          onFocus={() => targetKey && setActiveLink(targetKey)}
          onBlur={() => setActiveLink(null)}
          className={`mx-0.5 px-0.5 text-left transition ${
            isActive
              ? 'text-white bg-[rgba(201,171,124,0.12)] shadow-[0_0_10px_rgba(214,181,120,0.16)]'
              : 'text-[#eadfcf] hover:bg-[rgba(158,118,70,0.16)] hover:text-white'
          }`}
        >
          {part}
        </button>
      ) : (
        <span key={`${part}-${i}`}>{part}</span>
      );
    });
  };

  const placePressureTooltip = (event: MouseEvent | FocusEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 188;
    const gutter = 16;

    let left = rect.left - tooltipWidth + rect.width;
    let top = rect.bottom + 10;

    if (left < gutter) left = gutter;
    if (left + tooltipWidth > window.innerWidth - gutter) {
      left = window.innerWidth - tooltipWidth - gutter;
    }
    if (top + tooltipHeight > window.innerHeight - gutter) {
      top = rect.top - tooltipHeight - 10;
    }
    if (top < gutter) top = gutter;

    setPressureTooltipStyle({ left, top });
    setPressureTooltipOpen(true);
  };

  const placeInventoryTooltip = (event: MouseEvent | FocusEvent, item: InventorySlot) => {
    if (item.name === 'Empty') {
      setItemTooltip(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 260;
    const tooltipHeight = item.identified ? 156 : 132;
    const gutter = 16;

    let left = rect.right + 12;
    let top = rect.top - 6;

    if (left + tooltipWidth > window.innerWidth - gutter) {
      left = rect.left - tooltipWidth - 12;
    }
    if (left < gutter) left = gutter;
    if (top + tooltipHeight > window.innerHeight - gutter) {
      top = window.innerHeight - tooltipHeight - gutter;
    }
    if (top < gutter) top = gutter;

    setItemTooltip({ item, style: { left, top } });
  };

  const placePresentTooltip = (
    event: MouseEvent,
    item: RosterPerson | RosterFixture | RosterObject,
    kind: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 240;
    const tooltipHeight = 108;
    const gutter = 16;

    let left = rect.right + 12;
    let top = rect.top - 4;

    if (left + tooltipWidth > window.innerWidth - gutter) {
      left = rect.left - tooltipWidth - 12;
    }
    if (left < gutter) left = gutter;
    if (top + tooltipHeight > window.innerHeight - gutter) {
      top = window.innerHeight - tooltipHeight - gutter;
    }
    if (top < gutter) top = gutter;

    const body = 'note' in item ? item.note : item.hint;

    setPresentTooltip({
      title: item.name,
      body: body ?? 'No further detail.',
      kind,
      style: { left, top },
    });
  };

  const placardClass =
    'border border-[#7d5b36] p-3 text-[#2f2216] shadow-[inset_0_1px_0_rgba(255,245,220,0.28),0_6px_18px_rgba(0,0,0,0.16)]';

  return (
    <div className="h-screen overflow-hidden box-border bg-[#120d0a] p-2 text-stone-100 sm:p-3" style={houseSerif}>
      <div
        className="mx-auto h-full max-w-[1560px] border border-[#7a5a34] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,235,190,0.08)]"
        style={woodTexture}
      >
        <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
          <aside className="overflow-y-auto border-r border-[#5a3d24] bg-[rgba(32,19,12,0.2)] p-2">
            <div className="space-y-2">
              <div className={placardClass} style={parchmentTexture}>
                <div className="text-[9px] uppercase tracking-[0.32em] text-[#6f5435]">Where</div>
                <h1 className="mt-1 text-[1.35rem] font-semibold leading-tight tracking-tight text-[#2b1f15]">
                  The Magistrate’s Antechamber
                </h1>
                <p className="mt-2 text-[12px] leading-5 text-[#5c4430]">
                  Rain against the panes. Brazier-light. Black wood. Silver. Old vows in the plaster.
                </p>
                <div className="mt-3 space-y-2 text-[11px] text-[#24180f]">
                  <div className="border border-[#8f6d47] bg-[rgba(255,247,232,0.1)] px-2.5 py-2">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#7a5b39]">Obvious Exits</span>
                    <div className="mt-1 text-[13px] font-medium">{environment.exits.join(' • ')}</div>
                  </div>
                  <div className="border border-[#8f6d47] bg-[rgba(255,247,232,0.1)] px-2.5 py-2">
                    <div className="text-[13px] font-medium">
                      {environment.timeEmoji} Time:{' '}
                      <span className="text-[#5e4731] font-normal">{environment.time}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium">
                      {environment.weatherEmoji} Weather:{' '}
                      <span className="text-[#5e4731] font-normal">{environment.weather}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={placardClass} style={parchmentTexture}>
                <div className="mb-2 text-[9px] uppercase tracking-[0.32em] text-[#6f5435]">Present</div>
                <div className="space-y-3 text-[12px]">
                  <div>
                    <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[#7a5b39]">People</div>
                    <div className="space-y-0.5 text-[13px] leading-5 text-[#24180f]">
                      {roomRoster.people.map((person) => (
                        <button
                          key={person.name}
                          type="button"
                          onMouseEnter={(e) => {
                            setActiveLink(person.key);
                            placePresentTooltip(e, person, 'Person');
                          }}
                          onMouseLeave={() => {
                            setActiveLink(null);
                            setPresentTooltip(null);
                          }}
                          className={`block w-full text-left transition ${
                            activeLink === person.key
                              ? 'text-white bg-[rgba(201,171,124,0.12)] shadow-[0_0_10px_rgba(214,181,120,0.12)]'
                              : ''
                          }`}
                        >
                          {person.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[#7a5b39]">Fixtures</div>
                    <div className="space-y-0.5 text-[13px] leading-5 text-[#24180f]">
                      {roomRoster.fixtures.map((entry) => (
                        <button
                          key={entry.name}
                          type="button"
                          onMouseEnter={(e) => {
                            setActiveLink(entry.key);
                            placePresentTooltip(e, entry, 'Fixture');
                          }}
                          onMouseLeave={() => {
                            setActiveLink(null);
                            setPresentTooltip(null);
                          }}
                          className={`block w-full text-left transition ${
                            activeLink === entry.key
                              ? 'text-white bg-[rgba(201,171,124,0.12)] shadow-[0_0_10px_rgba(214,181,120,0.12)]'
                              : ''
                          }`}
                        >
                          {entry.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[#7a5b39]">Objects</div>
                    <div className="space-y-0.5 text-[13px] leading-5 text-[#24180f]">
                      {roomRoster.objects.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onMouseEnter={(e) => {
                            setActiveLink(item.key);
                            placePresentTooltip(e, item, 'Object');
                          }}
                          onMouseLeave={() => {
                            setActiveLink(null);
                            setPresentTooltip(null);
                          }}
                          className={`block w-full text-left transition ${
                            activeLink === item.key
                              ? 'text-white bg-[rgba(201,171,124,0.12)] shadow-[0_0_10px_rgba(214,181,120,0.12)]'
                              : ''
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 h-full min-h-0 border-x border-[#6c4b2d] bg-[#21160f] p-0">
            <div className="h-full border border-[#6b4b2f] bg-[#3a281b] p-1 shadow-[inset_0_1px_0_rgba(255,240,210,0.06)]">
              <div className="flex h-full min-h-0 flex-col border border-[#3d2e22] bg-[#0a0908] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),inset_0_18px_40px_rgba(255,255,255,0.015),inset_0_-20px_36px_rgba(0,0,0,0.22)]">
                <div className="relative h-full min-h-0 overflow-hidden px-0 py-0">
                  {showTopFade ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#0a0908] via-[rgba(10,9,8,0.92)] to-transparent" />
                  ) : null}
                  <div
                    ref={terminalScrollRef}
                    onScroll={handleTerminalScroll}
                    className="h-full overflow-y-auto px-4 py-4 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#5f4730_#120f0d]"
                  >
                    <div className="space-y-0">
                      {(evennia.status === 'bootstrapping' || evennia.status === 'connecting') &&
                      evennia.lines.length === 0 ? (
                        <p className="text-[1.08rem] leading-8 text-[#8f7e68]">Connecting to Evennia…</p>
                      ) : null}

                      {evennia.error ? (
                        <p className="text-[1.08rem] leading-8 text-[#e8a598]">{evennia.error}</p>
                      ) : null}

                      {evennia.lines.length > 0 ? (
                        <div className="text-[1.08rem] leading-8 text-[#e6dccd]">
                          <EvenniaHtmlLines lines={evennia.lines} />
                        </div>
                      ) : null}

                      {evennia.status === 'open' && evennia.lines.length === 0 && !evennia.error ? (
                        <p className="text-[0.95rem] leading-7 text-[#8f7e68]">
                          Connected — try <span className="text-[#c9b89a]">help</span>,{' '}
                          <span className="text-[#c9b89a]">look</span>, or play as usual.
                        </p>
                      ) : null}

                      {evennia.lines.length === 0 &&
                      (evennia.status === 'error' || evennia.status === 'idle') ? (
                        <>
                          <p className="pb-2 text-[10px] uppercase tracking-[0.2em] text-[#5c4d3a]">
                            Mock preview (server offline)
                          </p>
                          {feed.map((entry, idx) => (
                            <div key={idx} className="py-0">
                              <p className="text-[1.08rem] leading-8 text-[#e6dccd]">
                                {renderHighlightedText(entry.text, entry.highlight)}
                              </p>
                            </div>
                          ))}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 px-2 py-2">
                  <div className="mb-2 flex justify-end">
                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                      <div />
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center border border-[#77552e] text-[10px] font-semibold text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                        style={brassTexture}
                      >
                        N
                      </button>
                      <div />
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center border border-[#77552e] text-[10px] font-semibold text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                        style={brassTexture}
                      >
                        W
                      </button>
                      <div
                        className="flex h-7 w-7 items-center justify-center border border-[#77552e] text-[11px] text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                        style={brassTexture}
                      >
                        🧭
                      </div>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center border border-[#77552e] text-[10px] font-semibold text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                        style={brassTexture}
                      >
                        E
                      </button>
                      <div />
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center border border-[#77552e] text-[10px] font-semibold text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                        style={brassTexture}
                      >
                        S
                      </button>
                      <div />
                    </div>
                  </div>
                  <div className="space-y-2 border border-[#44362a] bg-[#080706] px-3 py-2 font-mono text-sm text-[#8f7e68]">
                    <div className="flex min-h-[2.75rem] items-end gap-2">
                      {evennia.prompt ? (
                        <div className="min-w-0 max-w-[min(100%,28rem)] shrink">
                          <EvenniaHtmlBlock html={evennia.prompt} />
                        </div>
                      ) : (
                        <span className="shrink-0 text-[#6b5c48]">&gt;</span>
                      )}
                      <textarea
                        value={commandLine}
                        onChange={(e) => setCommandLine(e.target.value)}
                        onKeyDown={handleCommandKeyDown}
                        rows={2}
                        className="min-h-[2.5rem] w-full resize-none bg-transparent text-[#d6c7b0] outline-none placeholder:text-[#5c4d3a]"
                        placeholder="Command (Enter to send, Shift+Enter for newline)"
                        spellCheck={false}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#2a231c] pt-2 text-[10px] text-[#6b5c48]">
                      <span className="uppercase tracking-wider">
                        Evennia: {evennia.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => void evennia.reconnect()}
                        className="border border-[#5a4330] px-2 py-0.5 text-[#b59b7a] hover:bg-[rgba(158,118,70,0.12)]"
                      >
                        Reconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="overflow-y-auto border-l border-[#5a3d24] bg-[rgba(32,19,12,0.2)] p-2">
            <div className="space-y-2">
              <div className={placardClass} style={parchmentTexture}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.32em] text-[#6f5435]">Inventory</div>
                    <div className="text-[11px] text-[#5d4630]">Hand slots</div>
                  </div>
                  <button
                    type="button"
                    className="border border-[#77552e] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                    style={brassTexture}
                  >
                    Open
                  </button>
                </div>
                <div className="mx-auto grid max-w-[168px] grid-cols-3 gap-1.5">
                  {inventory.map((slot, idx) => {
                    const shortName =
                      slot.name === 'Velanite Shard'
                        ? 'Shard'
                        : slot.name === 'Wax Tablet'
                          ? 'Tablet'
                          : slot.name === 'Brass Key'
                            ? 'Key'
                            : slot.name === 'Prayer Thread'
                              ? 'Thread'
                              : slot.name === 'Ash Coin'
                                ? 'Coin'
                                : '';

                    return (
                      <button
                        key={idx}
                        type="button"
                        onMouseEnter={(e) => placeInventoryTooltip(e, slot)}
                        onMouseLeave={() => setItemTooltip(null)}
                        onFocus={(e) => placeInventoryTooltip(e, slot)}
                        onBlur={() => setItemTooltip(null)}
                        className={`relative flex aspect-square flex-col items-center justify-center border bg-[rgba(83,56,33,0.24)] px-1 py-1 shadow-[inset_0_1px_0_rgba(255,245,220,0.18)] ${glow[slot.rarity]}`}
                      >
                        <div className="pointer-events-none select-none text-[22px] leading-none">{slot.emoji}</div>
                        {shortName ? (
                          <div className="mt-1 max-w-full truncate text-center text-[8px] uppercase tracking-[0.04em] text-[#dcc9ab]">
                            {shortName}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={placardClass} style={parchmentTexture}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[9px] uppercase tracking-[0.32em] text-[#6f5435]">Score</div>
                  <button
                    type="button"
                    className="relative border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2d1e10] shadow-[inset_0_1px_0_rgba(255,250,224,0.55)]"
                    style={brassTexture}
                    onMouseEnter={placePressureTooltip}
                    onFocus={placePressureTooltip}
                    onClick={() => setPressureTooltipOpen((prev) => !prev)}
                    onBlur={() => setPressureTooltipOpen(false)}
                    onMouseLeave={() => setPressureTooltipOpen(false)}
                  >
                    Pressures
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#5a4322] bg-[#e6cf9e] px-1 text-[10px] font-bold text-[#2e2110] shadow-md shadow-black/30">
                      {pressureCount}
                    </span>
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#5e4731]">
                  <div className="border border-[#8f6d47] bg-[rgba(255,247,232,0.1)] px-2.5 py-2">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7a5b39]">Name</div>
                    <div className="mt-0.5 text-[13px] font-medium text-[#24180f]">{score.name}</div>
                  </div>
                  <div className="border border-[#8f6d47] bg-[rgba(255,247,232,0.1)] px-2.5 py-2">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7a5b39]">Wall</div>
                    <div className="mt-0.5 text-[13px] font-medium text-[#24180f]">{score.wall}</div>
                  </div>
                  <div className="border border-[#8f6d47] bg-[rgba(255,247,232,0.1)] px-2.5 py-2">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7a5b39]">Condition</div>
                    <div className="mt-0.5 text-[13px] font-medium text-[#24180f]">{score.condition}</div>
                  </div>
                  <div className="border border-[#8f6d47] bg-[rgba(255,247,232,0.1)] px-2.5 py-2">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7a5b39]">Stance</div>
                    <div className="mt-0.5 text-[13px] font-medium text-[#24180f]">{score.stance}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {pressureTooltipOpen && (
        <div
          className="fixed z-50 w-[280px] border border-[#7b5c35] bg-[linear-gradient(180deg,#ddc9a4,#c8ae81_48%,#b89361)] p-3 text-[#2a1d12] shadow-[0_12px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,248,228,0.4)]"
          style={{ ...pressureTooltipStyle, ...houseSerif }}
        >
          <div className="mb-2 border-b border-[#8a6842] pb-1 text-[10px] uppercase tracking-[0.24em] text-[#6f5435]">
            Roleplay Pressures
          </div>
          <div className="space-y-2">
            {pressures.map((pressure) => (
              <div key={pressure.name} className="border border-[#8f6d47] bg-[rgba(255,247,232,0.14)] px-2.5 py-2">
                <div className="text-[13px] font-semibold text-[#24180f]">{pressure.name}</div>
                <p className="mt-0.5 text-[11px] leading-4 text-[#5e4731]">{pressure.tone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {presentTooltip && (
        <div
          className="fixed z-50 w-[240px] border border-[#2d2620] bg-[rgba(10,9,8,0.96)] px-3 py-3 text-[#eadfcf] shadow-[0_14px_30px_rgba(0,0,0,0.45),0_0_18px_rgba(0,0,0,0.22)]"
          style={{ ...presentTooltip.style, ...houseSerif }}
        >
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#9b866f]">{presentTooltip.kind}</div>
          <div className="mt-0.5 text-[14px] font-semibold text-[#eadfcf]">{presentTooltip.title}</div>
          <p className="mt-2 text-[12px] leading-5 text-[#d6c7b0]">{presentTooltip.body}</p>
        </div>
      )}

      {itemTooltip && (
        <div
          className="fixed z-50 w-[260px] border border-[#2d2620] bg-[rgba(10,9,8,0.96)] px-3 py-3 text-[#eadfcf] shadow-[0_14px_30px_rgba(0,0,0,0.45),0_0_18px_rgba(0,0,0,0.22)]"
          style={{ ...itemTooltip.style, ...houseSerif }}
        >
          <div className={`text-[14px] font-semibold ${rarityTone[itemTooltip.item.rarity]}`}>
            {itemTooltip.item.name}
          </div>
          <div className={`mt-0.5 text-[11px] uppercase tracking-[0.08em] ${rarityTone[itemTooltip.item.rarity]}`}>
            {rarityLabel[itemTooltip.item.rarity]}
          </div>
          <p className="mt-2 text-[12px] leading-5 text-[#d6c7b0]">{itemTooltip.item.desc}</p>
          {itemTooltip.item.identified ? (
            <div className="mt-3 border-t border-[#2f2923] pt-2 text-[11px] text-[#cdbd9f]">
              <span className="text-[#9fd39b]">Identified.</span> Adds tag:{' '}
              <span className="text-[#f0cf92]">{itemTooltip.item.tag}</span>
            </div>
          ) : (
            <div className="mt-3 border-t border-[#2f2923] pt-2 text-[11px] text-[#97876f]">
              Unidentified. No tag presently resolved.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
