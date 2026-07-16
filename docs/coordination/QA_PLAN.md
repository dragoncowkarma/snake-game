# QA Plan

## authority_and_scope
This document outlines the QA strategy for the Snake Game MVP 1.0, derived from DEVELOPMENT_PLAN.md. It focuses on test coverage for pure logic, hybrid UI, accessibility, and robust lifecycles.

## coverage_summary
Total ACs: 28 (AC-G: 10, AC-L: 3, AC-U: 9, AC-R: 6)
Domain statement and branch coverage will be at least 90%, and 100% for named risk branches (collisions, input reversal, queue limits, full-board).

## master_ac_trace_matrix
| AC | Level | Fixture/seed | Environment | Failure oracle | Owner/task | Evidence |
|---|---|---|---|---|---|---|
| AC-G01 | unit+e2e | seed-01 | Node+Chromium | Space/Enter ignored. Left rejected. Right/Up/Down starts PLAYING. No immediate movement on command. Time elapses normally. | SG-011 | unit_result.json |
| AC-G02 | unit+contract | seed-01 | Node | Initial coordinates correct. Head advances exactly one cell per tick. | SG-011 | unit_result.json |
| AC-G03 | unit+e2e | input-rev | Node+Chromium | Opposite direction rejected, same direction ignored. Queue max 2. Multiple inputs consume one per tick. | SG-011 | e2e_result.json |
| AC-G04 | unit+contract | time-120 | Node | 30/60/120Hz runs with same delta yield identical snapshot. stepDuration subtracted before 5th food. | SG-011 | unit_result.json |
| AC-G05 | unit | eat-1 | Node | Food/snake non-overlap. Length +1, score +10, exact 1 event, exact 1 RNG call for new food. | SG-011 | unit_result.json |
| AC-G06 | unit | tail-pass | Node | DP-B05-A passes non-growth tail. DP-B05-B unbuildable (see SG-004-DN01). | SG-011 | unit_result.json |
| AC-G07 | unit+e2e | wall-1 | Node+Chromium | Wall+self collision. Reason, exact headCell/attemptedCell in 1 event. Terminal re-step idempotence. UI highlights. | SG-011 | e2e_result.json |
| AC-G08 | unit | speed-5 | Node | Slow/default formula and min limits. 5th food boundary. Tick decrease applied on next step. High score split. | SG-011 | unit_result.json |
| AC-G09 | unit | full-board | Node | Eat last free cell -> 0 freeCells -> 0 RNG calls -> foodEaten then gameWon sequence. | SG-011 | unit_result.json |
| AC-G10 | unit+e2e | restart-1 | Node+Chromium | Score/length/food/queue/accumulator reset. Exact listener/command/event count. No dup events. | SG-011 | e2e_result.json |
| AC-L01 | e2e | pause-blur | Chromium | Phase transitions to PAUSED immediately on window blur/focus-loss, tab hidden, or actual orientation transition. No auto-resume. | SG-018 | e2e_result.json |
| AC-L02 | unit+e2e | pause-1 | Node+Chromium | Accumulator 0, queue cleared, direction preserved. Direction/delta during pause ignored. Full tick resume. | SG-011 | e2e_result.json |
| AC-L03 | e2e | resize-1 | Chromium | Logical cells and phase remain identical after resize. Relayout triggered. Normal resize is non-pause. | SG-018 | e2e_result.json |
| AC-U01 | manual | N/A | 320x568 | 320px clipping/overlap none. Canvas fully visible. Focus visible. | SG-020 | screenshot.png |
| AC-U02 | manual | N/A | keyboard-only | Full keyboard journey: Focus ring complete loop across Menu, Canvas, and Restart. | SG-020 | manual_log.txt |
| AC-U03 | manual | N/A | Mobile | Buttons aria-labels, pointer 1:1, CSS >= 44x44px. | SG-020 | manual_log.txt |
| AC-U04 | manual | N/A | Chromium | Canvas entities shape/border distinct. DOM score/best/phase/end reason exist. | SG-020 | manual_log.txt |
| AC-U05 | e2e+manual | N/A | reduced motion, mute | Scale/movement Tween removed, outline/text feedback maintained. Audio muted. | SG-018 | manual_log.txt |
| AC-U06 | e2e+manual | N/A | Chromium+Safari | ActiveElement correct. Scroll/preventDefault limited to board. Spacebar no scroll. | SG-018 | e2e_result.json |
| AC-U07 | e2e | N/A | Chromium | aria-live polite region updates exactly once per phase. Tick live 0. | SG-018 | e2e_result.json |
| AC-U08 | manual | N/A | Chromium | Text contrast >= 4.5:1. UI boundary contrast >= 3:1. Canvas visually distinct. | SG-020 | manual_log.txt |
| AC-U09 | manual | N/A | safe-area | touch-action:none only on board. Native scroll elsewhere. | SG-020 | manual_log.txt |
| AC-R01 | e2e | localStorage-fail | Chromium | Storage access exceptions + corrupted data handled with defaults. | SG-018 | e2e_result.json |
| AC-R02 | manual | N/A | Chrome | Audio init/resume/autoplay failures handled. Game boots. | SG-020 | manual_log.txt |
| AC-R03 | deployed | N/A | /snake-game/ | Deployed distinct from production preview. HTTP 200 HTML, JS, CSS, favicon. | SG-026 | deploy_smoke.txt |
| AC-R04 | e2e | N/A | Node | Quality commands, Vite build 0, ESLint 0. | SG-005 | build_log.txt |
| AC-R05 | e2e | N/A | Chromium+Firefox+WebKit | console/network/404 exact 0. | SG-018 | e2e_result.json |
| AC-R06 | e2e | restart-20 | Chromium | After 20 restarts, exact listeners/inputs/timers/events. Baseline tick rate. | SG-018 | e2e_result.json |

