# Anoto - Analog-Inspired Digital Yearly Planner

> _"The intentionality of ink, the permanence of paper, the convenience of digital"_

**Anoto** is a revolutionary yearly planner that brings the authentic experience of writing in a physical notebook to the digital world. Named after the pioneering digital pen technology, Anoto enforces the natural constraints of analog planning while adding the benefits of digital organization.

## 🎯 Core Philosophy

### Temporal Constraints as Features

- **Immutable Past**: Once a day passes, you cannot edit those entries - just like real ink on paper
- **Present & Future Only**: You can only write on today's page and future pages
- **Intentional Planning**: Forces thoughtful decision-making without the endless revision trap

### Authentic Analog Experience

- **Visual Notebook Layout**: Pages that look and feel like a real planner
- **Natural Navigation**: Flip through pages with realistic interactions
- **Writing Tools**: Authentic digital writing experience

## ✨ Planned Features

### 📖 Core Features (Priority 1)

- [ ] **Page-like Design**:
  - Realistic notebook pages with paper textures
  - Proper margins, lines, and binding visual
  - Individual page layout for each day
- [ ] **Daily Entry System**:
  - One page per day with note-taking space
  - Clear date headers and day organization
  - Smooth navigation between dates
- [ ] **Temporal Validation (Key Feature)**:
  - **No editing past dates**: Entries become read-only after midnight
  - **Today + Future only**: Write only on current and upcoming pages
  - Visual indicators showing which pages are editable vs. read-only
- [ ] **Future Reminders**: Notes on future pages automatically become reminders
- [ ] **Yearly Overview**: Navigate through months and see the full year spread

### 🎨 Enhanced Analog Experience (Priority 2)

- [ ] **Page Turn Animation**: Smooth, realistic page-flipping transitions
- [ ] **Page Turn Sound**: Authentic paper rustling sound effects
- [ ] **Writing Experience**:
  - Pen writing mode with ink-like flow
  - Pencil writing mode with softer, erasable feel
  - Writing sound effects (pen scratching, pencil writing)
- [ ] **Stylus Support**: Native support for digital pens and tablets

### 🔔 Additional Features (Priority 3)

- [ ] **Smart Reminders**: Notifications for notes on future dates
- [ ] **Search Functionality**: Find entries across all accessible pages
- [ ] **Export Options**: PDF export of completed pages/months
- [ ] **Theme Options**: Different paper styles (lined, dotted, blank)
- [ ] **Ambient Sounds**: Optional background audio while writing

### 💾 Data & Technical Features (Priority 4)

- [ ] **Local Storage**: All data stored locally with SQLite
- [ ] **Backup System**: Automatic local backups with restore capability
- [ ] **Accessibility**: High contrast modes, font size adjustments
- [ ] **Customization**: Different layouts, colors, and size options

## 🏗️ Technical Stack

### Frontend

- **React 18** with TypeScript for robust UI components
- **Vite** for fast development and building
- **CSS Animations** for smooth page transitions
- **Web Audio API** for realistic sound effects

### Backend

- **Rust** with Tauri for native performance and security
- **SQLite** for local data persistence
- **Serde** for efficient data serialization
- **Chrono** for date/time handling and validation

### Platform Support

- **Desktop**: Windows, macOS, Linux (via Tauri)
- **Future**: Mobile support planned for iOS/Android

## 🚀 Development Roadmap

### Phase 1: Core Foundation

1. Basic page layout and design system
2. Daily entry creation and display
3. Date navigation system
4. Temporal validation (no past editing)

### Phase 2: Enhanced Experience

1. Page turn animations and sounds
2. Writing tools (pen/pencil modes)
3. Audio feedback for writing

### Phase 3: Polish & Features

1. Reminders and notifications
2. Search and export capabilities
3. Themes and customization

## 🚀 Development Setup

### Prerequisites

- Node.js (18+) and pnpm
- Rust (latest stable)
- Tauri CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/anoto.git
cd anoto

# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

### Building

```bash
# Build for production
pnpm tauri build
```

## 🎨 Design Principles

1. **Temporal Constraints First**: The no-edit-past rule is the defining feature
2. **Visual Authenticity**: Every page should feel like real paper
3. **Intentional Interaction**: Each action should feel deliberate and meaningful
4. **Sensory Engagement**: Sound and animation enhance the analog feel
5. **Simplicity**: Clean interface that doesn't distract from writing

## 🤝 Contributing

We welcome contributions! Whether it's feature ideas, bug reports, or code contributions, please feel free to get involved.

## 📄 License

[Add your chosen license here]

---

_"In a world of infinite undo, sometimes the most powerful feature is permanence."_
