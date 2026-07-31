# Deployment Checklist

Complete checklist for deploying Wakili Legal Workspace to production.

## Pre-Deployment (Local Testing)

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] PostgreSQL installed and running
- [ ] Database created: `wakili_db`

### Code Setup
- [ ] Project cloned/extracted
- [ ] `pnpm install` completed
- [ ] `.env.local` created with DATABASE_URL
- [ ] `BETTER_AUTH_SECRET` generated and set
- [ ] `NODE_ENV=development` in `.env.local`

### Database Setup
- [ ] All SQL tables created
- [ ] Indexes created
- [ ] `pnpm seed` ran successfully
- [ ] Admin user created: admin@wakili.local / Admin123!

### Testing
- [ ] Application starts: `pnpm dev`
- [ ] http://localhost:3000 loads
- [ ] Can login with admin credentials
- [ ] Dashboard displays after login
- [ ] Can create new users in admin panel
- [ ] Failed login attempts tracked
- [ ] Account lockout works (5 attempts)
- [ ] Modules display based on role
- [ ] Logout clears session

### Code Quality
- [ ] No console errors in browser
- [ ] No console errors in terminal
- [ ] `pnpm lint` passes
- [ ] No TypeScript errors: `pnpm tsc --noEmit`
- [ ] All imports resolve correctly
- [ ] Database queries are parameterized (no SQL injection)

## Deployment Setup (Vercel)

### Vercel Configuration
- [ ] Vercel account created
- [ ] GitHub repository connected (or Vercel Git sync)
- [ ] Project created in Vercel
- [ ] Build settings configured
- [ ] Environment variables added to Vercel:
  - [ ] DATABASE_URL (Neon PostgreSQL)
  - [ ] BETTER_AUTH_SECRET
  - [ ] NODE_ENV=production
  - [ ] Any other required env vars

### Database Preparation
- [ ] Production PostgreSQL database created (Neon recommended)
- [ ] Database tables created in production
- [ ] Database indexes created in production
- [ ] `pnpm seed` run against production database
- [ ] Connection string tested
- [ ] Backup configured

### Security Pre-Check
- [ ] Passwords hashed with bcryptjs ✅
- [ ] HTTPS enabled (Vercel default) ✅
- [ ] Secure cookie flags set ✅
- [ ] CORS properly configured
- [ ] Environment variables not in code
- [ ] API keys not in repository
- [ ] `.env.local` added to `.gitignore` ✅
- [ ] No console.log with sensitive data
- [ ] Authentication middleware protecting routes ✅

### Performance Pre-Check
- [ ] Database indexes created
- [ ] API response times < 200ms
- [ ] No N+1 queries
- [ ] Images optimized
- [ ] Build output < 100MB
- [ ] Bundle size analyzed

## Deployment Steps

### Step 1: Push to Repository
```bash
git add .
git commit -m "Production deployment"
git push origin main
```
- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Branch pushed to GitHub

### Step 2: Deploy to Vercel
```bash
vercel --prod
```
OR manually deploy via Vercel dashboard
- [ ] Click "Deploy"
- [ ] Select correct branch
- [ ] Verify environment variables set
- [ ] Build completes successfully
- [ ] Deployment successful

### Step 3: Verify Deployment
- [ ] Application accessible at production URL
- [ ] Homepage loads correctly
- [ ] Login page works
- [ ] Can login with admin credentials
- [ ] Dashboard displays
- [ ] All modules accessible
- [ ] Admin panel functional
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Audit logs recording events

## Post-Deployment

### Immediate Checks (First Hour)
- [ ] Monitor application logs for errors
- [ ] Check error rate (should be < 1%)
- [ ] Verify database connection stable
- [ ] Test all major features
- [ ] Mobile responsiveness working
- [ ] API performance acceptable
- [ ] No resource exhaustion

### 24-Hour Checks
- [ ] Review application logs
- [ ] Check database performance
- [ ] Verify backups completed
- [ ] Monitor resource usage
- [ ] Test user creation workflow
- [ ] Verify email notifications (if configured)
- [ ] Check audit logs for activity

### Weekly Checks
- [ ] Review security logs
- [ ] Check failed login attempts
- [ ] Monitor database growth
- [ ] Analyze performance metrics
- [ ] Test backup restoration
- [ ] Update dependencies if needed
- [ ] Review user feedback