## fixture_and_seed_catalog
- seed-01: Standard predictable RNG seed, exact valid GameState coordinates, phase, direction, queue, food, score, tickMs. Command/delta sequence exact. scripted RandomSource returns predefined upper bound and value. evidence: `unit_result.json`.
- input-rev: Fast opposing direction key sequence. Expected queue drops reverse.
- tail-pass: Snake head targets exact cell tail is vacating.
- eat-1: Food eaten. Exact RandomSource expectation (1 call).
- wall-1: Wall collision attemptedCell out of bounds.
- speed-5: 5th food eaten. Tick ms drop by 10ms.
- pause-blur: Window focus/blur sequence delta list.
- pause-1: Pause command injection sequence.
- resize-1: Resize delta list, no pause state changes.
- time-120: Mocked time accumulation corresponding to 120Hz (8.33ms deltas) yielding same snapshot as 30Hz.
- full-board: Board initialized with length 399. RNG bounds 0. 0 calls.
- localStorage-fail: Mocked DOM Exception for storage quota.
- restart-20: automated loop of die/restart 20회.

## boundary_scenarios_DP-B01_through_DP-B15
| Scenario | Setup | Action | Oracle | Evidence |
|---|---|---|---|---|
| DP-B01 | 1. State READY | 2. Space/Left, then Right/Up/Down | 3. Left rejected. Space ignored. Right/Up/Down accepted, starts PLAYING without immediate movement. | unit_result.json, e2e_result.json |
| DP-B02 | 1. PLAYING moving Right | 2. Up then Left in < 1 tick | 3. Queue 2 items max. Processes over 2 ticks. | unit_result.json, e2e_result.json |
| DP-B03 | 1. PLAYING moving Right | 2. Left, or Right, or Up then Down | 3. Left rejected. Right ignored. Down rejected (reverse of last accepted). | unit_result.json, e2e_result.json |
| DP-B04 | 1. PLAYING, food 1 cell away | 2. Multi-input | 3. Score/length exactly 1. Event 1. | unit_result.json, e2e_result.json |
| DP-B05 | 1. PLAYING | 2. Move to tail | 3. DP-B05-A: tail pass succeeds. DP-B05-B: growth+same-tail impossible. | unit_result.json |
| DP-B06 | 1. PLAYING | 2. Hit wall, hit self | 3. gameEnded emitted. Wall reason/self reason. exact headCell/attemptedCell. | unit_result.json, e2e_result.json |
| DP-B07 | 1. PLAYING length 399 | 2. Eat last food | 3. 0 RNG calls. foodEaten -> gameWon emitted. | unit_result.json |
| DP-B08 | 1. PLAYING | 2. 30/60/120Hz | 3. Same snapshots. stepDuration used properly before 5th food. | unit_result.json |
| DP-B09 | 1. PLAYING | 2. hidden 5s, resize | 3. hidden: paused, no tick overflow. resize: no pause. | e2e_result.json |
| DP-B10 | 1. PLAYING | 2. portrait to landscape | 3. Paused, orientation change requires resume. | manual_log.txt |
| DP-B11 | 1. Phase transitions | 2. UI flow | 3. expected activeElement, page scroll 0. | e2e_result.json |
| DP-B12 | 1. READY | 2. Pointer tap | 3. 1 command per tap. Game area scroll disabled. | e2e_result.json, manual_touch_log.txt |
| DP-B13 | 1. BOOT | 2. storage exception, corrupted | 3. default config used, boots. | e2e_result.json |
| DP-B14 | 1. PLAYING | 2. state change | 3. DOM score/best/phase/reason update. live region max 1, 0 per tick. | e2e_result.json |
| DP-B15 | 1. GAME_OVER | 2. 20 restarts | 3. 20 listener/input/timer/event processing counts exact. Baseline tick. | e2e_result.json |

