# QA Plan

## authority_and_scope
This document outlines the QA strategy for the Snake Game MVP 1.0, derived from DEVELOPMENT_PLAN.md. It focuses on test coverage for pure logic, hybrid UI, accessibility, and robust lifecycles.

## coverage_summary
Total ACs: 28 (AC-G: 10, AC-L: 3, AC-U: 9, AC-R: 6)
Domain statement and branch coverage will be at least 90%, and 100% for named risk branches (collisions, input reversal, queue limits).

## master_ac_trace_matrix
| AC | Level | Fixture/seed | Environment | Failure oracle | Owner/task | Evidence |
|---|---|---|---|---|---|---|
| AC-G01 | unit+e2e | seed-01 | Node+Chromium | Phase remains READY. Left rejected. Right starts PLAYING. | SG-011, SG-018 | unit_result.json |
| AC-G02 | unit+contract | seed-01 | Node | Head advances exactly one cell per tick. | SG-011 | unit_result.json |
| AC-G03 | unit+e2e | input-rev | Node+Chromium | Opposite direction rejected from queue. Max queue size is 2. | SG-011, SG-018 | e2e_result.json |
| AC-G04 | unit+contract | time-120 | Node | States identical for 30/60/120Hz runs with same delta. | SG-011 | unit_result.json |
| AC-G05 | unit | eat-1 | Node | Length increments by 1, score by 10 exactly. | SG-011 | unit_result.json |
| AC-G06 | unit | tail-pass | Node | Head entering vacating tail cell proceeds normally. | SG-011 | unit_result.json |
| AC-G07 | unit+e2e | wall-1 | Node+Chromium | gameEnded event contains exact attemptedCell. UI highlights it. | SG-011, SG-018 | e2e_result.json |
| AC-G08 | unit | speed-5 | Node | tickMs explicit decrease applied only on next simulation tick. | SG-011 | unit_result.json |
| AC-G09 | unit | full-board | Node | Phase becomes WON immediately upon eating last food. | SG-011 | unit_result.json |
| AC-G10 | unit+e2e | restart-1 | Node+Chromium | Score/length/food/queue/accumulator reset. No dup events. | SG-011, SG-018 | e2e_result.json |
| AC-L01 | e2e | N/A | Chromium | Phase transitions to PAUSED immediately on visibility hidden. | SG-018 | e2e_result.json |
| AC-L02 | unit+e2e | pause-1 | Node+Chromium | Accumulator drops to 0, queue cleared, direction preserved. | SG-011, SG-018 | e2e_result.json |
| AC-L03 | e2e | N/A | Chromium | Logical cells and phase remain identical after resize event. | SG-018 | e2e_result.json |
| AC-U01 | manual | N/A | 320x568 | No horizontal scrollbar, canvas fully visible, buttons clear. | SG-020 | screenshot.png |
| AC-U02 | manual | N/A | keyboard-only | Tab navigates Menu, Canvas, and Restart buttons successfully. | SG-020 | manual_log.txt |
| AC-U03 | manual | N/A | Mobile | Buttons have aria-labels, CSS dimensions >= 44x44px. | SG-020 | manual_log.txt |
| AC-U04 | manual | N/A | Chromium | Entities distinguishable by shape/border in grayscale mode. | SG-020 | manual_log.txt |
| AC-U05 | e2e+manual | N/A | reduced motion, mute | HUD updates properly without CSS transitions or audio. | SG-018, SG-020 | manual_log.txt |
| AC-U06 | e2e+manual | N/A | Chromium+Safari | Focus lands on correct control per phase. No Spacebar scroll. | SG-018, SG-020 | e2e_result.json |
| AC-U07 | e2e | N/A | Chromium | aria-live polite region updates exactly once per phase. | SG-018 | e2e_result.json |
| AC-U08 | manual | N/A | Chromium | Text contrast >= 4.5:1. UI boundary contrast >= 3:1. | SG-020 | manual_log.txt |
| AC-U09 | manual | N/A | safe-area | touch-action:none only on board/dpad. Rest scrolls natively. | SG-020 | manual_log.txt |
| AC-R01 | e2e | localStorage-fail | Chromium | Game initializes normally despite SecurityError in storage. | SG-018 | e2e_result.json |
| AC-R02 | manual | N/A | Chrome | Game boots and responds despite AudioContext rejection. | SG-020 | manual_log.txt |
| AC-R03 | deployed | N/A | /snake-game/ | HTML, JS, CSS, favicon return HTTP 200 on subpath. | SG-026 | deploy_smoke.txt |
| AC-R04 | e2e | N/A | Node | Vite build code 0. TypeScript/ESLint return 0 errors. | SG-005 | build_log.txt |
| AC-R05 | e2e | N/A | Chromium+Firefox+WebKit | Playwright reports 0 unhandled promise/runtime errors. | SG-018 | e2e_result.json |
| AC-R06 | e2e | restart-20 | Chromium | After 20 cycles, tick timing matches baseline, no lag. | SG-018 | e2e_result.json |

