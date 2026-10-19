# Olympido — UI/UX Design System & Frontend Architecture

**Document Version:** 1.0.0  
**Target Clients:** Web App (`frontend/`), Mobile App (`mobile/`)  
**Design Philosophy:** Sleek Dark Mode, Academic Cyber-Aesthetics, Gamified Glassmorphism, Dynamic Micro-Animations

---

## 1. Visual Identity & Design Tokens

Olympido is designed to feel like an elite, high-stakes academic arena (combining the precision of international science Olympiads with the adrenaline of high-tier competitive gaming platforms).

### 1.1 Color Palette

```
/* Primary Theme Tokens */
--bg-canvas: #090D16;          /* Deep Void Navy/Black */
--bg-surface: #101726;         /* Elevated Surface */
--bg-surface-elevated: #162033;/* Modal / Card Surface */
--bg-glass: rgba(16, 23, 38, 0.75); /* Glassmorphism backdrop-blur */

/* Brand & Category Accents */
--brand-primary: #6366F1;      /* Electric Indigo (Primary CTA) */
--brand-secondary: #06B6D4;    /* Cyber Cyan (Physics & Tech) */
--brand-accent: #EC4899;       /* Neon Magenta (Special Events / Awards) */
--brand-gold: #F59E0B;         /* Rank 1 Gold */
--brand-silver: #94A3B8;       /* Rank 2 Silver */
--brand-bronze: #B45309;       /* Rank 3 Bronze */

/* Status Indicators */
--status-approved: #10B981;    /* Emerald Green */
--status-pending: #F59E0B;     /* Amber */
--status-rejected: #EF4444;    /* Crimson Red */
--status-live: #F43F5E;        /* Pulsing Rose Red */
```

### 1.2 Typography
- **Headings & Display**: `Outfit` or `Plus Jakarta Sans` (Geometric, confident, modern).
- **Body & Data**: `Inter` (Optimized for high legibility in tables and questions).
- **Code & Equations**: `JetBrains Mono` / KaTeX (Clean rendering of formulas and source code).

---

## 2. Core User Journeys & Wireframe Specifications

### 2.1 The Student Arena & Profile