## phase_command_policy_coverage
| Scenario | Setup | Action | Oracle | Evidence |
|---|---|---|---|---|
| PC-01 | MENU phase | selectDifficulty | accept | unit_result.json |
| PC-02 | MENU phase | start | accept | unit_result.json |
| PC-03 | MENU phase | toggleMute | accept | unit_result.json |
| PC-04 | MENU phase | direction / pause / resume / restart / returnToMenu | ignore | unit_result.json |
| PC-05 | READY phase | direction | validateDirection (Right/Up/Down accepted, Left rejected) | unit_result.json |
| PC-06 | READY phase | toggleMute | accept | unit_result.json |
| PC-07 | READY phase | selectDifficulty / start / pause / resume / restart / returnToMenu | ignore | unit_result.json |
| PC-08 | PLAYING phase | direction | validateDirection | unit_result.json |
| PC-09 | PLAYING phase | pause | accept | unit_result.json |
| PC-10 | PLAYING phase | toggleMute | accept | unit_result.json |
| PC-11 | PLAYING phase | selectDifficulty / start / resume / restart / returnToMenu | ignore | unit_result.json |
| PC-12 | PAUSED phase | resume | accept | unit_result.json |
| PC-13 | PAUSED phase | toggleMute | accept | unit_result.json |
| PC-14 | PAUSED phase | selectDifficulty / start / direction / pause / restart / returnToMenu | ignore | unit_result.json |
| PC-15 | GAME_OVER phase | restart | accept (terminal idempotence) | unit_result.json |
| PC-16 | GAME_OVER phase | returnToMenu | accept | unit_result.json |
| PC-17 | GAME_OVER phase | toggleMute | accept | unit_result.json |
| PC-18 | GAME_OVER phase | selectDifficulty / start / direction / pause / resume | ignore | unit_result.json |
| PC-19 | WON phase | restart | accept | unit_result.json |
| PC-20 | WON phase | returnToMenu | accept | unit_result.json |
| PC-21 | WON phase | toggleMute | accept | unit_result.json |
| PC-22 | WON phase | selectDifficulty / start / direction / pause / resume | ignore | unit_result.json |
| PC-23 | EVENT | RNG/Event 1 | Queue consumed -> Wall collision -> Food calc -> Self collision -> Add head -> Tail removed. | unit_result.json |
| PC-24 | EVENT | RNG/Event 2 | Score updated -> exact RNG -> events ordered (foodEaten then gameWon). | unit_result.json |

## viewport_browser_device_and_accessibility_matrix
| Stage | Viewport / Device | Browser / Engine | Responsible Task | Objective PASS | Evidence |
|---|---|---|---|---|---|
| PR | Desktop (N/A) | Chromium smoke | SG-005, SG-011 | format/lint/typecheck/unit/build OK | `pr_checks.txt` |
| nightly/release | Desktop (N/A) | Chromium, Firefox, WebKit | SG-018 | Playwright 0 failures, 0 flakiness | `e2e_result.json` |
| UI/release | 320x568, 1920x1080 | Chromium | SG-020 | Fixed seed visual regression passing | `visual_diff.png` |
| manual pre-release | 390x844, 768x1024, 1366x768 | Chrome, Edge, Firefox, Safari | SG-020 | Manual tests complete. | `manual_log.txt` |
| real device | Real iOS/Android | iOS Safari, Android Chrome | SG-020 | At least 1 run per OS passing. | `device_log.txt` |
| deployed | Desktop (N/A) | Chromium | SG-026 | H3a deployment on /snake-game/ returns HTTP 200. No public deploy before H3a. | `deploy_smoke.txt` |