### Monthly Checks
- [ ] Database optimization review
- [ ] Security audit
- [ ] Performance optimization
- [ ] User role review
- [ ] Backup integrity test
- [ ] Disaster recovery test

## Production Settings

### Environment Variables
```
DATABASE_URL=postgresql://user:password@host:5432/wakili_db
BETTER_AUTH_SECRET=<generated_secret>
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourapp.vercel.app
```

### Security Headers (Vercel)
Configure in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Database Backups
- [ ] Daily automatic backups configured
- [ ] Backups stored in secure location
- [ ] Backup retention: 30 days minimum
- [ ] Restore procedure tested
- [ ] Backup alerts configured

### Monitoring & Alerts
- [ ] Error rate monitoring enabled
- [ ] Performance monitoring active
- [ ] Database alerts configured
- [ ] Uptime monitoring enabled
- [ ] Log aggregation setup (e.g., Sentry)
- [ ] Alert notifications configured

### SSL/TLS Certificate
- [ ] SSL certificate auto-renewed ✅ (Vercel default)
- [ ] HTTPS enforced
- [ ] No mixed content warnings
- [ ] Certificate valid

## Scaling Readiness

### If Users Increase to 100+
- [ ] Database connection pooling configured
- [ ] Query performance optimized
- [ ] Cache strategy implemented
- [ ] CDN for static assets configured
- [ ] Load balancing tested

### If Users Increase to 1,000+
- [ ] Read replicas configured
- [ ] Redis cache deployed
- [ ] Authentication service scaled
- [ ] Database sharding planned
- [ ] API rate limiting configured

### If Users Increase to 10,000+
- [ ] Multi-region deployment
- [ ] Microservices architecture
- [ ] Advanced caching layers
- [ ] Distributed database
- [ ] Advanced monitoring

## Maintenance Tasks

### Daily
- [ ] Monitor error rates
- [ ] Check application logs
- [ ] Verify database connectivity

### Weekly
- [ ] Review security logs
- [ ] Check backup status
- [ ] Analyze performance metrics
- [ ] Review user feedback

### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Database maintenance
- [ ] Dependency updates check
- [ ] Disaster recovery test

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing consideration
- [ ] Compliance review
- [ ] Disaster recovery drill

## Rollback Plan

If critical issues occur after deployment:

### Immediate (0-5 minutes)
```bash
# Revert to previous deployment in Vercel dashboard
# OR
vercel --prod --target production --env-alias=staging
```
- [ ] Identify issue
- [ ] Notify users
- [ ] Revert deployment
- [ ] Verify rollback successful

### Investigation (5-60 minutes)
- [ ] Analyze error logs
- [ ] Identify root cause
- [ ] Check database integrity
- [ ] Verify backup status

### Fix (1-24 hours)
- [ ] Fix issue locally
- [ ] Test thoroughly
- [ ] Get code review
- [ ] Redeploy with fix

## Go-Live Announcement

Before going live, notify users:

- [ ] Announcement email sent
- [ ] Support team trained
- [ ] Documentation updated
- [ ] FAQ prepared
- [ ] Support contact information provided
- [ ] Feedback mechanism setup

## Sign-Off

Production deployment approval:

- **Developer**: _________________ Date: _______
- **QA Lead**: _________________ Date: _______
- **Operations**: _________________ Date: _______
- **Project Manager**: _________________ Date: _______

## Documentation

- [ ] Deployment documentation updated
- [ ] API documentation current
- [ ] User guides updated
- [ ] Admin documentation current
- [ ] Setup guide finalized
- [ ] Troubleshooting guide updated

## Contact Information

**Deployment Contact**: ____________________________
**Support Lead**: ____________________________
**Database Admin**: ____________________________
**Security Officer**: ____________________________

---

**Deployment Date**: _______________
**Version**: 1.0
**Environment**: Production

## Post-Deployment Review

Review this checklist one week after deployment:

- [ ] All features working as expected
- [ ] No critical issues
- [ ] Performance acceptable
- [ ] Users satisfied
- [ ] Lessons learned documented
- [ ] Improvements identified

---

**Ready for Production**: ☐ YES ☐ NO

**Approved by**: _________________ Date: _______

---

For any issues or questions during deployment, refer to:
- SETUP_WINDOWS.md
- RBAC_IMPLEMENTATION.md
- IMPLEMENTATION_COMPLETE.md
- ARCHITECTURE.md