## fixture_and_seed_catalog
- seed-01: Standard predictable RNG seed
- input-rev: Fast opposing direction key sequence
- tail-pass: Snake head targets exact cell tail is vacating
- time-120: Mocked time accumulation corresponding to 120Hz
- full-board: Board initialized with length 399
- localStorage-fail: Mocked DOM Exception for storage quota
- restart-20: automated loop of die/restart 20회

## boundary_scenarios_DP-B01_through_DP-B15
| Scenario | Setup | Action | Oracle | Evidence |
|---|---|---|---|---|
| DP-B01 | READY state | Press Space, then Left, then Right | Space/Left ignored, Right starts game | unit+e2e |
| DP-B02 | PLAYING moving Right | Press Up then Left in 1 tick | Queue accepts both, processes over 2 ticks | unit+e2e |
| DP-B03 | PLAYING moving Right | Press Left, or Up then Down | Left rejected, Down rejected | unit+e2e |
| DP-B04 | PLAYING, food 1 cell away | Press multiple keys | Score/length increment exactly 1 | unit+e2e |
| DP-B05 | PLAYING | Move head into tail | tail passing vs collision detected | unit |
| DP-B06 | PLAYING collision | Head hits wall | event headCell/attemptedCell correct | unit+e2e |
| DP-B07 | PLAYING, length 399 | Eat last food | Game transitions to WON immediately | unit |
| DP-B08 | PLAYING | Run at 30Hz and 120Hz deltas | Final state is identical. stepDuration subtracted | unit+contract |
| DP-B09 | PLAYING | visibility hidden for 5s | Game paused, queue empty, no tick overflow | e2e |
| DP-B10 | PLAYING | portrait to landscape | Game paused, requires resume | manual |
| DP-B11 | State transitions | Flow through UI | Document activeElement matches expected | e2e |
| DP-B12 | READY | Pointer touch button | Exactly one command dispatched, scroll allowed | e2e+manual |
| DP-B13 | BOOT | localStorage throws exception | Default config used, game boots | e2e |
| DP-B14 | PLAYING | Event fires | DOM text updates, live region updates once | e2e |
| DP-B15 | GAME_OVER | Restart 20 times | 1 tick per interval, no overlapping listeners | e2e |

## phase_command_policy_coverage
| Scenario | Setup | Action | Oracle | Evidence |
|---|---|---|---|---|
| PC-01 | MENU phase | selectDifficulty | Difficulty setting updated | unit+e2e |
| PC-02 | MENU phase | start | Transition to READY phase | unit+e2e |
| PC-03 | MENU phase | toggleMute | Audio toggles, state unchanged | e2e+manual |
| PC-04 | MENU phase | direction / pause / resume / restart / returnToMenu | Commands ignored, state unchanged | unit+e2e |
| PC-05 | READY phase | direction (Right/Up/Down) | Game starts PLAYING, queue initialized | unit+e2e |
| PC-06 | READY phase | direction (Left) | Command rejected, state unchanged | unit+e2e |
| PC-07 | READY phase | toggleMute | Audio toggles, state unchanged | e2e+manual |
| PC-08 | READY phase | selectDifficulty / start / pause / resume / restart / returnToMenu | Commands ignored, state unchanged | unit+e2e |
| PC-09 | PLAYING phase | direction (Valid) | Added to queue (max 2) | unit+e2e |
| PC-10 | PLAYING phase | direction (Opposite/Full) | Command rejected / ignored | unit+e2e |
| PC-11 | PLAYING phase | pause | Transition to PAUSED | unit+e2e |
| PC-12 | PLAYING phase | toggleMute | Audio toggles, state unchanged | e2e+manual |
| PC-13 | PLAYING phase | selectDifficulty / start / resume / restart / returnToMenu | Commands ignored, state unchanged | unit+e2e |
| PC-14 | PAUSED phase | resume | Transition to PLAYING, accumulator=0 | unit+e2e |
| PC-15 | PAUSED phase | toggleMute | Audio toggles, state unchanged | e2e+manual |
| PC-16 | PAUSED phase | selectDifficulty / start / direction / pause / restart / returnToMenu | Commands ignored, state unchanged | unit+e2e |
| PC-17 | GAME_OVER phase | restart | Transition to READY, state reset | unit+e2e |
| PC-18 | GAME_OVER phase | returnToMenu | Transition to MENU | unit+e2e |
| PC-19 | GAME_OVER phase | toggleMute | Audio toggles, state unchanged | e2e+manual |
| PC-20 | GAME_OVER phase | selectDifficulty / start / direction / pause / resume | Commands ignored, state unchanged | unit+e2e |
| PC-21 | WON phase | restart | Transition to READY, state reset | unit+e2e |
| PC-22 | WON phase | returnToMenu | Transition to MENU | unit+e2e |
| PC-23 | WON phase | toggleMute | Audio toggles, state unchanged | e2e+manual |
| PC-24 | WON phase | selectDifficulty / start / direction / pause / resume | Commands ignored, state unchanged | unit+e2e |
| PC-25 | PLAYING phase | Normal Tick (no food) | Queue consumed -> Wall/Self collision -> Tail removed. RNG not called. No events generated. | unit |
| PC-26 | PLAYING phase | Eat Food | Food calc true -> Tail preserved -> Score updated -> RNG called exactly once -> `foodEaten` emitted. | unit |
| PC-27 | PLAYING phase | Eat Last Food (Full Board) | Score updated -> freeCells empty -> RNG NOT called -> `foodEaten` emitted then `gameWon` emitted in exact order. | unit |
| PC-28 | PLAYING phase | Collision | Wall/Self collision -> queue emptied -> `gameEnded` emitted exactly once. RNG not called. Terminal phase steps yield no additional events. | unit |