#### A. Interactive Student Profile & Digital Scorecard
- **Header**: Avatar with animated Tier Ring (e.g., Novice Blue -> Master Gold), Username, Institution badge, Current Rating (e.g., `2140` - Candidate Master).
- **Weekly & Monthly Stats Strip**:
  - `Points This Week`: 1,450 pts (Rank #3 in regional pool)
  - `Points This Month`: 5,820 pts
  - `All-Time Contests`: 42 completed
  - `Win Ratio / Top 10%`: 78%
- **Scorecard Generator & Sharing Component**:
  - Every completed contest card has a "Share Scorecard" action.
  - Generates a sleek, high-resolution SVG/PNG card with:
    - Glowing border according to placement (Gold for 1st, Silver for 2nd, Bronze for 3rd, Cyber Cyan for top 10%).
    - Olympiad logo, contest title, participant name, rank, rating delta (`+85`), points gained (`+750`).
    - Cryptographic verification badge with scannable QR code.
    - One-click share to platform feed or download for LinkedIn/X/Instagram.

```
+-----------------------------------------------------------------------+
|  OLYMPIDO OFFICIAL DIGITAL SCORECARD                     [VERIFIED]  |
|                                                                       |
|  Student: Alex Morgan (@alexm)        Institution: Cambridge High     |
|  Contest: National Physics Olympiad 2026 - Semi-Finals                |
|                                                                       |
|  +--------------------+  +--------------------+  +-----------------+  |
|  |     FINAL RANK     |  |    RATING CHANGE   |  |  POINTS GAINED  |  |
|  |      #01 / 1,420   |  |   +112 (-> 2,240)  |  |   +1,250 PTS    |  |
|  +--------------------+  +--------------------+  +-----------------+  |
|                                                                       |
|  Percentile: 99.9% | Accuracy: 96% | Time: 1h 42m                    |
|  Verification QR Code: [ ||||  ||| ]   Hash: 0x8f2a...9b12            |
+-----------------------------------------------------------------------+
```

---

### 2.2 Leaderboard Experience (Weekly, Monthly, All-Time)

#### A. Filter & View Controls
- Segmented pill switches: `[ Weekly ]` `[ Monthly ]` `[ All-Time ]`.
- Subject drop-down: `[ All Categories ]` `[ Physics ]` `[ Mathematics ]` `[ Chemistry ]` `[ Informatics ]`.

#### B. Podium Presentation (Top 3)
- Visual 3D-styled glass podium with avatars, country flags, point tallies, and glowing medals.
  - **Center (Rank 1)**: Elevated highest, Gold particle effect, large avatar.
  - **Left (Rank 2)**: Silver aura.
  - **Right (Rank 3)**: Bronze aura.

#### C. Rankings Table (Rank 4 to 100)
- Columns: `Rank`, `Student`, `Institution`, `Tier`, `Rating`, `Points Gained`, `Trend` (↑ 4 positions / ↓ 1 position).
- Sticky user row at the bottom indicating the logged-in student's personal position and distance to next rank.

---

### 2.3 Organizer & School Experience

#### A. Institutional Domain Signup Modal
- Standard signup input detects domain dynamically:
  - If user enters `alice@gmail.com` under Organizer registration:
    - *Inline Warning*: *"Organizers must register with an official school or institution domain (e.g., .edu, .ac.uk, or your school's domain). Personal webmails are not permitted."*
  - If user enters `dr.smith@caltech.edu`:
    - *Validation Success*: Green checkmark, school profile pre-fills if domain is recognized.
  - Submits institutional accreditation proof document upload (PDF/PNG).

#### B. Contest Creation Wizard (4-Step Flow)
1. **Contest Essentials**: Title, Subject Category, Banner Image, Difficulty Level, Detailed Description & Academic Syllabus.
2. **Rules & Schedule**: Start time, Duration, Max attempts, Scoring rules (Base points, negative marking toggles).
3. **Problem Set & Questions**:
   - Multiple Choice Questions (with automatic scoring key).
   - Theoretical / Long-form Questions (with LaTeX support and PDF submission requirement).
4. **Review & Submit for Approval**:
   - Live preview of how the contest card and contest page will appear to students.
   - Confirmation button: `Submit to Admin for Review`.
   - Explanatory modal: *"Your contest will be audited by platform administrators within 24 hours before going live on the platform calendar."*

---

### 2.4 Admin Moderation & Approval Desk

```
+-----------------------------------------------------------------------------------+
|  OLYMPIDO ADMIN CONSOLE                                      [Admin: Superuser]   |
+-----------------------------------------------------------------------------------+
|  [ Dashboard ]  [ Contest Queue (5 Pending) ]  [ Institutions (2) ]  [ Users ]    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  PENDING CONTEST SUBMISSIONS:                                                     |
|                                                                                   |
|  [Card] National Junior Math Olympiad 2026                                        |
|         Submitted by: Stanford Math Circle (Domain: @stanford.edu - Verified)     |
|         Category: Mathematics | Schedule: Nov 15, 2026 | Duration: 120 mins       |
|                                                                                   |
|         [ Preview Questions ]   [ View Rules ]   [ Run Plagiarism Check ]         |
|                                                                                   |
|         Actions:                                                                  |
|         [✓ Approve & Publish]   [✎ Request Modifications]   [✗ Reject with Reason] |
+-----------------------------------------------------------------------------------+
```

- **Diff & Feedback Drawer**: Admin can highlight specific questions and type direct inline revision requests back to the organizer.
- **Audit History**: Every decision leaves a timestamped log with the reviewer ID.

---

## 3. Dynamic Micro-Animations & Motion Design

Smooth, tactile motion elevates the user experience and provides immediate feedback.

| UI Element | Trigger / State | Animation Behavior | Tech / Implementation |
| :--- | :--- | :--- | :--- |
| **Contest Countdown** | Real-time tick (< 1 hr to start) | Pulsing amber ring around timer badge; subtle glow expansion | CSS `@keyframes pulseGlow` |
| **Scorecard Reveal** | Contest results released | Card flip from backside to front with particle burst / confetti | Framer Motion `rotateY(180deg)` + Canvas Confetti |
| **Rank Shift** | Leaderboard update | Row slides smoothly up/down with green/red indicator flash | Framer Motion `layout` prop |
| **Admin Action** | Contest Approved | Row fades out with smooth height collapse and toast confirmation | CSS transition `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |
| **Domain Checker** | Typing organizer email | Real-time spinner transitions to animated green check or shake | CSS `@keyframes shake` |

---

## 4. Responsive Breakpoint Guidelines

- **Mobile (< 640px)**: Single column feed, floating action button for quick actions, scorecards optimized for mobile vertical screenshots (9:16 aspect ratio).
- **Tablet (640px - 1024px)**: Dual column cards, collapsible sidebar navigation.
- **Desktop (1024px+)**: Full multi-column dashboard with sticky user rankings widget, active contest countdown banner, and live leaderboard ticker.