## automation_manual_and_deployed_staging
| Category | Prerequisites & Ordered Steps | Objective PASS Condition | Evidence Filename |
|---|---|---|---|
| Manual Orientation | 1. Open on real device. 2. Rotate. | Game pauses. UI fits safe-area. | `SG-020_<AC>_<sha12>_<device>_<viewport>_<UTC>.txt` |
| Manual Touch | 1. Touch device. 2. Swipe board. 3. Swipe background. | Board prevents scroll. Background scrolls natively. | `SG-020_<AC>_<sha12>_<device>_<viewport>_<UTC>.txt` |
| Manual Screen Reader | 1. VoiceOver/TalkBack on. 2. State change. | Announces exactly once per phase. | `SG-020_<AC>_<sha12>_<device>_<viewport>_<UTC>.txt` |
| Manual Keyboard | 1. Desktop. 2. Tab across UI. | Focus loop completes. Visible ring. | `SG-020_<AC>_<sha12>_<device>_<viewport>_<UTC>.txt` |
| Manual Contrast/Motion/Mute | 1. OS settings active. 2. Check UI. | Contrast 4.5:1. Scale/movement Tween removed, outline kept. Muted. | `SG-020_<AC>_<sha12>_<device>_<viewport>_<UTC>.txt` |

## evidence_and_downstream_ownership
| ID | Description |
|---|---|
| SG-005 | Root quality/build commands and PR scaffold. |
| SG-008 | Deterministic fixture/seed helper and Playwright server. |
| SG-009 | /snake-game/ production preview and artifact/404. |
| SG-011 | Domain unit/contract and risk branch 100% coverage. |
| SG-012 | Fixed-step scheduler, delta/frame cap, listener cleanup. |
| SG-015 | Vertical QA, 320px, keyboard, multi-input, console, restart-20. |
| SG-016 | Lifecycle, pause/resize, storage, audio failure. |
| SG-018 | Production-dist E2E. |
| SG-020 | 3-engine/viewport/a11y/visual/real-device/negative-control. |
| SG-023 | Release-candidate whole regression. |
| SG-024 | Release workflow, SHA pin, permissions, deploy gate. |
| SG-026 | H3a Pages smoke. |
| SG-028 | Final release SHA UX/a11y/docs independent review. |

## flakiness_and_negative_control_policy
- Injected/scripted RNG and exact delta/command sequences mandatory.
- Contract snapshot/event oracles mandatory.
- `sleep()` and `waitForTimeout()` arbitrary wait strictly forbidden. DOM/event/network condition wait only.
- Failures must bundle seed, command trace, browser/version, viewport/device, SHA, screenshot, trace, console/network log.
- Domain statement/branch coverage >= 90%. collision, food, reverse input, queue cap, full-board risk branches 100%.
- SG-020 throwaway branch for mutation negative controls: intentionally mutate logic to verify tests catch it. Never merged. Evidence kept in SG-020 handoff.

## gaps_risks_and_decision_needed_register
| ID | Severity | Affected AC | Gap/Contradiction | Disposition | Owner/Gate | Evidence Needed |
|---|---|---|---|---|---|---|
| SG-004-DN01 | blocker | AC-G06, AC03, AC08 | DEVELOPMENT_PLAN tail collision fixture contradicts CONTRACTS.md rules forbidding food on snake. | human decision at or before H0b | Human | Human approval note |

Real device and VoiceOver/TalkBack evidence can only be generated in downstream tasks. Browser versions are recorded at execution. No public deploy prior to H3a. No live Issue/PR tracking due to lack of `gh`.

## NFR Catalog
| Area | Goal/Blocker | Oracle | Owner | Evidence |
|---|---|---|---|---|
| Performance | blocker | 400 cells 60fps, no >50ms long tasks, gzip <1MB, 0 external requests. | SG-018 | e2e trace |
| Security/Privacy | blocker | 0 PII/analytics/cookie/server sends. Only allowed localStorage keys. 0 HTML injection. | SG-018 | source audit |
| Supply Chain | blocker | Minimal Actions permissions. Full commit SHA pin. Dependabot/review on. clean npm ci. | SG-024 | workflow audit |
| Maintenance | blocker | Contract change needs decision+test. Clear domain boundaries. No dist commits. | SG-028 | review log |

## H0b_readiness_summary
SG-004 provides QA "plan" only. No execution PASS claimed. Antigravity submits, Codex independent review follows. SG-004-DN01 must be human-decided at or before H0b. H0b is human approval of SG-001~004 & D-001~006. Wave 1 and SG-005 must not start before H0b.
