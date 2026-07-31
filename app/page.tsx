import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowRight,
  Shield,
  Users,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  CheckSquare,
  Lock,
  Zap,
  BarChart3,
} from 'lucide-react'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/org/demo-firm')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Wakili</div>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium mb-6">
            ✨ Built for Modern Law Firms
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
          Your Digital Legal Workspace
        </h1>

        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Streamline case management, enhance team collaboration, and securely manage documents all in one unified platform. Designed for law firms of all sizes.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          {/* <Link href="/sign-up"> JAMES RENAME HERE */}
            <Link href="#">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Hero Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Shield, title: 'Secure & Compliant', desc: 'Enterprise-grade security' },
            { icon: Users, title: 'Team Collaboration', desc: 'Real-time teamwork' },
            { icon: Zap, title: 'Lightning Fast', desc: 'Built for performance' },
          ].map((feature, i) => (
            <Card key={i} className="p-6 text-left border-border/50 hover:border-primary/50 transition-colors">
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Everything You Need to Run Your Practice
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for legal professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FileText, title: 'Case Management', desc: 'Organize and track all your cases' },
              { icon: Users, title: 'Client Management', desc: 'Centralized client information' },
              { icon: MessageSquare, title: 'Team Communication', desc: 'Instant messaging & channels' },
              { icon: FileText, title: 'Document Hub', desc: 'Secure document storage & sharing' },
              { icon: Calendar, title: 'Calendar & Deadlines', desc: 'Never miss important dates' },
              { icon: CheckSquare, title: 'Task Management', desc: 'Track workflows and assignments' },
              { icon: Clock, title: 'Time Tracking', desc: 'Log billable hours effortlessly' },
              { icon: BarChart3, title: 'Analytics & Insights', desc: 'Track practice performance' },
            ].map((feature, i) => (
              <Card key={i} className="p-6 text-center border-border/50 hover:border-primary/50 hover:shadow-lg transition-all">
                <feature.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-tenant Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Multi-Tenant SaaS Platform
              </h2>
              <ul className="space-y-4">
                {[
                  'Manage multiple law firms from one platform',
                  'Dedicated organization workspaces',
                  'Complete data isolation and security',
                  'Role-based access control',
                  'Custom branding per organization',
                  'Scalable to any firm size',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-12 bg-secondary/30 border-primary/20 text-center">
              <Lock className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2 text-foreground">Enterprise Security</h3>
              <p className="text-muted-foreground mb-6">
                Your data is protected with AES-256 encryption and comprehensive audit logging
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ End-to-end encryption</p>
                {/* <p>✓ GDPR compliant</p> */}
                <p>✓ SOC 2 ready</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">
              Choose the plan that works for your firm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'KES 0',
                desc: 'Perfect for small teams',
                features: ['Up to 5 users', '5GB storage', 'Basic features', 'Community support'],
              },
              {
                name: 'Professional',
                price: 'KES 9999',
                desc: 'For growing practices',
                features: [
                  'Up to 50 users',
                  '500GB storage',
                  'All features',
                  'Priority support',
                  'Advanced analytics',
                ],
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For large organizations',
                features: [
                  'Unlimited users',
                  'Unlimited storage',
                  'Custom integrations',
                  'Dedicated support',
                  'SLA guarantee',
                ],
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`p-8 relative transition-all ${
                  plan.highlight
                    ? 'border-primary/50 ring-2 ring-primary/20 shadow-lg'
                    : 'border-border/50'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground mb-6 text-sm">{plan.desc}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.highlight
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground'
                  }`}
                >
                  Get Started
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join law firms using Wakili to streamline their operations and collaborate more effectively.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required. Full access for 14 days.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">Wakili</h4>
              <p className="text-sm text-muted-foreground">
                Modern legal workspace for progressive law firms.
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Security', 'Roadmap'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'GDPR', 'Security'],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2026 Wakili. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <Link key={social} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
