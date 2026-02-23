# Wealth Tracker MVP

A 30-Year Wealth Tracker web app for student investors. Built with Node.js, Express, Vanilla JS, Firebase, and ready for Vercel deployment.

## Features

- Firebase Auth (Email/Password)
- Dashboard: Holdings for SCOM, KEGN, FTGH
- 50-50-50 Goal Tracker (progress bar)
- Smart Alerts (next dividend date for SCOM)
- "Invest My Change" calculator
- Black Tax Planning (10% investment deduction)
- 30-Year Compound Interest simulator
- Fintech dark mode UI (emerald green accents)

## Setup

1. `npm install`
2. Add your Firebase config to `src/firebase-config.js`
3. `npm run dev` to start locally
4. Deploy to Vercel for serverless API

## Folder Structure

- `/public` - Frontend HTML
- `/styles` - CSS
- `/src` - JS (frontend + server)
- `/api` - Serverless API endpoints

## Firestore Structure

- Collection: `users` → Document: `uid` → Sub-collection: `portfolio` (fields: ticker, sharesOwned, averagePrice)

---

**Replace all placeholder values and logic as needed for your Firebase project.**
