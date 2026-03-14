import React from 'react';
import { CheckCircle, Target, Zap } from 'lucide-react';
import AppShell from '../../components/common/AppShell';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AboutPage = () => {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About <span className="text-primary">EduLearn</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering students worldwide through accessible, high-quality online education
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              At EduLearn, we believe education should be accessible to everyone, everywhere. Our mission is to democratize learning by providing world-class educational content at an affordable price, enabling students to achieve their full potential.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We're committed to fostering a global community of learners, where diverse backgrounds and experiences enrich the educational journey for everyone.
            </p>
          </div>
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="text-primary mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Goal-Oriented Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Focused curriculum designed to help you achieve your learning objectives
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="text-primary mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Expert Instructors</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn from industry professionals with real-world experience
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Verified Certificates</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn recognized certificates upon course completion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Why Choose EduLearn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <h3 className="font-semibold text-foreground mb-2">Courses</h3>
                <p className="text-muted-foreground text-sm">
                  Diverse range of courses across multiple domains and skill levels
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <h3 className="font-semibold text-foreground mb-2">Students</h3>
                <p className="text-muted-foreground text-sm">
                  Join a thriving community of learners from around the world
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <h3 className="font-semibold text-foreground mb-2">Support</h3>
                <p className="text-muted-foreground text-sm">
                  Dedicated support team ready to help you anytime, anywhere
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-muted rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Accessibility</h3>
              <p className="text-muted-foreground">
                Education should be accessible to everyone, regardless of background or location
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Quality</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards in course content and instruction
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                Constantly evolving to provide the best learning experience
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Community</h3>
              <p className="text-muted-foreground">
                Building a supportive community where students help each other grow
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join thousands of students who are already transforming their careers with EduLearn
          </p>
          <Button variant="primary" size="lg">
            Explore Courses
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default AboutPage;