## viewport_browser_device_and_accessibility_matrix
- **Viewports:** 320x568, 390x844, 768x1024, 1366x768, 1920x1080.
- **Browsers:** Chromium, Firefox, WebKit, Chrome, Edge, Safari, iOS Safari, Android Chrome.
- **Accessibility:** keyboard-only, VoiceOver, TalkBack, reduced motion, mute, safe-area, touch-action, aria-live.
- **Stages:** PR, nightly, release, manual_pre_release, deployed_H3a. No public deploy required before H3a.

## automation_manual_and_deployed_staging
| Category | Stage | Objective PASS Condition | Prerequisites & Ordered Steps | Evidence Filename Rule |
|---|---|---|---|---|
| Auto E2E | PR, nightly, release | 0 test failures, 0 flakiness | Prerequisites: production build ready. Steps: Run Playwright against local dist. | `e2e_result.json` |
| Manual Real-Device (Orientation/Safe-area) | manual_pre_release | No UI hidden behind notch, pauses on orientation change | Prerequisites: Dist on local network. Steps: 1. Open on iOS/Android. 2. Rotate to landscape. 3. Verify pause and notch clearance. | `manual_orientation_log.txt` |
| Manual Real-Device (Touch Scope) | manual_pre_release | native page scroll disabled on board/dpad, allowed elsewhere | Prerequisites: Touch device. Steps: 1. Swipe on board. 2. Swipe on empty background. 3. Verify only background scrolls. | `manual_touch_log.txt` |
| Manual A11y (Screen Reader) | manual_pre_release | VoiceOver/TalkBack announces state changes exactly once | Prerequisites: Screen reader active. Steps: 1. Start game. 2. Pause game. 3. Verify announcements. | `manual_screenreader_log.txt` |
| Manual A11y (Keyboard Nav) | manual_pre_release | Focus ring visible, all interactive elements reachable | Prerequisites: Desktop browser. Steps: 1. Use Tab to navigate Menu -> Start -> Canvas. 2. Verify focus lands correctly. | `manual_keyboard_log.txt` |
| Manual A11y (Contrast/Motion/Mute) | manual_pre_release | Ratios >= 4.5:1/3:1, no CSS transitions, audio muted | Prerequisites: OS reduced motion/mute on. Steps: 1. Measure contrast. 2. Verify no animations. 3. Verify no sound. | `manual_contrast_log.txt` |
| Deployed Smoke | deployed_H3a | 200 OK for all assets, game playable | Prerequisites: H3a approval, code pushed to Pages. Steps: 1. Open /snake-game/. 2. Verify console. | `deploy_smoke.txt` |

## evidence_and_downstream_ownership
Tests and verification steps are implemented by downstream tasks: SG-005, SG-008, SG-009, SG-011, SG-012, SG-015, SG-016, SG-018, SG-020, SG-023, SG-024, SG-026, and SG-028.

## flakiness_and_negative_control_policy
- No arbitrary timeout sleep(). Use condition wait.
- negative control: Intentionally mutate product/test to verify tests actually catch failures (run in separate throwaway branch).

## gaps_risks_and_decision_needed_register
None currently.

## H0b_readiness_summary
QA plan complete and meets requirements. Ready for H0b.
