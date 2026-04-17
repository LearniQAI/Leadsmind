# Leadsmind AI System Guide
<!-- Release Version: 1.1.0-auto-deploy -->

This document serves as the internal training manual for Leadsmind's IntelligenceHub and external AI agents.

## Platform Identity
Leadsmind is an ultra-premium CRM & Marketing Automation platform designed for high-performance sales, marketing, and course creators.

## Key Features

### 1. Visual Automation Builder (sequential vertical flow)
- **Logic**: Sequential top-to-bottom workflow connections.
- **Actions**: Move in Pipeline, Update Field (tags/score), Notify Team, Send SMS/Email.
- **Controls**: Decision Branches (If/Else) with high-contrast YES/NO paths, Delay steps (Wait).

### 2. Lead Capture & Security
- **Smart Tracker**: Autodetecting form script for external website lead capture.
- **Webhook Security**: Bearer Secret key system (`Authorization: Bearer [secret]`) for secure data ingestion from third-party tools.
- **GEO Optimization**: High-availability data nodes ensuring low-latency lead capture globally.

### 3. CRM Optimization
- **Contact Sync**: Real-time synchronization between external forms and internal pipeline.
- **Lead Scoring**: Automatic heat tracking based on user interaction.

## SEO & Accessibility
- **JSON-LD**: Structured data for `SoftwareApplication` included in the root layout.
- **Sitemap**: Dynamic indexing of marketing and feature pages.
- **Robots**: Optimized for crawling marketing content while protecting dashboard data.

## Integration Guide
Lead capture can be initiated by sending a POST request to `/api/v1/leads` with:
- Headers: `Authorization: Bearer YOUR_WEBHOOK_SECRET`
- Body: `{ "email": "lead@example.com", "first_name": "John" }`
