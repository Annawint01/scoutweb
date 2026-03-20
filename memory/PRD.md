# Met Gala Fashion Brand Scout - PRD

## Problem Statement
Build a professional Met Gala Fashion Brand Scout application website for upcoming fashion brands seeking publicity. Three-stage flow: Landing page with Met Gala history & countdown, brand application form, Bitcoin payment page with live blockchain monitoring, and confirmation page.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB + httpx (async Blockstream API)
- **Database**: MongoDB (applications collection)
- **External API**: Blockstream.info public API for Bitcoin transaction monitoring

## User Personas
- **Fashion Brand Managers**: Submit applications to participate in Met Gala 2026
- **Emerging Designers**: Seeking Met Gala exposure for their brand

## Core Requirements
- Landing page with Met Gala history, founders, notable attendees, countdown to May 4, 2026
- Multi-field brand application form (name, email, address, category, etc.)
- Random BTC address assignment from 5 predefined addresses
- Live blockchain monitoring via Blockstream API with terminal-style activity log
- Congratulations page with email follow-up messaging
- Footer with support@metbrandscout.co on all pages
- Gold/bronze/dark luxury editorial aesthetic

## What's Been Implemented (Feb 2026)
- [x] Landing page with hero, countdown, history, museum info, notable attendees, CTA
- [x] Header with glassmorphism effect and Apply Now button
- [x] Application form with full validation (10 fields)
- [x] Backend API: POST/GET applications, payment status checking
- [x] Payment page with split layout (invoice + blockchain terminal)
- [x] Live blockchain polling via Blockstream API (15s interval)
- [x] Copy BTC address with fallback
- [x] Confirmation page with reference ID and email display
- [x] Footer on all pages with support email
- [x] Noise overlay, gold glow effects, terminal cursor animation
- [x] Framer Motion animations throughout

## Testing Results
- Backend: 100% (7/7 tests passed)
- Frontend: 98% (19/19 major features working)

## Prioritized Backlog
### P0 (Critical) - All Complete
### P1 (High)
- Email notification system for confirmed applications
- Admin dashboard for viewing/managing applications
### P2 (Medium)
- QR code generation for BTC address
- Application status tracking page
- Mobile responsive refinements
- Bitcoin price feed for dynamic USD/BTC conversion

## Next Tasks
1. Add QR code for BTC payment address
2. Build admin panel for application management
3. Implement email notifications (Resend/SendGrid)
4. Add real-time BTC/USD price conversion
